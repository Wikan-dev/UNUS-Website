<?php
// ============================================================
// controllers/login.php  (BARU)
// ============================================================
// Endpoint: POST ?endpoint=login
//   Body (JSON): { "username": "...", "password": "..." }
//
// Baca input via php://input, validasi, cari user dengan prepared
// statement, lalu verifikasi password_hash dengan password_verify.
// ============================================================

function handleLogin($conn, $id) {
    // Hanya POST yang didukung.
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responseJSON(["error" => "Hanya permintaan POST yang didukung"], 405);
        return;
    }

    // --- Baca body JSON -----------------------------------------------------
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        responseJSON(["error" => "Format JSON tidak valid"], 400);
        return;
    }

    $username = $data['username'] ?? null;
    $password = $data['password'] ?? null;

    if (!$username || !$password) {
        responseJSON(["error" => "Username dan password wajib diisi"], 400);
        return;
    }

    // --- Cari user di database (prepared statement) -------------------------
    $stmt = $conn->prepare(
        "SELECT id, username, password
         FROM pengguna
         WHERE username = ?"
    );

    if (!$stmt) {
        responseJSON(["error" => "Persiapan statement gagal: " . $conn->error], 500);
        return;
    }

    $stmt->bind_param("s", $username);
    $stmt->execute();

    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    // --- Verifikasi password hash -------------------------------------------
    if (!$user || !password_verify($password, $user['password'])) {
        // Sengaja tidak bedakan "username salah" vs "password salah"
        // untuk mencegah user enumeration.
        responseJSON(["error" => "Username atau password salah"], 401);
        return;
    }

    // --- Berhasil ------------------------------------------------------------
    responseJSON([
        "message" => "Login sukses",
        "user" => [
            "id"       => (int)$user['id'],
            "username" => $user['username'],
        ],
    ], 200);
}