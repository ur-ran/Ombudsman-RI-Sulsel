<?php
// ============================================================
// api/magang.php — REST API MORI (Magang Ombudsman RI)
// Supports: peserta, project, galeri
// ============================================================
session_start();
require_once __DIR__ . '/db.php';
setCORSHeaders();

$type   = $_GET['type'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_GET['_method']) && strtoupper($_GET['_method']) === 'PUT') {
    $method = 'PUT';
}
$id     = isset($_GET['id']) ? (int)$_GET['id'] : 0;

// ── FUNGSI UPLOAD FILE KEGIATAN ────────────────────────────
function uploadKegiatanFile() {
    if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $allowedExt = ['jpg', 'jpeg', 'png', 'mp4', 'heic', 'mov'];
    $ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt)) return null;

    $uploadDir = __DIR__ . '/../uploads/kegiatan/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    $filename  = uniqid('keg_') . '.' . $ext;
    $dest      = $uploadDir . $filename;
    if (move_uploaded_file($_FILES['file']['tmp_name'], $dest)) {
        return 'uploads/kegiatan/' . $filename;
    }
    return null;
}

// Validasi type
$allowedTypes = ['peserta', 'project', 'galeri'];
if (!in_array($type, $allowedTypes)) {
    jsonResponse(['success' => false, 'message' => 'Type tidak valid. Gunakan: peserta, project, galeri.'], 400);
}

$pdo = getDB();

// ── FUNGSI SYNC FOLDER → DB ──────────────────────────────────
// Scan folder /magang/ dan /uploads/magang/, daftarkan file baru ke DB
function syncFolderToGaleri($pdo) {
    $baseDir   = __DIR__ . '/../';
    $scanDirs  = ['magang', 'uploads/magang'];
    $imgExts   = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'JPG', 'JPEG', 'PNG', 'WEBP'];

    // Ambil semua path yang sudah terdaftar
    $existingPaths = [];
    foreach ($pdo->query("SELECT path FROM magang_galeri") as $row) {
        $existingPaths[$row['path']] = true;
    }

    $stmt = $pdo->prepare("INSERT INTO magang_galeri (path, caption, urutan, created_at) VALUES (?, '', 0, NOW())");
    $newCount = 0;

    foreach ($scanDirs as $dir) {
        $fullDir = $baseDir . $dir;
        if (!is_dir($fullDir)) continue;

        $files = scandir($fullDir);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) continue;

            $relPath = $dir . '/' . $file;
            if (isset($existingPaths[$relPath])) continue; // sudah ada

            $stmt->execute([$relPath]);
            $existingPaths[$relPath] = true;
            $newCount++;
        }
    }

    return $newCount;
}

// ── GET ──────────────────────────────────────────────────────
if ($method === 'GET') {
    if ($type === 'peserta') {
        $computedStatus = "CASE WHEN tanggal_mulai > CURDATE() THEN 'antrian' WHEN tanggal_selesai IS NOT NULL AND tanggal_selesai < CURDATE() THEN 'alumni' ELSE 'aktif' END";
        $selectFields = "*, $computedStatus as status";

        $status = $_GET['status'] ?? '';
        if ($status) {
            if (in_array($status, ['aktif', 'alumni', 'antrian'])) {
                $stmt = $pdo->prepare("SELECT $selectFields FROM magang_peserta HAVING status = ? ORDER BY tanggal_mulai DESC");
                $stmt->execute([$status]);
            } elseif (in_array($status, ['kampus', 'honor', 'kemenaker'])) {
                $stmt = $pdo->prepare("SELECT $selectFields FROM magang_peserta WHERE kategori = ? ORDER BY tanggal_mulai DESC");
                $stmt->execute([$status]);
            } else {
                $stmt = $pdo->query("SELECT $selectFields FROM magang_peserta ORDER BY tanggal_mulai DESC");
            }
        } else {
            $stmt = $pdo->query("SELECT $selectFields FROM magang_peserta ORDER BY tanggal_mulai DESC");
        }
        $rows = $stmt->fetchAll();
        // Stats
        $stats = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(kategori='kampus') as kampus,
                SUM(kategori='honor') as honor,
                SUM(kategori='kemenaker') as kemenaker,
                SUM(tanggal_mulai > CURDATE()) as antrian,
                SUM(tanggal_mulai <= CURDATE() AND (tanggal_selesai IS NULL OR tanggal_selesai >= CURDATE())) as aktif,
                SUM(tanggal_selesai IS NOT NULL AND tanggal_selesai < CURDATE()) as alumni
            FROM magang_peserta
        ")->fetch();
        jsonResponse(['success' => true, 'data' => $rows, 'stats' => $stats]);
    }

    if ($type === 'project') {
        $rows = $pdo->query("SELECT * FROM magang_project ORDER BY tanggal DESC")->fetchAll();
        jsonResponse(['success' => true, 'data' => $rows]);
    }

    if ($type === 'galeri') {
        // ── AUTO-SYNC: Scan folder magang dan daftarkan file baru ──
        $synced = syncFolderToGaleri($pdo);

        $limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 0;
        if ($limit > 0) {
            $stmt = $pdo->prepare("SELECT * FROM magang_galeri ORDER BY urutan ASC, created_at DESC LIMIT ?");
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->execute();
            $rows = $stmt->fetchAll();
        } else {
            $rows = $pdo->query("SELECT * FROM magang_galeri ORDER BY urutan ASC, created_at DESC")->fetchAll();
        }
        $total = (int)$pdo->query("SELECT COUNT(*) FROM magang_galeri")->fetchColumn();
        jsonResponse(['success' => true, 'data' => $rows, 'total' => $total, 'synced' => $synced]);
    }
}

