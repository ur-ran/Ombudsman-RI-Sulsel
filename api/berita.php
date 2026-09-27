<?php
// ============================================================
// api/berita.php — CRUD Berita
// GET    ?action=list              → ambil semua berita (admin)
// GET    ?action=published         → ambil berita published (index.html)
// GET    ?action=get&id=X          → ambil 1 berita
// POST   ?action=create            → tambah berita baru
// POST   ?action=update            → edit berita
// DELETE ?action=delete&id=X       → hapus berita
// ============================================================
error_reporting(0);
ini_set('display_errors', 0);
ob_start(); // buffer output untuk cegah html error merusak JSON

session_start();
require_once __DIR__ . '/db.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

function requireAuth() {
    if (empty($_SESSION['ori_admin_id'])) {
        ob_end_clean();
        jsonResponse(['success' => false, 'message' => 'Unauthorized. Silakan login terlebih dahulu.'], 401);
    }
}

// ── GET: BERITA PUBLISHED (untuk halaman utama) ──────────────
if ($method === 'GET' && $action === 'published') {
    $db    = getDB();
    $limit = max(1, intval($_GET['limit'] ?? 4));
    $stmt  = $db->prepare(
        "SELECT id, judul, kategori, tanggal, konten, gambar_path
         FROM berita
         WHERE status = 'published'
         ORDER BY tanggal DESC, created_at DESC
         LIMIT ?"
    );
    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();
    ob_end_clean();
    jsonResponse(['success' => true, 'data' => $rows]);
}

// ── GET: LIST SEMUA BERITA (admin) ───────────────────────────
if ($method === 'GET' && $action === 'list') {
    requireAuth();
    $db   = getDB();
    $stmt = $db->query("SELECT * FROM berita ORDER BY tanggal DESC, created_at DESC");
    $rows = $stmt->fetchAll();
    ob_end_clean();
    jsonResponse(['success' => true, 'data' => $rows]);
}

// ── GET: SATU BERITA ─────────────────────────────────────────
if ($method === 'GET' && $action === 'get') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) { ob_end_clean(); jsonResponse(['success' => false, 'message' => 'ID tidak valid.'], 400); }
    $db   = getDB();

    // Admin yang login bisa baca semua (termasuk draft); publik hanya bisa baca published
    $isAdmin = !empty($_SESSION['ori_admin_id']);
    if ($isAdmin) {
        $stmt = $db->prepare("SELECT * FROM berita WHERE id = ?");
        $stmt->execute([$id]);
    } else {
        $stmt = $db->prepare("SELECT id, judul, kategori, tanggal, konten, gambar_path FROM berita WHERE id = ? AND status = 'published'");
        $stmt->execute([$id]);
    }

    $row = $stmt->fetch();
    ob_end_clean();
    if (!$row) jsonResponse(['success' => false, 'message' => 'Berita tidak ditemukan.'], 404);
    jsonResponse(['success' => true, 'data' => $row]);
}

// ── POST: BUAT BERITA BARU ───────────────────────────────────
if ($method === 'POST' && $action === 'create') {
    requireAuth();
    $body     = getJSONBody();
    $judul    = trim($body['judul'] ?? '');
    $kategori = trim($body['kategori'] ?? 'Berita');
    $tanggal  = trim($body['tanggal'] ?? date('Y-m-d'));
    $status   = in_array($body['status'] ?? '', ['published', 'draft']) ? $body['status'] : 'published';
    $konten   = trim($body['konten'] ?? '');
    $gambar   = trim($body['gambar_path'] ?? '');

    if (!$judul) { ob_end_clean(); jsonResponse(['success' => false, 'message' => 'Judul tidak boleh kosong.'], 400); }

    $db   = getDB();
    $stmt = $db->prepare(
        "INSERT INTO berita (judul, kategori, tanggal, status, konten, gambar_path, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())"
    );
    $stmt->execute([$judul, $kategori, $tanggal, $status, $konten, $gambar]);
    $id = $db->lastInsertId();
    ob_end_clean();
    jsonResponse(['success' => true, 'message' => 'Berita berhasil ditambahkan.', 'id' => $id]);
}

// ── POST: UPDATE BERITA ──────────────────────────────────────
if ($method === 'POST' && $action === 'update') {
    requireAuth();
    $body     = getJSONBody();
    $id       = intval($body['id'] ?? 0);
    $judul    = trim($body['judul'] ?? '');
    $kategori = trim($body['kategori'] ?? 'Berita');
    $tanggal  = trim($body['tanggal'] ?? date('Y-m-d'));
    $status   = in_array($body['status'] ?? '', ['published', 'draft']) ? $body['status'] : 'published';
    $konten   = trim($body['konten'] ?? '');
    $gambar   = trim($body['gambar_path'] ?? '');

    if (!$id)    { ob_end_clean(); jsonResponse(['success' => false, 'message' => 'ID tidak valid.'], 400); }
    if (!$judul) { ob_end_clean(); jsonResponse(['success' => false, 'message' => 'Judul tidak boleh kosong.'], 400); }

    $db = getDB();
    if ($gambar) {
        // Hapus gambar lama jika ada gambar baru
        $stmt = $db->prepare("SELECT gambar_path FROM berita WHERE id = ?");
        $stmt->execute([$id]);
        $old = $stmt->fetch();
        if ($old && $old['gambar_path'] && $old['gambar_path'] !== $gambar
            && strpos($old['gambar_path'], 'images/') !== 0) {
            $oldFile = __DIR__ . '/../' . $old['gambar_path'];
            if (file_exists($oldFile)) @unlink($oldFile);
        }
        $stmt = $db->prepare(
            "UPDATE berita SET judul=?, kategori=?, tanggal=?, status=?, konten=?, gambar_path=?, updated_at=NOW()
             WHERE id=?"
        );
        $stmt->execute([$judul, $kategori, $tanggal, $status, $konten, $gambar, $id]);
    } else {
        $stmt = $db->prepare(
            "UPDATE berita SET judul=?, kategori=?, tanggal=?, status=?, konten=?, updated_at=NOW()
             WHERE id=?"
        );
        $stmt->execute([$judul, $kategori, $tanggal, $status, $konten, $id]);
    }
    ob_end_clean();
    jsonResponse(['success' => true, 'message' => 'Berita berhasil diperbarui.']);
}

// ── DELETE: HAPUS BERITA ─────────────────────────────────────
if ($method === 'DELETE' && $action === 'delete') {
    requireAuth();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) { ob_end_clean(); jsonResponse(['success' => false, 'message' => 'ID tidak valid.'], 400); }

    $db   = getDB();
    $stmt = $db->prepare("SELECT gambar_path FROM berita WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if ($row && $row['gambar_path'] && strpos($row['gambar_path'], 'images/') !== 0) {
        $file = __DIR__ . '/../' . $row['gambar_path'];
        if (file_exists($file)) @unlink($file);
    }
    $stmt = $db->prepare("DELETE FROM berita WHERE id = ?");
    $stmt->execute([$id]);
    ob_end_clean();
    jsonResponse(['success' => true, 'message' => 'Berita berhasil dihapus.']);
}

ob_end_clean();
jsonResponse(['success' => false, 'message' => 'Action tidak dikenali.'], 400);
