<?php
// ============================================================
// controllers/logout.php
// ============================================================
// Endpoint: POST ?endpoint=logout
//   Menghapus / mereset session_hash di database saat user logout.
//   Mencegah session URL lama digunakan kembali setelah keluar.
// ============================================================

function handleLogout($conn, $id) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responseJSON(["error" => "Hanya permintaan POST yang didukung"], 405);
        return;
    }

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    $hash = $data['session_hash'] ?? $_GET['hash'] ?? null;

    if ($hash && preg_match('/^[a-f0-9]{64}$/', $hash)) {
        // Hapus session_hash dari user tersebut di DB
        $stmt = $conn->prepare("UPDATE users SET session_hash = NULL WHERE session_hash = ?");
        if ($stmt) {
            $stmt->bind_param("s", $hash);
            $stmt->execute();
            $stmt->close();
        }
    }

    responseJSON(["message" => "Logout berhasil"], 200);
}
