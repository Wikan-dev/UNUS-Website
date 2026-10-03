<?php
// ============================================================
// KONFIGURASI KONEKSI DATABASE
// Dipanggil oleh api.php. Jangan dipanggil langsung dari browser.
// ============================================================

// 127.0.0.1 dipakai karena di Linux "localhost" bisa mencari socket, bukan TCP
$host = "127.0.0.1";
$user = "root";
$pass = "";
$db   = "unus";

$conn = new mysqli($host, $user, $pass, $db);

// Hentikan script dan kirim pesan error dalam format JSON
if ($conn->connect_error) {
    die(json_encode(["error" => "Koneksi gagal: " . $conn->connect_error]));
}
?>
