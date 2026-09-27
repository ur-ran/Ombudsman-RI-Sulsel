<?php
// ============================================================
// api/youtube.php — YouTube Video Fetch + Database Cache
// Menggunakan Invidious API (type=videos) untuk dapat video
// reguler saja (bukan Shorts), dengan fallback ke RSS feed.
// ============================================================
error_reporting(0);
ini_set('display_errors', 0);
ob_start();

session_start();
require_once __DIR__ . '/db.php';
setCORSHeaders();

define('YT_CHANNEL_ID',  'UCXK68HbChZQlWaf0li0g0FA');
define('YT_CHANNEL_URL', 'https://www.youtube.com/@ombudsmanrisulsel');
define('CACHE_MINUTES',  60); // refresh setiap 60 menit

// Invidious instances (dicoba berurutan jika yang pertama gagal)
define('INVIDIOUS_INSTANCES', serialize([
    'https://invidious.privacydev.net',
    'https://inv.nadeko.net',
    'https://invidious.lunar.icu',
    'https://y.com.sb',
    'https://invidious.nerdvpn.de',
]));

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'get';

// ── POST: PAKSA REFRESH (admin) ──────────────────────────────
if ($method === 'POST' && $action === 'refresh') {
    if (empty($_SESSION['ori_admin_id'])) {
        ob_end_clean();
        jsonResponse(['success' => false, 'message' => 'Unauthorized.'], 401);
    }
    $db = getDB();
    $db->exec("TRUNCATE TABLE youtube_cache");
    $count = fetchYouTubeVideos($db);
    ob_end_clean();
    jsonResponse([
        'success' => true,
        'message' => "Cache dihapus. Berhasil menyimpan {$count} video reguler (non-Shorts) dari YouTube."
    ]);
}

// ── GET: AMBIL VIDEO TERBARU ─────────────────────────────────
if ($method === 'GET') {
    $limit = max(1, intval($_GET['limit'] ?? 2));
    $db    = getDB();

    // Ambil cache
    $stmt = $db->prepare(
        "SELECT * FROM youtube_cache ORDER BY published_at DESC LIMIT ?"
    );
    $stmt->bindValue(1, max($limit, 20), PDO::PARAM_INT);
    $stmt->execute();
    $cached = $stmt->fetchAll();

    $needRefresh = true;
    if (!empty($cached)) {
        $diffMin = (time() - strtotime($cached[0]['cached_at'])) / 60;
        if ($diffMin < CACHE_MINUTES) {
            $needRefresh = false;
        }
    }

    if ($needRefresh) {
        $fetched = fetchYouTubeVideos($db);
        if ($fetched > 0) {
            $stmt->execute();
            $cached = $stmt->fetchAll();
        }
    }

    $result = array_slice($cached, 0, $limit);
    ob_end_clean();
    jsonResponse([
        'success'       => true,
        'data'          => $result,
        'from_cache'    => !$needRefresh,
        'channel_url'   => YT_CHANNEL_URL,
        'cache_minutes' => CACHE_MINUTES
    ]);
}

ob_end_clean();
jsonResponse(['success' => false, 'message' => 'Method tidak dikenali.'], 405);

// ============================================================
// FUNGSI UTAMA: Fetch video reguler (non-Shorts)
// Coba Invidious API dulu, fallback ke RSS jika gagal
// ============================================================
function fetchYouTubeVideos(PDO $db): int {
    // Coba Invidious API terlebih dahulu
    $count = fetchFromInvidious($db);
    if ($count > 0) return $count;

    // Fallback: RSS feed (dengan filter Shorts)
    return fetchFromRSS($db);
}

