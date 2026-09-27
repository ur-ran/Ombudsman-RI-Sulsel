<?php
// ============================================================
// api/auth.php — Login / Logout / Session check
// ============================================================
error_reporting(0);
ini_set('display_errors', 0);
ob_start();
session_start();

require_once __DIR__ . '/db.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';


// ── LOGIN ────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'login') {
    $body = getJSONBody();
    $username = trim($body['username'] ?? '');
    $password = $body['password'] ?? '';

    if (!$username || !$password) {
        jsonResponse(['success' => false, 'message' => 'Username dan password wajib diisi.'], 400);
    }

    $db = getDB();
    $stmt = $db->prepare("SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['ori_admin_id']   = $user['id'];
        $_SESSION['ori_admin_user'] = $user['username'];
        jsonResponse(['success' => true, 'username' => $user['username']]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Username atau password salah.'], 401);
    }
}

// ── LOGOUT ───────────────────────────────────────────────────
if ($method === 'POST' && $action === 'logout') {
    session_destroy();
    jsonResponse(['success' => true]);
}

// ── CEK SESSION ──────────────────────────────────────────────
if ($method === 'GET' && $action === 'check') {
    if (!empty($_SESSION['ori_admin_id'])) {
        jsonResponse(['success' => true, 'username' => $_SESSION['ori_admin_user']]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Not logged in.'], 401);
    }
}

jsonResponse(['success' => false, 'message' => 'Invalid action.'], 400);
