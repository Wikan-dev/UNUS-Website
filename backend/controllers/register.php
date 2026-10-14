<?php
// ============================================================
// controllers/register.php
// ============================================================
// Endpoint: POST /api.php?endpoint=register
// Body (JSON): { "username": "...", "password": "..." }
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

    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';

    if ($username === '' || $password === '') {
        responseJSON(["error" => "Username dan password wajib diisi"], 400);
        return;
    }

    if (strlen($username) < 3) {
        responseJSON(["error" => "Username minimal 3 karakter"], 400);
        return;
    }

    if (strlen($password) < 6) {
        responseJSON(["error" => "Password minimal 6 karakter"], 400);
        return;
    }

    // Cek apakah username sudah dipakai
    $checkStmt = $conn->prepare("SELECT id FROM pengguna WHERE username = ?");
    if (!$checkStmt) {
        responseJSON(["error" => "Persiapan query gagal: " . $conn->error], 500);
        return;
    }

    $checkStmt->bind_param("s", $username);
    $checkStmt->execute();
    $res = $checkStmt->get_result();
    if ($res->num_rows > 0) {
        responseJSON(["error" => "Username sudah terdaftar"], 409);
        $checkStmt->close();
        return;
    }
    $checkStmt->close();

    // Hash password dengan algoritma default PHP (Bcrypt/Argon2 tergantung PHP version)
    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO pengguna (username, password) VALUES (?, ?)");
    if (!$stmt) {
        responseJSON(["error" => "Persiapan simpan gagal: " . $conn->error], 500);
        return;
    }

    $stmt->bind_param("ss", $username, $hash);

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
            "id" => (int)$newId,
            "username" => $username,
        ],
    ], 201);
}
