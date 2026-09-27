<?php
// ============================================================
// api/upload.php — Upload Gambar Berita
// POST multipart/form-data dengan field "gambar"
// ============================================================
session_start();
require_once __DIR__ . '/db.php';
setCORSHeaders();

// Wajib login
if (empty($_SESSION['ori_admin_id'])) {
    jsonResponse(['success' => false, 'message' => 'Unauthorized.'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method harus POST.'], 405);
}

if (!isset($_FILES['gambar']) || $_FILES['gambar']['error'] !== UPLOAD_ERR_OK) {
    $errCode = $_FILES['gambar']['error'] ?? -1;
    jsonResponse(['success' => false, 'message' => "Upload error (kode: $errCode). Pastikan file dipilih."], 400);
}

$file   = $_FILES['gambar'];
$maxSize = 5 * 1024 * 1024; // 5 MB

// Validasi ukuran
if ($file['size'] > $maxSize) {
    jsonResponse(['success' => false, 'message' => 'Ukuran file terlalu besar. Maksimal 5MB.'], 400);
}

// Validasi tipe file
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime  = $finfo->file($file['tmp_name']);

if (!in_array($mime, $allowedMimes)) {
    jsonResponse(['success' => false, 'message' => 'Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.'], 400);
}

// Generate nama file unik
$ext       = pathinfo($file['name'], PATHINFO_EXTENSION);
$extMap    = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
$ext       = $extMap[$mime] ?? 'jpg';
$filename  = 'berita_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$uploadDir = __DIR__ . '/../uploads/';
$destPath  = $uploadDir . $filename;

// Pastikan folder ada
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Pindahkan file
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    jsonResponse(['success' => false, 'message' => 'Gagal menyimpan file. Periksa permission folder uploads/.'], 500);
}

$publicPath = 'uploads/' . $filename;

jsonResponse([
    'success' => true,
    'message' => 'Gambar berhasil diupload.',
    'path'    => $publicPath,
    'url'     => $publicPath
]);
