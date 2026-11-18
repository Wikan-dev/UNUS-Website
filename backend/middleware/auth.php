<?php
// ============================================================
// middleware/auth.php — Middleware Autentikasi & Otorisasi
// ============================================================
// Fungsi-fungsi untuk memverifikasi session dan role user
// sebelum mengizinkan akses ke endpoint tertentu.
//
// Digunakan oleh controller yang butuh proteksi:
//   $user = requireAuth($conn);           // wajib login
//   requireRole($conn, ['admin']);         // wajib login + role admin
//   requireRole($conn, ['admin', 'dosen']); // admin ATAU dosen
// ============================================================

/**
 * Ambil user yang sedang login berdasarkan session_hash di header Authorization.
 * 
 * Frontend harus mengirim header:
 *   Authorization: Bearer <session_hash>
 *
 * @return array|null  Data user (id_user, email, role) atau null jika tidak valid
 */
function getAuthenticatedUser($conn): ?array {
    // Ambil session_hash dari header Authorization
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    
    // Format: "Bearer <session_hash>"
    if (!preg_match('/^Bearer\s+([a-f0-9]{64})$/i', $authHeader, $matches)) {
        return null;
    }
    
    $sessionHash = $matches[1];
    
    // Cari user berdasarkan session_hash
    $stmt = $conn->prepare(
        "SELECT id_user, email, role, session_hash
         FROM users
         WHERE session_hash = ?"
    );
    
    if (!$stmt) {
        return null;
    }
    
    $stmt->bind_param("s", $sessionHash);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();
    
    return $user ?: null;
}

/**
 * Wajibkan user login. Jika tidak, langsung kirim 401 dan hentikan eksekusi.
 *
 * @return array Data user yang sudah terautentikasi
 */
function requireAuth($conn): array {
    $user = getAuthenticatedUser($conn);
    
    if (!$user) {
        responseJSON([
            "error" => "Akses ditolak: Anda harus login terlebih dahulu",
            "code"  => "UNAUTHENTICATED"
        ], 401);
        exit;
    }
    
    return $user;
}

/**
 * Wajibkan user login DAN memiliki salah satu role yang diizinkan.
 * Jika tidak, kirim 401 (belum login) atau 403 (tidak punya hak akses).
 *
 * @param array $allowedRoles  Daftar role yang diizinkan, contoh: ['admin'], ['admin', 'dosen']
 * @return array Data user yang sudah terautentikasi dan terotorisasi
 */
function requireRole($conn, array $allowedRoles): array {
    $user = requireAuth($conn);
    
    if (!in_array($user['role'], $allowedRoles, true)) {
        responseJSON([
            "error" => "Akses ditolak: Anda tidak memiliki hak akses untuk fitur ini. Diperlukan role: " . implode(' atau ', $allowedRoles),
            "code"  => "FORBIDDEN",
            "required_roles" => $allowedRoles,
            "your_role" => $user['role'],
        ], 403);
        exit;
    }
    
    return $user;
}
