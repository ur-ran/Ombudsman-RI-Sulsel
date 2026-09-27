<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$dbFile = __DIR__ . '/../data/laporan_tahunan.json';

// Ensure data dir exists
if (!is_dir(dirname($dbFile))) {
    mkdir(dirname($dbFile), 0755, true);
}

// Seed default data if file doesn't exist
if (!file_exists($dbFile)) {
    $default = [
        [
            'id' => 1,
            'tahun' => '2024',
            'judul' => 'Laporan Tahunan Ombudsman RI Sulsel 2024',
            'deskripsi' => 'Laporan kinerja dan capaian Ombudsman RI Perwakilan Sulawesi Selatan tahun 2024.',
            'file_url' => '',
            'cover_url' => '',
            'created_at' => date('Y-m-d')
        ]
    ];
    file_put_contents($dbFile, json_encode($default, JSON_PRETTY_PRINT));
}

$data = json_decode(file_get_contents($dbFile), true) ?? [];
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET' && $action === 'list') {
    usort($data, fn($a, $b) => $b['tahun'] <=> $a['tahun']);
    echo json_encode(['success' => true, 'data' => $data]);

} elseif ($method === 'POST' && $action === 'add') {
    $body = json_decode(file_get_contents('php://input'), true);
    $newItem = [
        'id' => time(),
        'tahun' => trim($body['tahun'] ?? ''),
        'judul' => trim($body['judul'] ?? ''),
        'deskripsi' => trim($body['deskripsi'] ?? ''),
        'file_url' => trim($body['file_url'] ?? ''),
        'cover_url' => trim($body['cover_url'] ?? ''),
        'created_at' => date('Y-m-d')
    ];
    $data[] = $newItem;
    file_put_contents($dbFile, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true, 'data' => $newItem]);

} elseif ($method === 'PUT' && $action === 'update') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id = intval($body['id'] ?? 0);
    foreach ($data as &$item) {
        if ($item['id'] == $id) {
            $item['tahun'] = trim($body['tahun'] ?? $item['tahun']);
            $item['judul'] = trim($body['judul'] ?? $item['judul']);
            $item['deskripsi'] = trim($body['deskripsi'] ?? $item['deskripsi']);
            $item['file_url'] = trim($body['file_url'] ?? $item['file_url']);
            $item['cover_url'] = trim($body['cover_url'] ?? $item['cover_url']);
            break;
        }
    }
    file_put_contents($dbFile, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true]);

} elseif ($method === 'DELETE' && $action === 'delete') {
    $id = intval($_GET['id'] ?? 0);
    $data = array_values(array_filter($data, fn($item) => $item['id'] != $id));
    file_put_contents($dbFile, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true]);

} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
}
