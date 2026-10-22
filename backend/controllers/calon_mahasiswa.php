<?php
// ============================================================
// controllers/calon_mahasiswa.php
// ============================================================
// Endpoint: ?endpoint=calon_mahasiswa
//   GET  (tanpa id)   -> semua data calon mahasiswa
//   GET  (&id=...)    -> 1 data by id_pendaftar ATAU no_pendaftaran
//   POST (multipart)  -> simpan pendaftaran baru
//
// Skema tabel `calon_mahasiswa` (yang dipakai di sini):
//   id_pendaftar     INT AUTO_INCREMENT (PK)
//   id_user          INT NOT NULL (FK -> users.id_user)
//   no_pendaftaran   VARCHAR(50) UNIQUE
//   nama_pendaftar   VARCHAR(255)
//   asal_sekolah     VARCHAR(255)
//   url_ijazah       VARCHAR(500)
//   url_kk           VARCHAR(500)
//   status_dokumen   ENUM('Menunggu Validasi','Valid','Ditolak')
//   status_penerimaan ENUM('Diproses','Lolos','Tidak Lolos')
// ============================================================

function handleCalonMahasiswa($conn, $id) {
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            if ($id !== null && $id !== '') {
                ambilDetailCalonMahasiswa($conn, $id);
            } else {
                ambilSemuaCalonMahasiswa($conn);
            }
            break;

        case 'POST':
            simpanPendaftaran($conn);
            break;

        default:
            responseJSON(["error" => "Metode HTTP $method tidak didukung"], 405);
            break;
    }
}

// ============================================================
// 1. FUNGSI SIMPAN PENDAFTARAN (POST multipart/form-data)
// ============================================================
function simpanPendaftaran($conn) {
    // ------------------------------------------------------------
    // A. BACA DATA TEKS DARI $_POST
    // ------------------------------------------------------------
    $idUser        = isset($_POST['id_user']) ? (int)$_POST['id_user'] : 0;
    $noPendaftaran = trim($_POST['no_pendaftaran'] ?? '');
    $namaPendaftar = trim($_POST['nama_pendaftar'] ?? '');
    $asalSekolah   = trim($_POST['asal_sekolah'] ?? '');
    $statusDokumen = trim($_POST['status_dokumen'] ?? 'Menunggu Validasi');

    if ($idUser <= 0) {
        responseJSON(["error" => "id_user wajib dikirim (user harus login terlebih dahulu)"], 400);
        return;
    }

    if ($noPendaftaran === '' || $namaPendaftar === '' || $asalSekolah === '') {
        responseJSON(["error" => "Semua kolom teks (No. Pendaftaran, Nama, Asal Sekolah) wajib diisi"], 400);
        return;
    }

    // Kolom status_dokumen adalah ENUM — nilai di luar daftar akan membuat SQL error.
    // Kalau frontend mengirim nilai aneh, diamankan kembali ke default.
    $statusDiizinkan = ['Menunggu Validasi', 'Valid', 'Ditolak'];
    if (!in_array($statusDokumen, $statusDiizinkan, true)) {
        $statusDokumen = 'Menunggu Validasi';
    }

    // ------------------------------------------------------------
    // B. PASTIKAN id_user ADA DI TABEL users (syarat Foreign Key)
    // ------------------------------------------------------------
    $userStmt = $conn->prepare("SELECT id_user FROM users WHERE id_user = ?");
    if (!$userStmt) {
        responseJSON(["error" => "Gagal menyiapkan query user: " . $conn->error], 500);
        return;
    }
    $userStmt->bind_param("i", $idUser);
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    $userAda = $userResult->num_rows > 0;
    $userStmt->close();

    if (!$userAda) {
        responseJSON(["error" => "id_user $idUser tidak terdaftar di tabel users"], 400);
        return;
    }

    // ------------------------------------------------------------
    // C. VALIDASI KEBERADAAN FILE DI $_FILES
    // ------------------------------------------------------------
    if (!isset($_FILES['ijazah']) || $_FILES['ijazah']['error'] === UPLOAD_ERR_NO_FILE) {
        responseJSON(["error" => "File Ijazah wajib diunggah"], 400);
        return;
    }

    if (!isset($_FILES['kk']) || $_FILES['kk']['error'] === UPLOAD_ERR_NO_FILE) {
        responseJSON(["error" => "File Kartu Keluarga (KK) wajib diunggah"], 400);
        return;
    }

    // ------------------------------------------------------------
    // D. SIAPKAN FOLDER UPLOAD
    // ------------------------------------------------------------
    $uploadDir = __DIR__ . '/../uploads';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0775, true)) {
            responseJSON(["error" => "Gagal membuat folder penyimpanan di server"], 500);
            return;
        }
    }

    // ------------------------------------------------------------
    // E. PROSES UPLOAD FILE FISIK KE SERVER
    // ------------------------------------------------------------
    $errorIjazah = '';
    $namaFileIjazah = prosesUploadBerkas($_FILES['ijazah'], 'ijazah', $uploadDir, $errorIjazah);
    if (!$namaFileIjazah) {
        responseJSON(["error" => "Ijazah: " . $errorIjazah], 400);
        return;
    }

    $errorKK = '';
    $namaFileKK = prosesUploadBerkas($_FILES['kk'], 'kk', $uploadDir, $errorKK);
    if (!$namaFileKK) {
        // Bersihkan ijazah yang sudah terlanjur tersimpan
        if (file_exists($uploadDir . '/' . $namaFileIjazah)) {
            unlink($uploadDir . '/' . $namaFileIjazah);
        }
        responseJSON(["error" => "Kartu Keluarga: " . $errorKK], 400);
        return;
    }

    // ------------------------------------------------------------
    // F. SIMPAN KE DATABASE (kolom WAJIB sama dengan skema tabel)
    // ------------------------------------------------------------
    $query = "INSERT INTO calon_mahasiswa
              (id_user, no_pendaftaran, nama_pendaftar, asal_sekolah, url_ijazah, url_kk, status_dokumen)
              VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        responseJSON(["error" => "Gagal menyiapkan query database: " . $conn->error], 500);
        return;
    }

    // "issssss" = 1 integer (id_user) + 6 string
    $stmt->bind_param("issssss",
        $idUser,
        $noPendaftaran,
        $namaPendaftar,
        $asalSekolah,
        $namaFileIjazah,
        $namaFileKK,
        $statusDokumen
    );

    // PHP 8.1+ default: mysqli melempar exception (mysqli_sql_exception)
    // alih-alih mengembalikan false. Jadi execute() wajib dibungkus try/catch —
    // kalau tidak, error duplicate jadi 500 generik dan file upload tidak
    // sempat dibersihkan.
    try {
        $stmt->execute();
    } catch (mysqli_sql_exception $e) {
        // Bersihkan file fisik jika database gagal
        @unlink($uploadDir . '/' . $namaFileIjazah);
        @unlink($uploadDir . '/' . $namaFileKK);

        // Error 1062 = duplicate unique key (no_pendaftaran sudah terdaftar)
        if ((int)$e->getCode() === 1062 || $conn->errno === 1062) {
            responseJSON(["error" => "Nomor pendaftaran $noPendaftaran sudah terdaftar!"], 409);
        } else {
            responseJSON(["error" => "Gagal menyimpan data ke database: " . $e->getMessage()], 500);
        }
        $stmt->close();
        return;
    }

    $idBaru = $stmt->insert_id;
    $stmt->close();

    // ------------------------------------------------------------
    // G. BALAS JSON KE FRONTEND
    // ------------------------------------------------------------
    responseJSON([
        "message" => "Pendaftaran calon mahasiswa berhasil disimpan",
        "data" => [
            "id_pendaftar"   => $idBaru,
            "id_user"        => $idUser,
            "no_pendaftaran" => $noPendaftaran,
            "nama_pendaftar" => $namaPendaftar,
            "asal_sekolah"   => $asalSekolah,
            "status_dokumen" => $statusDokumen,
            "ijazah_file"    => $namaFileIjazah,
            "kk_file"        => $namaFileKK,
        ]
    ], 201);
}

