<?php
// ============================================================
// controllers/login.php  (BARU)
// ============================================================
// Endpoint: POST ?endpoint=login
//   Body (JSON): { "email": "...", "password": "..." }
//
// Baca input via php://input, validasi, cari user dengan prepared
// statement, lalu verifikasi password_hash dengan password_verify.
// Setelah login sukses, generate session_hash unik dan simpan di DB.
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

    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;

    if (!$email || !$password) {
        responseJSON(["error" => "Username dan password wajib diisi"], 400);
        return;
    }

    // --- Cari user di database (prepared statement) -------------------------
    $stmt = $conn->prepare(
        "SELECT id_user, email, password, role
         FROM users
         WHERE email = ?"
    );

    if (!$stmt) {
        responseJSON(["error" => "Persiapan statement gagal: " . $conn->error], 500);
        return;
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();

    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    // --- Verifikasi password hash -------------------------------------------
    if (!$user || !password_verify($password, $user['password'])) {
        // Sengaja tidak bedakan "username salah" vs "password salah"
        // untuk mencegah user enumeration.
        responseJSON(["error" => "Email atau password salah"], 401);
        return;
    }

    // --- Generate session_hash unik untuk sesi ini --------------------------
    // Hash = SHA-256 dari (random_bytes + user_id + timestamp)
    // Setiap kali login, hash baru di-generate sehingga unik per sesi.
    $randomBytes = bin2hex(random_bytes(32));
    $sessionHash = hash('sha256', $randomBytes . $user['id_user'] . microtime(true));

    // Simpan session_hash ke database
    $updateStmt = $conn->prepare(
        "UPDATE users SET session_hash = ? WHERE id_user = ?"
    );
    if ($updateStmt) {
        $updateStmt->bind_param("si", $sessionHash, $user['id_user']);
        $updateStmt->execute();
        $updateStmt->close();
    }

    // --- Berhasil ------------------------------------------------------------
    responseJSON([
        "message" => "Login sukses",
        "user" => [
            "id"           => (int)$user['id_user'],
            "email"        => $user['email'],
            "role"         => $user['role'],
            "session_hash" => $sessionHash,
        ],
    ], 200);
}
