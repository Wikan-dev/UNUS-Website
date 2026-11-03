<?php
// ============================================================
// controllers/mahasiswa.php
// ============================================================
// Endpoint: ?endpoint=mahasiswa
//   GET (tanpa id/h) -> semua data (tabel utama)
//   GET (&h=...)     -> 1 data berdasarkan hash_profil
//   GET (&id=...)    -> 1 data berdasarkan NIM
//   PUT / POST       -> update seluruh detail mahasiswa (oleh Admin)
//   DELETE (&nim=..) -> hapus data mahasiswa (oleh Admin)
// ============================================================

function handleMahasiswa($conn, $id) {
    $method = $_SERVER['REQUEST_METHOD'];

    // Dukungan override method via header atau query param jika client tidak mendukung PUT/DELETE murni
    if ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
        $method = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
    }

    switch ($method) {
        case 'GET':
            if (isset($_GET['h']) && $_GET['h'] !== '') {
                $paramH = trim($_GET['h']);
                if (preg_match('/^[a-f0-9]{64}$/', $paramH)) {
                    getMahasiswaByHash($conn, $paramH);
                } else {
                    getMahasiswaById($conn, $paramH);
                }
            } elseif ($id !== null && $id !== '') {
                getMahasiswaById($conn, trim($id));
            } else {
                getAllMahasiswa($conn);
            }
            break;

        case 'PUT':
        case 'PATCH':
            updateMahasiswa($conn, $id);
            break;

        case 'POST':
            // Jika ada payload JSON atau parameter update
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            if (is_array($data) && (isset($data['action']) && $data['action'] === 'delete')) {
                deleteMahasiswa($conn, $data['nim'] ?? $id);
            } else {
                updateMahasiswa($conn, $id);
            }
            break;

        case 'DELETE':
            $targetNim = $_GET['nim'] ?? $id;
            if (!$targetNim) {
                $raw = file_get_contents('php://input');
                $data = json_decode($raw, true);
                $targetNim = $data['nim'] ?? null;
            }
            deleteMahasiswa($conn, $targetNim);
            break;

        default:
            responseJSON(["error" => "Metode HTTP $method tidak didukung"], 405);
            break;
    }
}

// --- Mengambil SATU data mahasiswa berdasarkan HASH -------------------------
function getMahasiswaByHash($conn, string $hashMasuk) {
    global $hashsalt;

    if (!preg_match('/^[a-f0-9]{64}$/', $hashMasuk)) {
        responseJSON(["error" => "Profil tidak ditemukan (format hash tidak valid)"], 404);
        return;
    }

    $query = "SELECT m.nim, m.id_user, m.nama_lengkap, m.program_studi, m.angkatan, m.status_akademik, m.dosen_wali_nidn,
                     u.email AS user_email,
                     SHA2(CONCAT(m.nim, ?), 256) AS hash_profil
              FROM mahasiswa m
              LEFT JOIN users u ON m.id_user = u.id_user
              WHERE SHA2(CONCAT(m.nim, ?), 256) = ?";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        responseJSON(["error" => "Query persiapan gagal: " . $conn->error], 500);
        return;
    }

    $stmt->bind_param("sss", $hashsalt, $hashsalt, $hashMasuk);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    $stmt->close();

    if (!$data) {
        responseJSON(["error" => "Profil mahasiswa tidak ditemukan"], 404);
        return;
    }

    responseJSON($data, 200);
}

// --- Mengambil SATU data mahasiswa berdasarkan NIM --------------------------
function getMahasiswaById($conn, $nim) {
    global $hashsalt;

    $query = "SELECT m.nim, m.id_user, m.nama_lengkap, m.program_studi, m.angkatan, m.status_akademik, m.dosen_wali_nidn,
                     u.email AS user_email,
                     SHA2(CONCAT(m.nim, ?), 256) AS hash_profil
              FROM mahasiswa m
              LEFT JOIN users u ON m.id_user = u.id_user
              WHERE m.nim = ?";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        responseJSON(["error" => "Persiapan statement gagal: " . $conn->error], 500);
        return;
    }

    $stmt->bind_param("ss", $hashsalt, $nim);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    $stmt->close();

    if (!$data) {
        responseJSON(["error" => "Mahasiswa dengan NIM $nim tidak ditemukan"], 404);
        return;
    }

    responseJSON($data, 200);
}