// ============================================================
// 2. FUNGSI PEMBANTU: PROSES UPLOAD BERKAS
// ============================================================
function prosesUploadBerkas($file, $awalanPrefix, $folderTujuan, &$pesanError) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $pesanError = "Terjadi kegagalan upload file (Kode: " . $file['error'] . ")";
        return null;
    }

    // Batas ukuran: 2 MB
    $maxBytes = 2 * 1024 * 1024;
    if ($file['size'] > $maxBytes) {
        $pesanError = "Ukuran file terlalu besar. Maksimal 2MB";
        return null;
    }

    $ekstensi = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $ekstensiDiizinkan = ['jpg', 'jpeg', 'png', 'pdf'];

    if (!in_array($ekstensi, $ekstensiDiizinkan, true)) {
        $pesanError = "Format file tidak didukung. Wajib JPG, PNG, atau PDF";
        return null;
    }

    // Nama unik: prefix_timestamp_acak.ekstensi
    $namaUnik = $awalanPrefix . '_' . time() . '_' . bin2hex(random_bytes(3)) . '.' . $ekstensi;
    $tujuanFisik = $folderTujuan . '/' . $namaUnik;

    if (!move_uploaded_file($file['tmp_name'], $tujuanFisik)) {
        $pesanError = "Gagal memindahkan file ke direktori server";
        return null;
    }

    return $namaUnik;
}

// ============================================================
// 3. FUNGSI AMBIL SEMUA DATA (GET)
// ============================================================
function ambilSemuaCalonMahasiswa($conn) {
    // Tabel ini TIDAK punya kolom created_at — urut dari id terbaru.
    $query = "SELECT id_pendaftar, id_user, no_pendaftaran, nama_pendaftar,
                     asal_sekolah, url_ijazah, url_kk, status_dokumen, status_penerimaan
              FROM calon_mahasiswa
              ORDER BY id_pendaftar DESC";
    $result = $conn->query($query);

    if (!$result) {
        responseJSON(["error" => "Gagal mengambil data: " . $conn->error], 500);
        return;
    }

    $daftar = [];
    while ($row = $result->fetch_assoc()) {
        $daftar[] = $row;
    }

    responseJSON($daftar, 200);
}

// ============================================================
// 4. FUNGSI AMBIL DETAIL 1 DATA (GET &id=...)
// ============================================================
function ambilDetailCalonMahasiswa($conn, $id) {
    // Boleh dicari lewat id_pendaftar (angka) ATAU no_pendaftaran (teks)
    $stmt = $conn->prepare(
        "SELECT id_pendaftar, id_user, no_pendaftaran, nama_pendaftar,
                asal_sekolah, url_ijazah, url_kk, status_dokumen, status_penerimaan
         FROM calon_mahasiswa
         WHERE id_pendaftar = ? OR no_pendaftaran = ?"
    );
    if (!$stmt) {
        responseJSON(["error" => "Gagal mempersiapkan query: " . $conn->error], 500);
        return;
    }

    $stmt->bind_param("ss", $id, $id);
    $stmt->execute();

    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    $stmt->close();

    if (!$data) {
        responseJSON(["error" => "Data calon mahasiswa tidak ditemukan"], 404);
        return;
    }

    responseJSON($data, 200);
}