// ── Wajib login untuk mutasi ─────────────────────────────────
if (empty($_SESSION['ori_admin_id'])) {
    jsonResponse(['success' => false, 'message' => 'Unauthorized. Silakan login admin.'], 401);
}

// ── POST ─────────────────────────────────────────────────────
if ($method === 'POST') {
    if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
        $body = $_POST;
    } else {
        $body = getJSONBody();
    }

    if ($type === 'peserta') {
        if (empty($body['nama']) || empty($body['tanggal_mulai'])) {
            jsonResponse(['success' => false, 'message' => 'Nama dan tanggal mulai wajib diisi.'], 400);
        }
        $stmt = $pdo->prepare("INSERT INTO magang_peserta (nama, nim, jurusan, kampus, tanggal_mulai, tanggal_selesai, kategori, foto, catatan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            trim($body['nama']),
            trim($body['nim'] ?? ''),
            trim($body['jurusan'] ?? ''),
            trim($body['kampus'] ?? ''),
            $body['tanggal_mulai'],
            $body['tanggal_selesai'] ?: null,
            in_array($body['kategori'] ?? '', ['kampus','honor','kemenaker']) ? $body['kategori'] : 'kampus',
            trim($body['foto'] ?? ''),
            trim($body['catatan'] ?? '')
        ]);
        jsonResponse(['success' => true, 'message' => 'Peserta berhasil ditambahkan.', 'id' => (int)$pdo->lastInsertId()]);
    }

    if ($type === 'project') {
        if (empty($body['judul']) || empty($body['tanggal'])) {
            jsonResponse(['success' => false, 'message' => 'Judul dan tanggal wajib diisi.'], 400);
        }
        $filePath = uploadKegiatanFile();
        $stmt = $pdo->prepare("INSERT INTO magang_project (judul, deskripsi, peserta, tanggal, kategori, file_path) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            trim($body['judul']),
            trim($body['deskripsi'] ?? ''),
            trim($body['peserta'] ?? ''),
            $body['tanggal'],
            trim($body['kategori'] ?? 'Umum'),
            $filePath
        ]);
        jsonResponse(['success' => true, 'message' => 'Kegiatan berhasil ditambahkan.', 'id' => (int)$pdo->lastInsertId()]);
    }

    if ($type === 'galeri') {
        if (empty($body['path'])) {
            jsonResponse(['success' => false, 'message' => 'Path foto wajib diisi.'], 400);
        }
        $stmt = $pdo->prepare("INSERT INTO magang_galeri (path, caption, urutan) VALUES (?, ?, ?)");
        $stmt->execute([
            trim($body['path']),
            trim($body['caption'] ?? ''),
            (int)($body['urutan'] ?? 0)
        ]);
        jsonResponse(['success' => true, 'message' => 'Foto berhasil ditambahkan ke galeri.', 'id' => (int)$pdo->lastInsertId()]);
    }
}

