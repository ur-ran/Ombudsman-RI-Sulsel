<?php
// ============================================================
// api/profil.php — CRUD Profil Pages
// GET    ?action=list              → ambil list profil pages (slug, title)
// GET    ?action=get&slug=X        → ambil 1 profil page content
// POST   ?action=update            → update profil page
// ============================================================
error_reporting(0);
ini_set('display_errors', 0);
ob_start();

session_start();
require_once __DIR__ . '/db.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

function requireAuth() {
    if (empty($_SESSION['ori_admin_id'])) {
        ob_end_clean();
        jsonResponse(['success' => false, 'message' => 'Unauthorized. Silakan login terlebih dahulu.'], 401);
    }
}

// ── GET: LIST HALAMAN ──────────────────────────────────────────
if ($method === 'GET' && $action === 'list') {
    requireAuth();
    $db   = getDB();
    $stmt = $db->query("SELECT slug, title, subtitle, updated_at FROM profil_pages ORDER BY id ASC");
    $rows = $stmt->fetchAll();
    ob_end_clean();
    jsonResponse(['success' => true, 'data' => $rows]);
}

// ── GET: SATU HALAMAN ────────────────────────────────────────
if ($method === 'GET' && $action === 'get') {
    $slug = trim($_GET['slug'] ?? '');
    if (!$slug) { ob_end_clean(); jsonResponse(['success' => false, 'message' => 'Slug tidak valid.'], 400); }
    $db   = getDB();

    $stmt = $db->prepare("SELECT title, subtitle, content FROM profil_pages WHERE slug = ?");
    $stmt->execute([$slug]);
    
    $row = $stmt->fetch();
    ob_end_clean();
    if (!$row) jsonResponse(['success' => false, 'message' => 'Halaman tidak ditemukan.'], 404);
    jsonResponse(['success' => true, 'data' => $row]);
}

// ── POST: UPDATE HALAMAN ─────────────────────────────────────
if ($method === 'POST' && $action === 'update') {
    requireAuth();
    $body     = getJSONBody();
    $slug     = trim($body['slug'] ?? '');
    $title    = trim($body['title'] ?? '');
    $subtitle = trim($body['subtitle'] ?? '');
    $content  = trim($body['content'] ?? '');

    if (!$slug || !$title) { ob_end_clean(); jsonResponse(['success' => false, 'message' => 'Slug dan judul tidak boleh kosong.'], 400); }

    $db   = getDB();
    $stmt = $db->prepare("UPDATE profil_pages SET title = ?, subtitle = ?, content = ?, updated_at = NOW() WHERE slug = ?");
    $stmt->execute([$title, $subtitle, $content, $slug]);
    
    ob_end_clean();
    jsonResponse(['success' => true, 'message' => 'Halaman berhasil diperbarui.']);
}

ob_end_clean();
jsonResponse(['success' => false, 'message' => 'Invalid action.'], 400);
