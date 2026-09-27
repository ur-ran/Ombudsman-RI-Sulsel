<?php
// ============================================================
// api/upload_laporan_pdf.php - Upload PDF Laporan
// POST multipart/form-data dengan field "pdf_file"
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

if (!isset($_FILES['pdf_file']) || $_FILES['pdf_file']['error'] !== UPLOAD_ERR_OK) {
    $errCode = $_FILES['pdf_file']['error'] ?? -1;
    jsonResponse(['success' => false, 'message' => "Upload error (kode: $errCode). Pastikan file PDF dipilih."], 400);
}

$file   = $_FILES['pdf_file'];
$maxSize = 25 * 1024 * 1024; // 25 MB max

if ($file['size'] > $maxSize) {
    jsonResponse(['success' => false, 'message' => 'Ukuran file terlalu besar. Maksimal 25MB.'], 400);
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime  = $finfo->file($file['tmp_name']);
if ($mime !== 'application/pdf') {
    jsonResponse(['success' => false, 'message' => 'Tipe file harus PDF.'], 400);
}

$filename  = 'laporan_' . time() . '_' . bin2hex(random_bytes(4)) . '.pdf';
$uploadDir = __DIR__ . '/../uploads/laporan/';
$destPath  = $uploadDir . $filename;

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    jsonResponse(['success' => false, 'message' => 'Gagal menyimpan file PDF.'], 500);
}

$publicPath = 'uploads/laporan/' . $filename;

jsonResponse([
    'success' => true,
    'message' => 'File berhasil diupload.',
    'path'    => $publicPath,
    'url'     => $publicPath
]);
