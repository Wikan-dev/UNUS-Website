<?php
        ￼case 'GET':
            ￼if ($id !== null && $id !== '') {
                ambilDetailCalonMahasiswa($conn, $id);
            ￼} else {
                ambilSemuaCalonMahasiswa($conn);
            }
            break;

        ￼default:
            responseJSON(["error" => "Metode HTTP $method tidak didukung"], 405);
            break;
    }
}

// ============================================================
// 1. FUNGSI SIMPAN PENDAFTARAN (POST)
// ============================================================
￼function simpanPendaftaran($conn) {
    // ------------------------------------------------------------
    // A. BACA DATA TEKS DARI $_POST
    // ------------------------------------------------------------
    $noPendaftaran = trim($_POST['no_pendaftaran'] ?? '');
    $namaPendaftar = trim($_POST['nama_pendaftar'] ?? '');
    $asalSekolah   = trim($_POST['asal_sekolah'] ?? '');<?php
        ￼case 'GET':
            ￼if ($id !== null && $id !== '') {
                ambilDetailCalonMahasiswa($conn, $id);
            ￼} else {
                ambilSemuaCalonMahasiswa($conn);
            }
            break;

        ￼default:
            responseJSON(["error" => "Metode HTTP $method tidak didukung"], 405);
            break;
    }
}

