<?php
// ============================================================
// API BACKEND - router utama (Modular Router File)
// ============================================================
//
// CARA MENJALANKAN (terminal terpisah, JALAN DULUAN):
//     php -S localhost:8080 -t backend
//
// ALUR DATANYA:
//     Browser (React :5173)  ->  Vite proxy  ->  api.php (:8080)  ->  MySQL
//
// ROUTING OTOMATIS:
//     ?endpoint=mahasiswa  -> muat controllers/mahasiswa.php
//     ?endpoint=login      -> muat controllers/login.php
//     Tiap controller wajib punya fungsi handle<Endpoint>($conn, $id)
// ============================================================

// --- CORS + preflight -------------------------------------------------------
// CORS: wajib karena file ini diakses dari server lain (port 5173),
// sedangkan file ini jalan di port 8080. Tanpa ini browser akan memblokir.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Permintaan OPTIONS = handshake otomatis dari browser sebelum request sebenarnya.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// --- Load config + helper ---------------------------------------------------
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

// --- Parameter --------------------------------------------------------------
$endpoint = $_GET['endpoint'] ?? '';
$id       = $_GET['id'] ?? null;

// --- Validasi nama endpoint (anti path traversal) ---------------------------
if (!preg_match('/^[a-z0-9_]+$/', $endpoint)) {
    responseJSON(["error" => "Endpoint tidak ditemukan: " . $endpoint], 404);
    exit;
}

// --- Auto-dispatch controller ------------------------------------------------
$controller = __DIR__ . '/controllers/' . $endpoint . '.php';

if (!is_file($controller)) {
    responseJSON(["error" => "Endpoint tidak ditemukan: " . $endpoint], 404);
    exit;
}

require_once $controller;

$handler = 'handle' . ucfirst($endpoint);
if (!function_exists($handler)) {
    responseJSON(["error" => "Konfigurasi endpoint bermasalah"], 500);
    exit;
}

$handler($conn, $id);