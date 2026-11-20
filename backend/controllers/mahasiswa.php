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
            // ============================================================
            // RBAC: GET data mahasiswa
            // - Admin & dosen: bisa lihat SEMUA mahasiswa
            // - Mahasiswa: hanya bisa lihat data DIRI SENDIRI
            // - Calon mahasiswa: tidak boleh akses data mahasiswa
            // ============================================================
            $authUser = getAuthenticatedUser($conn);

            if (isset($_GET['h']) && $_GET['h'] !== '') {
                $paramH = trim($_GET['h']);
                if (preg_match('/^[a-f0-9]{64}$/', $paramH)) {
                    getMahasiswaByHash($conn, $paramH, $authUser);
                } else {
                    getMahasiswaById($conn, $paramH, $authUser);
                }
            } elseif ($id !== null && $id !== '') {
                getMahasiswaById($conn, trim($id), $authUser);
            } else {
                // GET semua mahasiswa — hanya admin & dosen
                if (!$authUser) {
                    responseJSON(["error" => "Akses ditolak: Anda harus login terlebih dahulu", "code" => "UNAUTHENTICATED"], 401);
                    return;
                }
                if (!in_array($authUser['role'], ['admin', 'dosen'], true)) {
                    responseJSON([
                        "error" => "Akses ditolak: Hanya Admin dan Dosen yang dapat melihat seluruh data mahasiswa",
                        "code" => "FORBIDDEN",
                        "your_role" => $authUser['role'],
                    ], 403);
                    return;
                }
                getAllMahasiswa($conn);
            }
            break;

        case 'PUT':
        case 'PATCH':
            // Update data mahasiswa — hanya admin
            requireRole($conn, ['admin']);
            updateMahasiswa($conn, $id);
            break;

        case 'POST':
            // Jika ada payload JSON atau parameter update
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            if (is_array($data) && (isset($data['action']) && $data['action'] === 'delete')) {
                // Delete — hanya admin
                requireRole($conn, ['admin']);
                deleteMahasiswa($conn, $data['nim'] ?? $id);
            } else {
                // Update — hanya admin
                requireRole($conn, ['admin']);
                updateMahasiswa($conn, $id);
            }
            break;

        case 'DELETE':
            // Hapus data mahasiswa — hanya admin
            requireRole($conn, ['admin']);
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
function getMahasiswaByHash($conn, string $hashMasuk, ?array $authUser = null) {
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

    // Jika tidak ditemukan di tabel mahasiswa, periksa tabel calon_mahasiswa
    if (!$data) {
        // Cek jika calon mahasiswa ini sudah dipromosikan ke mahasiswa
        $pQuery = "SELECT m.nim, m.id_user, m.nama_lengkap, m.program_studi, m.angkatan, m.status_akademik, m.dosen_wali_nidn,
                          u.email AS user_email,
                          SHA2(CONCAT(m.nim, ?), 256) AS hash_profil
                   FROM mahasiswa m
                   JOIN calon_mahasiswa c ON m.id_user = c.id_user AND m.nama_lengkap = c.nama_pendaftar
                   LEFT JOIN users u ON m.id_user = u.id_user
                   WHERE SHA2(CONCAT(c.no_pendaftaran, ?), 256) = ?";
        $pStmt = $conn->prepare($pQuery);
        if ($pStmt) {
            $pStmt->bind_param("sss", $hashsalt, $hashsalt, $hashMasuk);
            $pStmt->execute();
            $data = $pStmt->get_result()->fetch_assoc();
            $pStmt->close();
        }
    }

    if (!$data) {
        $cQuery = "SELECT c.no_pendaftaran AS nim, c.id_user, c.nama_pendaftar AS nama_lengkap,
                          COALESCE(NULLIF(c.program_studi, ''), 'Teknik Informatika') AS program_studi,
                          YEAR(CURRENT_DATE) AS angkatan,
                          c.status_dokumen AS status_akademik,
                          NULL AS dosen_wali_nidn,
                          u.email AS user_email,
                          SHA2(CONCAT(c.no_pendaftaran, ?), 256) AS hash_profil
                   FROM calon_mahasiswa c
                   LEFT JOIN users u ON c.id_user = u.id_user
                   WHERE SHA2(CONCAT(c.no_pendaftaran, ?), 256) = ?";
        $cStmt = $conn->prepare($cQuery);
        if ($cStmt) {
            $cStmt->bind_param("sss", $hashsalt, $hashsalt, $hashMasuk);
            $cStmt->execute();
            $data = $cStmt->get_result()->fetch_assoc();
            $cStmt->close();
        }
    }

    if (!$data) {
        responseJSON(["error" => "Profil mahasiswa tidak ditemukan"], 404);
        return;
    }

    // RBAC: Mahasiswa hanya bisa lihat data diri sendiri
    if ($authUser && !in_array($authUser['role'], ['admin', 'dosen'], true)) {
        // User bukan admin/dosen — cek apakah data ini miliknya
        if ((int)$data['id_user'] !== (int)$authUser['id_user']) {
            responseJSON([
                "error" => "Akses ditolak: Anda hanya dapat melihat data profil Anda sendiri",
                "code"  => "FORBIDDEN",
            ], 403);
            return;
        }
    }

    responseJSON($data, 200);
}