// ============================================================
// 1. FUNGSI SIMPAN PENDAFTARAN (POST)
// ============================================================
￼function simpanPendaftaran($conn) {
    // ------------------------------------------------------------
    // A. BACA DATA TEKS DARI $_POST
    // ------------------------------------------------------------
    $noPendaftaran = trim($_POST['no_pendaftaran'] ?? '');
    $namaPendaftar = trim($_POST['nama_pendaftar'] ?? '');
    $asalSekolah   = trim($_POST['asal_sekolah'] ?? '');
    $statusDokumen = trim($_POST['status_dokumen'] ?? 'Menunggu');

    // Validasi data teks tidak boleh kosong
    ￼if ($noPendaftaran === '' || $namaPendaftar === '' || $asalSekolah === '') {
        responseJSON(["error" => "Semua kolom teks (No. Pendaftaran, Nama, Asal Sekolah) wajib diisi"], 400);
        return;
    }

    // ------------------------------------------------------------
    // B. VALIDASI KEBERADAAN FILE BERKAS DI $_FILES
    // ------------------------------------------------------------
    ￼if (!isset($_FILES['ijazah']) || $_FILES['ijazah']['error'] === UPLOAD_ERR_NO_FILE) {
        responseJSON(["error" => "File Ijazah wajib diunggah"], 400);
        return;
    }

    ￼if (!isset($_FILES['kk']) || $_FILES['kk']['error'] === UPLOAD_ERR_NO_FILE) {
        responseJSON(["error" => "File Kartu Keluarga (KK) wajib diunggah"], 400);
        return;
    }

    // ------------------------------------------------------------
    // C. PERIKSA FOLDER PENYIMPANAN UPLOAD
    // ------------------------------------------------------------
    $uploadDir = __DIR__ . '/../uploads';
    ￼if (!is_dir($uploadDir)) {
        // Buat folder uploads otomatis jika '] ?? '');
    $statusDokumen = trim($_POST['status_dokumen'] ?? 'Menunggu');

    // Validasi data teks tidak boleh kosong
    ￼if ($noPendaftaran === '' || $namaPendaftar === '' || $asalSekolah === '') {
        responseJSON(["error" => "Semua kolom teks (No. Pendaftaran, Nama, Asal Sekolah) wajib diisi"], 400);
        return;
    }

    // ------------------------------------------------------------
    // B. VALIDASI KEBERADAAN FILE BERKAS DI $_FILES
    // ------------------------------------------------------------
    ￼if (!isset($_FILES['ijazah']) || $_FILES['ijazah']['error'] === UPLOAD_ERR_NO_FILE) {
        responseJSON(["error" => "File Ijazah wajib diunggah"], 400);
        return;
    }

    ￼if (!isset($_FILES['kk']) || $_FILES['kk']['error'] === UPLOAD_ERR_NO_FILE) {
        responseJSON(["error" => "File Kartu Keluarga (KK) wajib diunggah"], 400);
        return;
    }

    // ------------------------------------------------------------
    // C. PERIKSA FOLDER PENYIMPANAN UPLOAD
    // ------------------------------------------------------------
    $uploadDir = __DIR__ . '/../uploads';
    ￼if (!is_dir($uploadDir)) {
        // Buat folder uploads otomatis jika belum ada
        if (!mkdir($uploadDir, 0775, true)) {
            responseJSON(["error" => "Gagal membuat folder penyimpanan di server"], 500);
            return;
        }
    }

    // ------------------------------------------------------------
    // D. PROSES UPLOAD FILE FISIK KE SERVER
    // ------------------------------------------------------------
    // Upload file ijazah
    $namaFileIjazah = prosesUploadBerkas($_FILES['ijazah'], 'ijazah', $uploadDir, $errorIjazah);
    if (!$namaFileIjazah) {
        responseJSON(["error" => "Ijazah: " . $errorIjazah], 400);
        return;
    }

    // Upload file KK
    $namaFileKK = prosesUploadBerkas($_FILES['kk'], 'kk', $uploadDir, $errorKK);
    if (!$namaFileKK) {
        // Hapus file ijazah yang sudah terlanjur terupload jika upload KK gagal
        if (file_exists($uploadDir . '/' . $namaFileIjazah)) {
            unlink($uploadDir . '/' . $namaFileIjazah);
        }
        responseJSON(["error" => "Kartu Keluarga: " . $errorKK], 400);
        return;
    }

    // ------------------------------------------------------------
    // E. SIMPAN KE DATABASE (PREPARED STATEMENT)
    // ------------------------------------------------------------
    $query = "INSERT INTO calon_mahasiswa 
              (no_pendaftaran, nama_pendaftar, asal_sekolah, ijazah_path, kk_path, status_dokumen) 
              VALUES (?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        responseJSON(["error" => "Gagal menyiapkan query database: " . $conn->error], 500);
        return;
    }

    // "ssssss" = 6 parameter bertipe String
    $stmt->bind_param("ssssss", 
        $noPendaftaran, 
        $namaPendaftar, 
        $asalSekolah, 
        $namaFileIjazah, 
        $namaFileKK, 
        $statusDokumen
    );

    if (!$stmt->execute()) {
        // Bersihkan file fisik yang sudah diupload jika database error
        @unlink($uploadDir . '/' . $namaFileIjazah);
        @unlink($uploadDir . '/' . $namaFileKK);

        // Jika error karena no_pendaftaran duplikat (Error Code 1062)
        if ($conn->errno === 1062) {
            responseJSON(["error" => "Nomor pendaftaran $noPendaftaran sudah terdaftar!"], 409);
        } else {
            responseJSON(["error" => "Gagal menyimpan data ke database: " . $stmt->error], 500);
        }
        $stmt->close();
        return;
    }

    $idBaru = $stmt->insert_id;
    $stmt->close();

    // ------------------------------------------------------------
    // F. BALAS JSON KE FRONTEND
    // ------------------------------------------------------------
    responseJSON([
        "message" => "Pendaftaran calon mahasiswa berhasil disimpan",
        "data" => [
            "id"             => $idBaru,
            "no_pendaftaran" => $noPendaftaran,
            "nama_pendaftar" => $namaPendaftar,
            "status_dokumen" => $statusDokumen,
            "ijazah_file"    => $namaFileIjazah,
            "kk_file"        => $namaFileKK
        ]
    ], 201);
}

// ============================================================
// 2. FUNGSI PEMBANTU: PROSES UPLOAD BERKAS
// ============================================================
function prosesUploadBerkas($file, $awalanPrefix, $folderTujuan, &$pesanError) {
    // Cek error bawaan PHP
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $pesanError = "Terjadi kegagalan upload file (Kode: " . $file['error'] . ")";
        return null;
    }

    // Batas ukuran: 2 MB (2 * 1024 * 1024 bytes)
    $maxBytes = 2 * 1024 * 1024;
    if ($file['size'] > $maxBytes) {
        $pesanError = "Ukuran file terlalu besar. Maksimal 2MB";
        return null;
    }

    // Validasi ekstensi yang diizinkan
    $ekstensi = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $ekstensiDiizinkan = ['jpg', 'jpeg', 'png', 'pdf'];

    if (!in_array($ekstensi, $ekstensiDiizinkan, true)) {
        $pesanError = "Format file tidak didukung. Wajib JPG, PNG, atau PDF";
        return null;
    }

    // Buat nama file unik: prefix_timestamp_acak.ekstensi
    // Contoh: ijazah_1729158000_653a1b.jpg
    $namaUnik = $awalanPrefix . '_' . time() . '_' . bin2hex(random_bytes(3)) . '.' . $ekstensi;
    $tujuanFisik = $folderTujuan . '/' . $namaUnik;

    // Pindahkan dari folder temporary sistem ke folder uploads proyek
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
    $query = "SELECT id, no_pendaftaran, nama_pendaftar, asal_sekolah, status_dokumen, created_at 
              FROM calon_mahasiswa 
              ORDER BY id DESC";
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
    $stmt = $conn->prepare("SELECT * FROM calon_mahasiswa WHERE id = ? OR no_pendaftaran = ?");
    if (!$stmt) {
        responseJSON(["error" => "Gagal mempersiapkan query: " . $conn->error], 500);
        return;
    }

    // "ss" = periksa apakah cocok dengan ID numerik atau string No. Pendaftaran
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