// ── PUT ──────────────────────────────────────────────────────
if ($method === 'PUT') {
    if (!$id) jsonResponse(['success' => false, 'message' => 'ID diperlukan.'], 400);
    if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
        $body = $_POST;
    } else {
        $body = getJSONBody();
    }

    if ($type === 'peserta') {
        if (empty($body['nama']) || empty($body['tanggal_mulai'])) {
            jsonResponse(['success' => false, 'message' => 'Nama dan tanggal mulai wajib diisi.'], 400);
        }
        $stmt = $pdo->prepare("UPDATE magang_peserta SET nama=?, nim=?, jurusan=?, kampus=?, tanggal_mulai=?, tanggal_selesai=?, kategori=?, foto=?, catatan=? WHERE id=?");
        $stmt->execute([
            trim($body['nama']),
            trim($body['nim'] ?? ''),
            trim($body['jurusan'] ?? ''),
            trim($body['kampus'] ?? ''),
            $body['tanggal_mulai'],
            $body['tanggal_selesai'] ?: null,
            in_array($body['kategori'] ?? '', ['kampus','honor','kemenaker']) ? $body['kategori'] : 'kampus',
            trim($body['foto'] ?? ''),
            trim($body['catatan'] ?? ''),
            $id
        ]);
        jsonResponse(['success' => true, 'message' => 'Data peserta berhasil diperbarui.']);
    }

    if ($type === 'project') {
        if (empty($body['judul']) || empty($body['tanggal'])) {
            jsonResponse(['success' => false, 'message' => 'Judul dan tanggal wajib diisi.'], 400);
        }
        $newFile = uploadKegiatanFile();
        if ($newFile) {
            $old = $pdo->prepare("SELECT file_path FROM magang_project WHERE id=?");
            $old->execute([$id]);
            $oldRow = $old->fetch();
            if ($oldRow && $oldRow['file_path'] && file_exists(__DIR__ . '/../' . $oldRow['file_path'])) {
                @unlink(__DIR__ . '/../' . $oldRow['file_path']);
            }
            $stmt = $pdo->prepare("UPDATE magang_project SET judul=?, deskripsi=?, peserta=?, tanggal=?, kategori=?, file_path=? WHERE id=?");
            $stmt->execute([trim($body['judul']), trim($body['deskripsi'] ?? ''), trim($body['peserta'] ?? ''), $body['tanggal'], trim($body['kategori'] ?? 'Umum'), $newFile, $id]);
        } else {
            $stmt = $pdo->prepare("UPDATE magang_project SET judul=?, deskripsi=?, peserta=?, tanggal=?, kategori=? WHERE id=?");
            $stmt->execute([trim($body['judul']), trim($body['deskripsi'] ?? ''), trim($body['peserta'] ?? ''), $body['tanggal'], trim($body['kategori'] ?? 'Umum'), $id]);
        }
        jsonResponse(['success' => true, 'message' => 'Kegiatan berhasil diperbarui.']);
    }

    if ($type === 'galeri') {
        $stmt = $pdo->prepare("UPDATE magang_galeri SET caption=?, urutan=? WHERE id=?");
        $stmt->execute([
            trim($body['caption'] ?? ''),
            (int)($body['urutan'] ?? 0),
            $id
        ]);
        jsonResponse(['success' => true, 'message' => 'Keterangan galeri berhasil diperbarui.']);
    }
}

// ── DELETE ───────────────────────────────────────────────────
if ($method === 'DELETE') {
    if (!$id) jsonResponse(['success' => false, 'message' => 'ID diperlukan.'], 400);

    if ($type === 'peserta') {
        $stmt = $pdo->prepare("DELETE FROM magang_peserta WHERE id=?");
        $stmt->execute([$id]);
        jsonResponse(['success' => true, 'message' => 'Peserta berhasil dihapus.']);
    }

    if ($type === 'project') {
        $stmt = $pdo->prepare("DELETE FROM magang_project WHERE id=?");
        $stmt->execute([$id]);
        jsonResponse(['success' => true, 'message' => 'Project berhasil dihapus.']);
    }

    if ($type === 'galeri') {
        // Ambil path dulu sebelum hapus
        $row = $pdo->prepare("SELECT path FROM magang_galeri WHERE id=?");
        $row->execute([$id]);
        $data = $row->fetch();
        if ($data && $data['path']) {
            $filePath = __DIR__ . '/../' . $data['path'];
            // Hanya hapus file jika ada di folder uploads/magang/
            if (str_starts_with($data['path'], 'uploads/magang/') && file_exists($filePath)) {
                @unlink($filePath);
            }
        }
        $stmt = $pdo->prepare("DELETE FROM magang_galeri WHERE id=?");
        $stmt->execute([$id]);
        jsonResponse(['success' => true, 'message' => 'Foto berhasil dihapus dari galeri.']);
    }
}

jsonResponse(['success' => false, 'message' => 'Method tidak diizinkan.'], 405);
