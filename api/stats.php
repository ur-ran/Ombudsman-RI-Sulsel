<?php
// ============================================================
// api/stats.php — Dashboard Stats
// GET  → ambil stats
// POST ?action=update → simpan stats
// ============================================================
session_start();
require_once __DIR__ . '/db.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];

function requireAuth() {
    if (empty($_SESSION['ori_admin_id'])) {
        jsonResponse(['success' => false, 'message' => 'Unauthorized.'], 401);
    }
}

// ── GET: AMBIL STATS ─────────────────────────────────────────
if ($method === 'GET') {
    $db = getDB();
    $stmt = $db->query("SELECT * FROM dashboard_stats ORDER BY id ASC LIMIT 1");
    $row = $stmt->fetch();
    if (!$row) {
        // Default values
        $row = [
            'aduan'         => '',
            'capaian'       => '',
            'substansi'     => '',
            'target_persen' => 54.33
        ];
    }
    jsonResponse(['success' => true, 'data' => $row]);
}

// ── POST: SIMPAN STATS ───────────────────────────────────────
if ($method === 'POST') {
    requireAuth();
    $body = getJSONBody();
    $aduan     = trim($body['aduan'] ?? '');
    $capaian   = trim($body['capaian'] ?? '');
    $substansi = trim($body['substansi'] ?? '');
    $target    = floatval($body['target_persen'] ?? 54.33);

    $db = getDB();
    // Upsert: update jika ada, insert jika belum ada
    $stmt = $db->query("SELECT id FROM dashboard_stats LIMIT 1");
    $existing = $stmt->fetch();

    if ($existing) {
        $stmt = $db->prepare("UPDATE dashboard_stats SET aduan=?, capaian=?, substansi=?, target_persen=?, updated_at=NOW() WHERE id=?");
        $stmt->execute([$aduan, $capaian, $substansi, $target, $existing['id']]);
    } else {
        $stmt = $db->prepare("INSERT INTO dashboard_stats (aduan, capaian, substansi, target_persen, updated_at) VALUES (?,?,?,?,NOW())");
        $stmt->execute([$aduan, $capaian, $substansi, $target]);
    }
    jsonResponse(['success' => true, 'message' => 'Stats berhasil disimpan.']);
}

jsonResponse(['success' => false, 'message' => 'Method tidak dikenali.'], 405);
