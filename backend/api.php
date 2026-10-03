<?php
// ============================================================
// API BACKEND - sumber data untuk aplikasi React
// ============================================================
//
// CARA MENJALANKAN (terminal terpisah, JALAN DULUAN):
//     php -S localhost:8080 -t backend
//
// ALUR DATANYA:
//     Browser (React :5173)  ->  Vite proxy  ->  api.php (:8080)  ->  MySQL
//
// ============================================================

// CORS: wajib karena file ini diakses dari server lain (port 5173),
// sedangkan file ini jalan di port 8080. Tanpa ini browser akan memblokir.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Permintaan OPTIONS = handshake otomatis dari browser sebelum GET.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// __DIR__ = folder tempat file ini berada, supaya config.php
// selalu ditemukan tanpa bergantung pada folder kerja terminal.
require_once __DIR__ . '/config.php';

// Contoh: /api.php?endpoint=mahasiswa        -> semua data
//         /api.php?endpoint=mahasiswa&id=123 -> satu data
$endpoint = $_GET['endpoint'] ?? '';
$id       = $_GET['id'] ?? null;

switch ($endpoint) {
    case 'mahasiswa':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405); // Method Not Allowed
            echo json_encode(["error" => "Hanya permintaan GET yang didukung"]);
            exit;
        }

        if ($id !== null) {
            getMahasiswaById($conn, $id);   // ambil 1 baris (untuk tombol detail)
        } else {
            getAllMahasiswa($conn);         // ambil semua baris (untuk tabel utama)
        }
        exit; // PENTING: berhenti di sini, jangan lanjut ke bawah

    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint tidak dikenal: " . $endpoint]);
        exit;
}

// ============================================================
// KUMPULAN FUNGSI
// ============================================================

// Mengambil SEMUA data mahasiswa untuk ditampilkan di tabel
function getAllMahasiswa($conn) {
    // Nama kolom harus sama persis dengan tabel di database
    $query  = "SELECT nim, nama_lengkap, program_studi, angkatan, status_akademik
               FROM mahasiswa
               ORDER BY nim";
    $result = $conn->query($query);

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
}

// Mengambil SATU data mahasiswa berdasarkan NIM
function getMahasiswaById($conn, $nim) {
    // (?) berarti nilai diisi nanti oleh program, bukan dibaca langsung dari user.
    // Ini Prepared Statement, yang melindungi dari SQL Injection.
    $stmt = $conn->prepare(
        "SELECT nim, nama_lengkap, program_studi, angkatan, status_akademik
         FROM mahasiswa
         WHERE nim = ?"
    );

    // Pasangkan nilai ke tanda ().
    // "s" = string, dipakai karena kolom nim bertipe varchar.
    $stmt->bind_param("s", $nim);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["error" => "Mahasiswa dengan NIM $nim tidak ditemukan"]);
        return;
    }

    echo json_encode($result->fetch_assoc());

    $stmt->close();
}
?>
