<?php
// ============================================================
// controllers/verify_session.php
// ============================================================
// Endpoint: GET ?endpoint=verify_session&hash=...
//   Memverifikasi apakah session_hash valid dan mengembalikan
//   data user yang terkait.
// ============================================================

function handleVerifySession($conn, $id) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        responseJSON(["error" => "Hanya permintaan GET yang didukung"], 405);
        return;
    }

    $hash = $_GET['hash'] ?? null;

    if (!$hash || trim($hash) === '') {
        responseJSON(["error" => "Session hash wajib disertakan"], 400);
        return;
    }

    $hash = trim($hash);

    // Validasi format hash (64 karakter hex = SHA-256)
    if (!preg_match('/^[a-f0-9]{64}$/', $hash)) {
        responseJSON(["error" => "Format session hash tidak valid"], 400);
        return;
    }

    // Cari user berdasarkan session_hash
    $stmt = $conn->prepare(
        "SELECT id_user, email, role, session_hash
         FROM users
         WHERE session_hash = ?"
    );

    if (!$stmt) {
        responseJSON(["error" => "Persiapan statement gagal: " . $conn->error], 500);
        return;
    }

    $stmt->bind_param("s", $hash);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if (!$user) {
        responseJSON(["error" => "Sesi tidak valid atau sudah kedaluwarsa"], 401);
        return;
    }

    responseJSON([
        "valid" => true,
        "user"  => [
            "id"           => (int)$user['id_user'],
            "email"        => $user['email'],
            "role"         => $user['role'],
            "session_hash" => $user['session_hash'],
        ],
    ], 200);
}