// --- Mengambil SEMUA data mahasiswa -----------------------------------------
function getAllMahasiswa($conn) {
    global $hashsalt;

    $query = "SELECT m.nim, m.id_user, m.nama_lengkap, m.program_studi, m.angkatan, m.status_akademik, m.dosen_wali_nidn,
                     u.email AS user_email,
                     SHA2(CONCAT(m.nim, ?), 256) AS hash_profil
              FROM mahasiswa m
              LEFT JOIN users u ON m.id_user = u.id_user
              ORDER BY m.nim";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        responseJSON(["error" => "Query database gagal: " . $conn->error], 500);
        return;
    }

    $stmt->bind_param("s", $hashsalt);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    $stmt->close();

    responseJSON($data, 200);
}

// --- Mengubah / Mengedit SEMUA detail data mahasiswa ------------------------
function updateMahasiswa($conn, $urlId) {
    global $hashsalt;

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        responseJSON(["error" => "Format JSON tidak valid"], 400);
        return;
    }

    // NIM asli sebelum pengeditan (digunakan sebagai penunjuk baris di WHERE clause)
    $originalNim = trim($data['original_nim'] ?? ($urlId ?? ''));
    if ($originalNim === '' && isset($data['nim'])) {
        $originalNim = trim($data['nim']);
    }

    if ($originalNim === '') {
        responseJSON(["error" => "NIM asli (original_nim) wajib disertakan untuk memperbarui data"], 400);
        return;
    }

    // Cek apakah mahasiswa yang akan diedit ada di database
    $cekStmt = $conn->prepare("SELECT nim, id_user FROM mahasiswa WHERE nim = ?");
    if (!$cekStmt) {
        responseJSON(["error" => "Gagal memeriksa mahasiswa: " . $conn->error], 500);
        return;
    }
    $cekStmt->bind_param("s", $originalNim);
    $cekStmt->execute();
    $cekResult = $cekStmt->get_result();
    $mahasiswaLama = $cekResult->fetch_assoc();
    $cekStmt->close();

    if (!$mahasiswaLama) {
        responseJSON(["error" => "Data mahasiswa dengan NIM '$originalNim' tidak ditemukan"], 404);
        return;
    }

    // Ambil field-field baru
    $newNim         = trim($data['nim'] ?? $originalNim);
    $namaLengkap    = trim($data['nama_lengkap'] ?? '');
    $programStudi   = trim($data['program_studi'] ?? '');
    $angkatan       = (int)($data['angkatan'] ?? 0);
    $statusAkademik = trim($data['status_akademik'] ?? 'Aktif');
    $dosenWaliNidn  = isset($data['dosen_wali_nidn']) && trim($data['dosen_wali_nidn']) !== '' ? trim($data['dosen_wali_nidn']) : null;
    $userEmail      = isset($data['user_email']) ? trim($data['user_email']) : null;

    // Validasi
    if ($newNim === '') {
        responseJSON(["error" => "NIM tidak boleh kosong"], 400);
        return;
    }

    if ($namaLengkap === '') {
        responseJSON(["error" => "Nama lengkap tidak boleh kosong"], 400);
        return;
    }

    if ($programStudi === '') {
        responseJSON(["error" => "Program studi tidak boleh kosong"], 400);
        return;
    }

    if ($angkatan < 1900 || $angkatan > 2100) {
        responseJSON(["error" => "Tahun angkatan tidak valid ($angkatan)"], 400);
        return;
    }

    $statusDiizinkan = ['Aktif', 'Cuti', 'Lulus', 'DO'];
    if (!in_array($statusAkademik, $statusDiizinkan, true)) {
        responseJSON(["error" => "Status akademik '$statusAkademik' tidak valid. Pilih: " . implode(', ', $statusDiizinkan)], 400);
        return;
    }

    // Jika NIM diubah, pastikan NIM baru belum dipakai oleh mahasiswa lain
    if ($newNim !== $originalNim) {
        $unikStmt = $conn->prepare("SELECT nim FROM mahasiswa WHERE nim = ? AND nim != ?");
        $unikStmt->bind_param("ss", $newNim, $originalNim);
        $unikStmt->execute();
        if ($unikStmt->get_result()->num_rows > 0) {
            $unikStmt->close();
            responseJSON(["error" => "NIM '$newNim' sudah terdaftar untuk mahasiswa lain"], 409);
            return;
        }
        $unikStmt->close();
    }

    // Cek dosen_wali_nidn jika diisi: pastikan ada di tabel dosen, jika tidak set null
    if ($dosenWaliNidn !== null) {
        $dsnStmt = $conn->prepare("SELECT nidn FROM dosen WHERE nidn = ?");
        if ($dsnStmt) {
            $dsnStmt->bind_param("s", $dosenWaliNidn);
            $dsnStmt->execute();
            if ($dsnStmt->get_result()->num_rows === 0) {
                $dosenWaliNidn = null; // jika NIDN tidak ditemukan di master dosen, jadikan null
            }
            $dsnStmt->close();
        }
    }

    // Update data email user jika disediakan dan valid
    if ($userEmail !== null && $userEmail !== '' && $mahasiswaLama['id_user']) {
        if (!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
            responseJSON(["error" => "Format email tidak valid"], 400);
            return;
        }

        // Cek email duplikat
        $emailStmt = $conn->prepare("SELECT id_user FROM users WHERE email = ? AND id_user != ?");
        $emailStmt->bind_param("si", $userEmail, $mahasiswaLama['id_user']);
        $emailStmt->execute();
        if ($emailStmt->get_result()->num_rows > 0) {
            $emailStmt->close();
            responseJSON(["error" => "Email '$userEmail' sudah digunakan akun lain"], 409);
            return;
        }
        $emailStmt->close();

        // Update email di users
        $upUser = $conn->prepare("UPDATE users SET email = ? WHERE id_user = ?");
        $upUser->bind_param("si", $userEmail, $mahasiswaLama['id_user']);
        $upUser->execute();
        $upUser->close();
    }

    // Update tabel mahasiswa
    $updateQuery = "UPDATE mahasiswa
                    SET nim = ?,
                        nama_lengkap = ?,
                        program_studi = ?,
                        angkatan = ?,
                        status_akademik = ?,
                        dosen_wali_nidn = ?
                    WHERE nim = ?";

    $stmt = $conn->prepare($updateQuery);
    if (!$stmt) {
        responseJSON(["error" => "Persiapan query update gagal: " . $conn->error], 500);
        return;
    }

    $stmt->bind_param(
        "sssissi",
        $newNim,
        $namaLengkap,
        $programStudi,
        $angkatan,
        $statusAkademik,
        $dosenWaliNidn,
        $originalNim
    );

    try {
        $stmt->execute();
    } catch (mysqli_sql_exception $e) {
        $stmt->close();
        responseJSON(["error" => "Gagal menyimpan perubahan ke database: " . $e->getMessage()], 500);
        return;
    }

    $stmt->close();

    // Ambil data terbaru setelah berhasil disimpan
    $ambilBaru = $conn->prepare(
        "SELECT m.nim, m.id_user, m.nama_lengkap, m.program_studi, m.angkatan, m.status_akademik, m.dosen_wali_nidn,
                u.email AS user_email,
                SHA2(CONCAT(m.nim, ?), 256) AS hash_profil
         FROM mahasiswa m
         LEFT JOIN users u ON m.id_user = u.id_user
         WHERE m.nim = ?"
    );
    $ambilBaru->bind_param("ss", $hashsalt, $newNim);
    $ambilBaru->execute();
    $dataBaru = $ambilBaru->get_result()->fetch_assoc();
    $ambilBaru->close();

    responseJSON([
        "message" => "Data mahasiswa berhasil diperbarui",
        "data"    => $dataBaru,
    ], 200);
}

// --- Menghapus data mahasiswa (Aksi berbahaya Admin) ------------------------
function deleteMahasiswa($conn, $nim) {
    if (!$nim || trim($nim) === '') {
        responseJSON(["error" => "NIM mahasiswa wajib diberikan untuk menghapus"], 400);
        return;
    }

    $nim = trim($nim);

    $stmt = $conn->prepare("DELETE FROM mahasiswa WHERE nim = ?");
    if (!$stmt) {
        responseJSON(["error" => "Persiapan statement gagal: " . $conn->error], 500);
        return;
    }

    $stmt->bind_param("s", $nim);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        $stmt->close();
        responseJSON(["error" => "Data mahasiswa dengan NIM '$nim' tidak ditemukan"], 404);
        return;
    }

    $stmt->close();

    responseJSON([
        "message" => "Mahasiswa dengan NIM $nim berhasil dihapus dari sistem",
    ], 200);
}
