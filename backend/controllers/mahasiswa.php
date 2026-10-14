<?php
// ============================================================
// controllers/mahasiswa.php
// ============================================================
// Endpoint: ?endpoint=mahasiswa
//   tanpa &id  -> semua data (tabel utama)
//   dengan &id -> satu data berdasarkan NIM (tombol detail)
//
// Hanya mendukung metode GET.
// ============================================================

function handleMahasiswa($conn, $id) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        responseJSON(["error" => "Hanya permintaan GET yang didukung"], 405);
        return;
    }

    if ($id !== null && $id !== '') {
        getMahasiswaById($conn, $id);   // ambil 1 baris (untuk tombol detail)
    } else {
        getAllMahasiswa($conn);         // ambil semua baris (untuk tabel utama)
    }
}

// --- Mengambil SEMUA data mahasiswa -----------------------------------------
function getAllMahasiswa($conn) {
    // Nama kolom harus sama persis dengan tabel di database
    $query  = "SELECT nim, nama_lengkap, program_studi, angkatan, status_akademik
               FROM mahasiswa
               ORDER BY nim";
    $result = $conn->query($query);

    if (!$result) {
        responseJSON(["error" => "Query database gagal: " . $conn->error], 500);
        return;
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    responseJSON($data, 200);
}

// --- Mengambil SATU data mahasiswa berdasarkan NIM --------------------------
function getMahasiswaById($conn, $nim) {
    // (?) berarti nilai diisi nanti oleh program, bukan dibaca langsung dari user.
    // Ini Prepared Statement, yang melindungi dari SQL Injection.
    $stmt = $conn->prepare(
        "SELECT nim, nama_lengkap, program_studi, angkatan, status_akademik
         FROM mahasiswa
         WHERE nim = ?"
    );

    if (!$stmt) {
        responseJSON(["error" => "Persiapan statement gagal: " . $conn->error], 500);
        return;
    }

    // "s" = string, dipakai karena kolom nim bertipe varchar.
    $stmt->bind_param("s", $nim);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        responseJSON(["error" => "Mahasiswa dengan NIM $nim tidak ditemukan"], 404);
        $stmt->close();
        return;
    }

    responseJSON($result->fetch_assoc(), 200);

    $stmt->close();
}