// --- Mengambil SATU data mahasiswa berdasarkan NIM --------------------------
function getMahasiswaById($conn, $nim, ?array $authUser = null) {
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

    // Jika tidak ditemukan di tabel mahasiswa, periksa apakah calon mahasiswa ini sudah dipromosikan ke mahasiswa
    if (!$data) {
        $pQuery = "SELECT m.nim, m.id_user, m.nama_lengkap, m.program_studi, m.angkatan, m.status_akademik, m.dosen_wali_nidn,
                          u.email AS user_email,
                          SHA2(CONCAT(m.nim, ?), 256) AS hash_profil
                   FROM mahasiswa m
                   JOIN calon_mahasiswa c ON m.id_user = c.id_user AND m.nama_lengkap = c.nama_pendaftar
                   LEFT JOIN users u ON m.id_user = u.id_user
                   WHERE c.no_pendaftaran = ? OR c.id_pendaftar = ?";
        $pStmt = $conn->prepare($pQuery);
        if ($pStmt) {
            $pStmt->bind_param("sss", $hashsalt, $nim, $nim);
            $pStmt->execute();
            $data = $pStmt->get_result()->fetch_assoc();
            $pStmt->close();
        }
    }

    if (!$data) {
        $cQuery = "SELECT c.no_pendaftaran AS nim, c.id_user, c.nama_pendaftar AS nama_lengkap,
                          COALESCE(NULLIF(c.program_studi, ''), 'Teknik Informatika') AS program_studi,
                          YEAR(CURRENT_DATE) AS angkatan,
                          c.status_dokumen AS status_akademik,
                          NULL AS dosen_wali_nidn,
                          u.email AS user_email,
                          SHA2(CONCAT(c.no_pendaftaran, ?), 256) AS hash_profil
                   FROM calon_mahasiswa c
                   LEFT JOIN users u ON c.id_user = u.id_user
                   WHERE c.no_pendaftaran = ? OR c.id_pendaftar = ?";
        $cStmt = $conn->prepare($cQuery);
        if ($cStmt) {
            $cStmt->bind_param("sss", $hashsalt, $nim, $nim);
            $cStmt->execute();
            $data = $cStmt->get_result()->fetch_assoc();
            $cStmt->close();
        }
    }

    if (!$data) {
        responseJSON(["error" => "Mahasiswa dengan NIM $nim tidak ditemukan"], 404);
        return;
    }

    // RBAC: Mahasiswa hanya bisa lihat data diri sendiri
    if ($authUser && !in_array($authUser['role'], ['admin', 'dosen'], true)) {
        if ((int)$data['id_user'] !== (int)$authUser['id_user']) {
            responseJSON([
                "error" => "Akses ditolak: Anda hanya dapat melihat data profil Anda sendiri",
                "code"  => "FORBIDDEN",
            ], 403);
            return;
        }
    }

    responseJSON($data, 200);
}