// ============================================================
// INVIDIOUS API — Ambil hanya video reguler (type=videos)
// Mengecualikan Shorts secara native
// ============================================================
function fetchFromInvidious(PDO $db): int {
    $channelId = YT_CHANNEL_ID;
    $instances = unserialize(INVIDIOUS_INSTANCES);
    $nowStr    = date('Y-m-d H:i:s');
    $count     = 0;

    foreach ($instances as $instance) {
        $url = "{$instance}/api/v1/channels/{$channelId}/videos?type=videos&page=1&sort_by=newest";

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_USERAGENT      => 'Mozilla/5.0 (compatible; ORIBot/1.0)',
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code !== 200 || !$resp) continue;

        $data = @json_decode($resp, true);
        if (empty($data['videos'])) continue;

        // Berhasil dapat data dari Invidious instance ini
        foreach ($data['videos'] as $vid) {
            $videoId   = $vid['videoId'] ?? '';
            if (!$videoId) continue;

            // Pastikan bukan Short (Invidious kadang masih include Shorts)
            // Shorts biasanya durasinya < 60 detik
            $duration = intval($vid['lengthSeconds'] ?? 999);
            if ($duration > 0 && $duration < 62) continue; // Skip jika < 62 detik

            $judul     = $vid['title'] ?? '';
            $deskripsi = $vid['description'] ?? '';
            // Selalu ambil thumbnail langsung dari YouTube dengan hqdefault agar dipastikan ada
            $thumbnail = "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg";

            $published  = $vid['published'] ?? time();
            $pubDate    = date('Y-m-d H:i:s', intval($published));

            // Upsert
            $check = $db->prepare("SELECT id FROM youtube_cache WHERE video_id = ?");
            $check->execute([$videoId]);
            $existing = $check->fetch();

            if ($existing) {
                $stmt = $db->prepare(
                    "UPDATE youtube_cache SET judul=?, deskripsi=?, thumbnail_url=?, published_at=?, cached_at=?
                     WHERE video_id=?"
                );
                $stmt->execute([$judul, $deskripsi, $thumbnail, $pubDate, $nowStr, $videoId]);
            } else {
                $stmt = $db->prepare(
                    "INSERT INTO youtube_cache (video_id, judul, deskripsi, thumbnail_url, published_at, cached_at)
                     VALUES (?,?,?,?,?,?)"
                );
                $stmt->execute([$videoId, $judul, $deskripsi, $thumbnail, $pubDate, $nowStr]);
            }
            $count++;
            if ($count >= 20) break;
        }

        if ($count > 0) break; // Berhasil, tidak perlu coba instance lain
    }

    return $count;
}

// ============================================================
// RSS FALLBACK — Jika semua Invidious instance gagal
// ============================================================
function fetchFromRSS(PDO $db): int {
    $rssUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=' . YT_CHANNEL_ID;
    $xml    = false;
    $nowStr = date('Y-m-d H:i:s');

    if (function_exists('curl_init')) {
        $ch = curl_init($rssUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_USERAGENT      => 'Mozilla/5.0 (compatible; ORIBot/1.0)',
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);
        $xml  = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code !== 200) $xml = false;
    }

    if (!$xml) {
        $ctx = stream_context_create([
            'http' => ['timeout' => 15, 'user_agent' => 'Mozilla/5.0'],
            'ssl'  => ['verify_peer' => false, 'verify_peer_name' => false]
        ]);
        $xml = @file_get_contents($rssUrl, false, $ctx);
    }

    if (!$xml || strlen($xml) < 100) return 0;

    libxml_use_internal_errors(true);
    $feed = simplexml_load_string($xml);
    if (!$feed) return 0;

    $ns    = $feed->getNamespaces(true);
    $media = $ns['media'] ?? 'http://search.yahoo.com/mrss/';
    $yt    = $ns['yt']    ?? 'http://www.youtube.com/xml/schemas/2015';
    $count = 0;

    foreach ($feed->entry as $entry) {
        $ytEl    = $entry->children($yt);
        $videoId = isset($ytEl->videoId) ? (string)$ytEl->videoId : '';
        if (!$videoId) {
            preg_match('/v=([A-Za-z0-9_-]{11})/', (string)($entry->link['href'] ?? ''), $m);
            $videoId = $m[1] ?? '';
        }
        if (!$videoId) continue;

        $linkHref  = (string)($entry->link['href'] ?? '');
        $judul     = (string)($entry->title ?? '');
        $published = (string)($entry->published ?? '');
        $pubDate   = $published ? date('Y-m-d H:i:s', strtotime($published)) : $nowStr;

        // Filter Shorts via link
        if (stripos($linkHref, '/shorts/') !== false) continue;
        if (preg_match('/#shorts?\b/i', $judul)) continue;

        $deskripsi = '';
        $thumbnail = "https://img.youtube.com/vi/{$videoId}/mqdefault.jpg";
        $mediaEl   = $entry->children($media);
        if (isset($mediaEl->group)) {
            $grp = $mediaEl->group;
            if (isset($grp->description)) $deskripsi = (string)$grp->description;
            if (isset($grp->thumbnail['url'])) {
                $t = (string)$grp->thumbnail['url'];
                if ($t) $thumbnail = $t;
            }
        }

        $check = $db->prepare("SELECT id FROM youtube_cache WHERE video_id = ?");
        $check->execute([$videoId]);
        $existing = $check->fetch();

        if ($existing) {
            $stmt = $db->prepare(
                "UPDATE youtube_cache SET judul=?, deskripsi=?, thumbnail_url=?, published_at=?, cached_at=?
                 WHERE video_id=?"
            );
            $stmt->execute([$judul, $deskripsi, $thumbnail, $pubDate, $nowStr, $videoId]);
        } else {
            $stmt = $db->prepare(
                "INSERT INTO youtube_cache (video_id, judul, deskripsi, thumbnail_url, published_at, cached_at)
                 VALUES (?,?,?,?,?,?)"
            );
            $stmt->execute([$videoId, $judul, $deskripsi, $thumbnail, $pubDate, $nowStr]);
        }
        $count++;
        if ($count >= 20) break;
    }

    return $count;
}
