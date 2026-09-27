<?php
// ============================================================
// api/upload_magang.php — Upload Foto Galeri Magang
// POST multipart/form-data dengan field "foto"
// ============================================================
session_start();
require_once __DIR__ . '/db.php';
setCORSHeaders();

// Wajib login
if (empty($_SESSION['ori_admin_id'])) {
    jsonResponse(['success' => false, 'message' => 'Unauthorized.'], 401);
}

function compressAndSaveImage($source, $destination, $mime, $quality = 80) {
    $info = getimagesize($source);
    if (!$info) return move_uploaded_file($source, $destination);
    
    $maxWidth = 1920;
    $width = $info[0];
    $height = $info[1];
    
    if ($width > $maxWidth) {
        $newWidth = $maxWidth;
        $newHeight = floor($height * ($maxWidth / $width));
    } else {
        $newWidth = $width;
        $newHeight = $height;
    }
    
    $image = null;
    if ($mime == 'image/jpeg') $image = @imagecreatefromjpeg($source);
    elseif ($mime == 'image/png') $image = @imagecreatefrompng($source);
    elseif ($mime == 'image/webp') $image = @imagecreatefromwebp($source);
    elseif ($mime == 'image/gif') $image = @imagecreatefromgif($source);
    
    if (!$image) return move_uploaded_file($source, $destination);
    
    $newImage = imagecreatetruecolor($newWidth, $newHeight);
    
    if ($mime == 'image/png' || $mime == 'image/webp' || $mime == 'image/gif') {
        imagealphablending($newImage, false);
        imagesavealpha($newImage, true);
        $transparent = imagecolorallocatealpha($newImage, 255, 255, 255, 127);
        imagefilledrectangle($newImage, 0, 0, $newWidth, $newHeight, $transparent);
    }
    
    imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
    
    $success = false;
    if ($mime == 'image/jpeg') $success = imagejpeg($newImage, $destination, $quality);
    elseif ($mime == 'image/png') $success = imagepng($newImage, $destination, round(9 * (100 - $quality) / 100));
    elseif ($mime == 'image/webp') $success = imagewebp($newImage, $destination, $quality);
    elseif ($mime == 'image/gif') $success = imagegif($newImage, $destination);
    
    imagedestroy($image);
    imagedestroy($newImage);
    
    if (!$success) {
        return move_uploaded_file($source, $destination);
    }
    return true;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method harus POST.'], 405);
}

if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
    $errCode = $_FILES['foto']['error'] ?? -1;
    jsonResponse(['success' => false, 'message' => "Upload error (kode: $errCode). Pastikan file dipilih."], 400);
}

$file    = $_FILES['foto'];
$caption = trim($_POST['caption'] ?? '');
$maxSize = 15 * 1024 * 1024; // 15 MB (foto kamera bisa besar)

// Validasi ukuran
if ($file['size'] > $maxSize) {
    jsonResponse(['success' => false, 'message' => 'Ukuran file terlalu besar. Maksimal 15MB.'], 400);
}

// Validasi tipe file
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime  = $finfo->file($file['tmp_name']);

if (!in_array($mime, $allowedMimes)) {
    jsonResponse(['success' => false, 'message' => 'Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP.'], 400);
}

// Generate nama file (gunakan nama asli)
$filename = basename($file['name']);
// Hapus spasi dan karakter aneh agar URL aman
$filename = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $filename);

// Pastikan nama file unik jika sudah ada
$uploadDir = __DIR__ . '/../uploads/magang/';
$destPath  = $uploadDir . $filename;
$counter = 1;
$pathInfo = pathinfo($filename);
while (file_exists($destPath)) {
    $filename = $pathInfo['filename'] . '_' . $counter . '.' . ($pathInfo['extension'] ?? 'jpg');
    $destPath = $uploadDir . $filename;
    $counter++;
}

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Konversi dan simpan (maksimal lebar 1920px, kualitas 80%)
if (!compressAndSaveImage($file['tmp_name'], $destPath, $mime, 80)) {
    jsonResponse(['success' => false, 'message' => 'Gagal menyimpan file. Periksa permission folder uploads/magang/.'], 500);
}

$publicPath = 'uploads/magang/' . $filename;

// Simpan ke database
$pdo = getDB();
$stmt = $pdo->prepare("INSERT INTO magang_galeri (path, caption, urutan) VALUES (?, ?, (SELECT COALESCE(MAX(urutan),0)+1 FROM magang_galeri g2))");
$stmt->execute([$publicPath, $caption]);
$newId = (int)$pdo->lastInsertId();

jsonResponse([
    'success' => true,
    'message' => 'Foto berhasil diupload.',
    'id'      => $newId,
    'path'    => $publicPath,
    'url'     => $publicPath,
    'caption' => $caption
]);