// --- Mengambil SEMUA data mahasiswa (Termasuk Calon Mahasiswa Terdaftar) ---
function getAllMahasiswa($conn) {
    global $hashsalt;

    $query = "SELECT m.nim, m.id_user, m.nama_lengkap, m.program_studi, m.angkatan, m.status_akademik, m.dosen_wali_nidn,
                     u.email AS user_email,
                     SHA2(CONCAT(m.nim, ?), 256) AS hash_profil
              FROM mahasiswa m
              LEFT JOIN users u ON m.id_user = u.id_user

              UNION ALL

              SELECT c.no_pendaftaran AS nim, c.id_user, c.nama_pendaftar AS nama_lengkap,
                     COALESCE(NULLIF(c.program_studi, ''), 'Teknik Informatika') AS program_studi,
                     YEAR(CURRENT_DATE) AS angkatan,
                     c.status_dokumen AS status_akademik,
                     NULL AS dosen_wali_nidn,
                     u.email AS user_email,
                     SHA2(CONCAT(c.no_pendaftaran, ?), 256) AS hash_profil
              FROM calon_mahasiswa c
              LEFT JOIN users u ON c.id_user = u.id_user
              WHERE NOT EXISTS (
                  SELECT 1 FROM mahasiswa m2 WHERE m2.id_user = c.id_user AND m2.nama_lengkap = c.nama_pendaftar
              )
              ORDER BY nim";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        responseJSON(["error" => "Query database gagal: " . $conn->error], 500);
        return;
    }

    $stmt->bind_param("ss", $hashsalt, $hashsalt);
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
        // Cek apakah data berada di tabel calon_mahasiswa
        $cCheck = $conn->prepare("SELECT id_pendaftar, no_pendaftaran, id_user, nama_pendaftar FROM calon_mahasiswa WHERE no_pendaftaran = ?");
        if ($cCheck) {
            $cCheck->bind_param("s", $originalNim);
            $cCheck->execute();
            $calonRow = $cCheck->get_result()->fetch_assoc();
            $cCheck->close();
            if ($calonRow) {
                $newNim         = trim($data['nim'] ?? $originalNim);
                $namaLengkap    = trim($data['nama_lengkap'] ?? $calonRow['nama_pendaftar']);
                $rawProdi       = trim($data['program_studi'] ?? '');
                $programStudi   = ($rawProdi !== '' && $rawProdi !== 'Calon Mahasiswa (PMB)') ? $rawProdi : 'Teknik Informatika';
                $angkatan       = (int)($data['angkatan'] ?? date('Y'));
                if ($angkatan < 1990 || $angkatan > 2100) {
                    $angkatan = (int)date('Y');
                }
                $statusAkademik = trim($data['status_akademik'] ?? 'Aktif');
                $dosenWaliNidn  = isset($data['dosen_wali_nidn']) && trim($data['dosen_wali_nidn']) !== '' ? trim($data['dosen_wali_nidn']) : null;
                $userEmail      = isset($data['user_email']) ? trim($data['user_email']) : null;

                $statusDiizinkan = ['Aktif', 'Cuti', 'Lulus', 'DO'];
                // Promosikan menjadi Mahasiswa Resmi jika:
                // 1) Status akademik diubah menjadi salah satu status aktif mahasiswa ('Aktif', 'Cuti', dsb)
                // 2) ATAU NIM diubah menjadi NIM resmi (bukan berawalan CLNMHS)
                $isPromoted = in_array($statusAkademik, $statusDiizinkan, true)
                              || ($newNim !== '' && !str_starts_with($newNim, 'CLNMHS'));

                if ($isPromoted) {
                    // Jika status akademik sebelumnya masih 'Menunggu Validasi' atau 'Valid', jadikan 'Aktif'
                    if (!in_array($statusAkademik, $statusDiizinkan, true)) {
                        $statusAkademik = 'Aktif';
                    }

                    // Tentukan NIM resmi
                    if ($newNim !== '' && !str_starts_with($newNim, 'CLNMHS')) {
                        $finalNim = $newNim;
                    } else {
                        // Generate NIM otomatis berikutnya dari max NIM numerik
                        $maxRes = $conn->query("SELECT MAX(CAST(nim AS UNSIGNED)) as max_nim FROM mahasiswa WHERE nim REGEXP '^[0-9]+$'");
                        $maxNim = ($maxRes && $mRow = $maxRes->fetch_assoc()) ? (int)$mRow['max_nim'] : 0;
                        if ($maxNim > 0) {
                            $finalNim = (string)($maxNim + 1);
                        } else {
                            $finalNim = date('y') . "01001";
                        }
                    }

                    // Pastikan NIM belum terdaftar di tabel mahasiswa
                    $cekNim = $conn->prepare("SELECT nim FROM mahasiswa WHERE nim = ?");
                    $cekNim->bind_param("s", $finalNim);
                    $cekNim->execute();
                    if ($cekNim->get_result()->num_rows > 0) {
                        $cekNim->close();
                        responseJSON(["error" => "NIM '$finalNim' sudah terdaftar untuk mahasiswa lain"], 409);
                        return;
                    }
                    $cekNim->close();

                    // Simpan ke tabel mahasiswa
                    $ins = $conn->prepare("INSERT INTO mahasiswa (nim, id_user, nama_lengkap, program_studi, angkatan, status_akademik, dosen_wali_nidn) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    if (!$ins) {
                        responseJSON(["error" => "Gagal menyiapkan insert mahasiswa: " . $conn->error], 500);
                        return;
                    }
                    $idUser = (int)$calonRow['id_user'];
                    $ins->bind_param("sississ", $finalNim, $idUser, $namaLengkap, $programStudi, $angkatan, $statusAkademik, $dosenWaliNidn);
                    $ins->execute();
                    $ins->close();

                    // Update role user menjadi mahasiswa jika ada akun user
                    if ($idUser > 0) {
                        $conn->query("UPDATE users SET role = 'mahasiswa' WHERE id_user = $idUser AND role = 'calon_mahasiswa'");
                    }

                    // Perbarui status calon_mahasiswa menjadi Valid & Lolos serta catat program studi pilihannya
                    $uCalon = $conn->prepare("UPDATE calon_mahasiswa SET status_dokumen = 'Valid', status_penerimaan = 'Lolos', nama_pendaftar = ?, program_studi = ? WHERE no_pendaftaran = ?");
                    if ($uCalon) {
                        $uCalon->bind_param("sss", $namaLengkap, $programStudi, $originalNim);
                        $uCalon->execute();
                        $uCalon->close();
                    }

                    // Ambil record mahasiswa baru yang berhasil dibuat
                    $ambilBaru = $conn->prepare(
                        "SELECT m.nim, m.id_user, m.nama_lengkap, m.program_studi, m.angkatan, m.status_akademik, m.dosen_wali_nidn,
                                u.email AS user_email,
                                SHA2(CONCAT(m.nim, ?), 256) AS hash_profil
                         FROM mahasiswa m
                         LEFT JOIN users u ON m.id_user = u.id_user
                         WHERE m.nim = ?"
                    );
                    $ambilBaru->bind_param("ss", $hashsalt, $finalNim);
                    $ambilBaru->execute();
                    $dataBaru = $ambilBaru->get_result()->fetch_assoc();
                    $ambilBaru->close();

                    responseJSON([
                        "message" => "Calon mahasiswa berhasil resmi diterima pada Program Studi $programStudi dengan NIM $finalNim!",
                        "data"    => $dataBaru,
                    ], 200);
                    return;
                } else {
                    // Update data calon mahasiswa saja (termasuk nama, program_studi, dan status dokumen)
                    $uProdi = ($rawProdi !== '' && $rawProdi !== 'Calon Mahasiswa (PMB)') ? $rawProdi : 'Teknik Informatika';
                    $validDocStatuses = ['Menunggu Validasi', 'Valid', 'Ditolak'];
                    $newDocStatus = in_array($statusAkademik, $validDocStatuses, true) ? $statusAkademik : 'Valid';
                    $uStmt = $conn->prepare("UPDATE calon_mahasiswa SET nama_pendaftar = ?, program_studi = ?, status_dokumen = ? WHERE no_pendaftaran = ?");
                    $uStmt->bind_param("ssss", $namaLengkap, $uProdi, $newDocStatus, $originalNim);
                    $uStmt->execute();
                    $uStmt->close();

                    $cAmbil = $conn->prepare(
                        "SELECT c.no_pendaftaran AS nim, c.id_user, c.nama_pendaftar AS nama_lengkap,
                                COALESCE(NULLIF(c.program_studi, ''), 'Teknik Informatika') AS program_studi,
                                YEAR(CURRENT_DATE) AS angkatan,
                                c.status_dokumen AS status_akademik,
                                NULL AS dosen_wali_nidn,
                                u.email AS user_email,
                                SHA2(CONCAT(c.no_pendaftaran, ?), 256) AS hash_profil
                         FROM calon_mahasiswa c
                         LEFT JOIN users u ON c.id_user = u.id_user
                         WHERE c.no_pendaftaran = ?"
                    );
                    $cAmbil->bind_param("ss", $hashsalt, $originalNim);
                    $cAmbil->execute();
                    $dataBaru = $cAmbil->get_result()->fetch_assoc();
                    $cAmbil->close();

                    responseJSON([
                        "message" => "Data calon mahasiswa berhasil diperbarui",
                        "data"    => $dataBaru,
                    ], 200);
                    return;
                }
            }
        }
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
        "sssisss",
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
