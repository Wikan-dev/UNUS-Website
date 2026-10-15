<?php
// ============================================================
// controllers/register.php
// ============================================================
// Endpoint: POST /api.php?endpoint=register
// Body (JSON): { "email": "...", "password": "..." }
// ============================================================

function handleRegister($conn, $id) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responseJSON(["error" => "Hanya permintaan POST yang didukung"], 405);
        return;
    }

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        responseJSON(["error" => "Format JSON tidak valid"], 400);
        return;
    }

    $email    = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if ($email === '' || $password === '') {
        responseJSON(["error" => "Email dan password wajib diisi"], 400);
        return;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        responseJSON(["error" => "Format email tidak valid"], 400);
        return;
    }

    if (strlen($password) < 6) {
        responseJSON(["error" => "Password minimal 6 karakter"], 400);
        return;
    }

    // Cek apakah email sudah dipakai
    $checkStmt = $conn->prepare("SELECT id_user FROM users WHERE email = ?");
    if (!$checkStmt) {
        responseJSON(["error" => "Persiapan query gagal: " . $conn->error], 500);
        return;
    }

    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    $res = $checkStmt->get_result();
    if ($res->num_rows > 0) {
        responseJSON(["error" => "Email sudah terdaftar"], 409);
        $checkStmt->close();
        return;
    }
    $checkStmt->close();

    // Hash password dengan algoritma default PHP (Bcrypt/Argon2 tergantung PHP version)
    $hash = password_hash($password, PASSWORD_DEFAULT);

    $role = 'calon_mahasiswa';

    $stmt = $conn->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)");
    if (!$stmt) {
        responseJSON(["error" => "Persiapan simpan gagal: " . $conn->error], 500);
        return;
    }

    $stmt->bind_param("sss", $email, $hash, $role);

    if (!$stmt->execute()) {
        responseJSON(["error" => "Gagal mendaftarkan pengguna: " . $stmt->error], 500);
        $stmt->close();
        return;
    }

    $newId = $stmt->insert_id;
    $stmt->close();

    responseJSON([
        "message" => "Registrasi berhasil",
        "user" => [
            "id"    => (int)$newId,
            "email" => $email,
            "role"  => $role,
        ],
    ], 201);
}
