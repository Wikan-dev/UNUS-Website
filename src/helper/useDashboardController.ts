// ============================================================
// helper/useDashboardController.ts
// Custom hook yang mengelola state, aksi, dan logika bisnis Dashboard
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Mahasiswa } from './types';
import type { StudentFormData, ModalConfig, FieldChange } from './dashboardTypes';
import { DEFAULT_YEAR } from './dashboardConstants';
import { getCurrentUser } from './auth';
import {
  fetchAllMahasiswa,
  fetchMahasiswaDetail,
  updateMahasiswaDetail,
  deleteMahasiswaPermanent,
  detectStudentChanges,
} from './dashboardApi';
import { useSessionPath } from './useSessionPath';

export function useDashboardController(IDMahasiswa?: string) {
  const navigate = useNavigate();
  const basePath = useSessionPath();

  // Pengguna & Otoritas Akses
  const currentUser = getCurrentUser();
  const isAdminUser = currentUser?.role === 'admin';
  const [adminSimulated, setAdminSimulated] = useState<boolean>(false);
  const hasAdminAccess = Boolean(isAdminUser || adminSimulated);

  // Data Mahasiswa
  const [mhs, setMhs] = useState<Mahasiswa | null>(null);
  const [allStudents, setAllStudents] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState<boolean>(() => Boolean(IDMahasiswa));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Mode Edit & Formulir
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<StudentFormData>(() => ({
    nim: '',
    nama_lengkap: '',
    program_studi: '',
    angkatan: DEFAULT_YEAR,
    status_akademik: 'Aktif',
    dosen_wali_nidn: '',
    user_email: '',
  }));

  // Modal Dialog Peringatan
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  // Sinkronkan form dengan data mahasiswa
  const syncFormWithStudent = useCallback((student: Mahasiswa) => {
    setFormData({
      nim: student.nim || '',
      nama_lengkap: student.nama_lengkap || '',
      program_studi: student.program_studi || '',
      angkatan: student.angkatan ? Number(student.angkatan) : DEFAULT_YEAR,
      status_akademik: student.status_akademik || 'Aktif',
      dosen_wali_nidn: student.dosen_wali_nidn || '',
      user_email: student.user_email || '',
    });
  }, []);

  // Tutup dialog modal
  const closeModal = useCallback(() => {
    setModalConfig(null);
  }, []);

  // Update nilai parsial form
  const handleFormChange = useCallback((updated: Partial<StudentFormData>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  }, []);

  // Toggle simulasi admin
  const handleToggleAdmin = useCallback(
    (active: boolean) => {
      setAdminSimulated(active);
      if (!active && isEditing) {
        setIsEditing(false);
      }
    },
    [isEditing]
  );

  // Muat daftar seluruh mahasiswa untuk dropdown cepat
  useEffect(() => {
    let isMounted = true;
    fetchAllMahasiswa()
      .then((data) => {
        if (isMounted) setAllStudents(data);
      })
      .catch(() => {
        // Abaikan error minor list
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Muat detail 1 mahasiswa
  useEffect(() => {
    if (!IDMahasiswa) return;

    let isMounted = true;
    fetchMahasiswaDetail(IDMahasiswa)
      .then((data) => {
        if (!isMounted) return;
        setMhs(data);
        syncFormWithStudent(data);
        setIsEditing(false);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat profil mahasiswa.');
        setMhs(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [IDMahasiswa, syncFormWithStudent]);

  // Evaluasi daftar perubahan data
  const detectedChanges: FieldChange[] = useMemo(() => {
    return detectStudentChanges(mhs, formData);
  }, [mhs, formData]);

  const hasSensitiveChanges = useMemo(() => {
    return detectedChanges.some((c) => c.isSensitive);
  }, [detectedChanges]);

  // ============================================================
  // Eksekusi API Simpan Perubahan
  // ============================================================
  const executeSave = useCallback(async () => {
    if (!mhs) return;
    setSaving(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const updated = await updateMahasiswaDetail(mhs.nim, formData);
      setMhs(updated);
      syncFormWithStudent(updated);
      setIsEditing(false);
      setSuccessNotice('Semua perubahan data mahasiswa berhasil disimpan ke sistem!');

      // Jika NIM berubah, URL hash profil ikut berganti
      if (updated.hash_profil && updated.hash_profil !== IDMahasiswa) {
        navigate(`${basePath}/DashBoardMahasiswa/${updated.hash_profil}`, { replace: true });
      }

      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kegagalan saat menyimpan.');
      closeModal();
    } finally {
      setSaving(false);
    }
  }, [mhs, formData, IDMahasiswa, navigate, basePath, syncFormWithStudent, closeModal]);

  // ============================================================
  // AKSI 1: Masuk Mode Edit (dengan Peringatan)
  // ============================================================
  const triggerEnterEditMode = useCallback(() => {
    if (!hasAdminAccess) {
      setModalConfig({
        isOpen: true,
        type: 'warning',
        title: 'Hak Akses Dibatasi',
        description:
          'Hanya Administrator yang memiliki wewenang untuk mengubah data mahasiswa. Silakan aktifkan Mode Administrator terlebih dahulu.',
        confirmLabel: 'Aktifkan Mode Admin & Lanjutkan',
        cancelLabel: 'Tutup',
        confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        onConfirm: () => {
          setAdminSimulated(true);
          setIsEditing(true);
          closeModal();
        },
      });
      return;
    }

    setModalConfig({
      isOpen: true,
      type: 'info',
      title: 'Konfirmasi: Masuk Mode Pengeditan',
      description:
        'Anda akan membuka formulir pengeditan seluruh data mahasiswa ini. Pastikan Anda berhati-hati dan teliti saat memperbarui informasi mahasiswa.',
      confirmLabel: 'Ya, Buka Formulir Edit',
      cancelLabel: 'Batal',
      confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      onConfirm: () => {
        setIsEditing(true);
        closeModal();
      },
    });
  }, [hasAdminAccess, closeModal]);

  // ============================================================
  // AKSI 2: Batal Edit (dengan Peringatan jika ada perubahan)
  // ============================================================
  const triggerCancelEdit = useCallback(() => {
    if (detectedChanges.length === 0) {
      setIsEditing(false);
      return;
    }

    setModalConfig({
      isOpen: true,
      type: 'warning',
      title: 'Peringatan: Batalkan Pengeditan?',
      description: `Terdapat ${detectedChanges.length} perubahan yang belum disimpan. Jika Anda membatalkan sekarang, seluruh isian baru akan dibuang dan kembali ke data asli.`,
      confirmLabel: 'Ya, Buang Perubahan',
      cancelLabel: 'Tetap Mengedit',
      confirmButtonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      changesSummary: detectedChanges,
      onConfirm: () => {
        if (mhs) syncFormWithStudent(mhs);
        setIsEditing(false);
        closeModal();
      },
    });
  }, [detectedChanges, mhs, syncFormWithStudent, closeModal]);

  // ============================================================
  // AKSI 3: Reset Formulir ke Data Asli (dengan Peringatan)
  // ============================================================
  const triggerResetForm = useCallback(() => {
    if (detectedChanges.length === 0) return;

    setModalConfig({
      isOpen: true,
      type: 'warning',
      title: 'Peringatan: Reset Formulir?',
      description: 'Apakah Anda yakin ingin mengembalikan seluruh isian formulir ke nilai awal database?',
      confirmLabel: 'Ya, Reset Formulir',
      cancelLabel: 'Batal',
      confirmButtonClass: 'bg-gray-700 hover:bg-gray-800 text-white',
      onConfirm: () => {
        if (mhs) syncFormWithStudent(mhs);
        closeModal();
      },
    });
  }, [detectedChanges, mhs, syncFormWithStudent, closeModal]);

  // ============================================================
  // AKSI 4: Simpan Seluruh Perubahan (dengan Peringatan Berjenjang)
  // ============================================================
  const triggerSaveAll = useCallback(() => {
    if (!formData.nim.trim()) {
      setError('Peringatan Validasi: NIM tidak boleh kosong.');
      return;
    }
    if (!formData.nama_lengkap.trim()) {
      setError('Peringatan Validasi: Nama lengkap mahasiswa tidak boleh kosong.');
      return;
    }
    if (!formData.program_studi.trim()) {
      setError('Peringatan Validasi: Program studi wajib dipilih/diisi.');
      return;
    }
    if (Number(formData.angkatan) < 1990 || Number(formData.angkatan) > 2100) {
      setError('Peringatan Validasi: Tahun angkatan tidak valid (rentang 1990 - 2100).');
      return;
    }

    if (detectedChanges.length === 0) {
      setSuccessNotice('Tidak ada perubahan yang dilakukan pada data.');
      setIsEditing(false);
      return;
    }

    // Jika ada data sensitif yang diubah -> Gunakan Modal Peringatan Tingkat Tinggi (DANGER)
    if (hasSensitiveChanges) {
      setModalConfig({
        isOpen: true,
        type: 'danger',
        dangerBadgeText: '⚠️ PERINGATAN KRITIS: DATA SENSITIF TERUBAH',
        title: 'Konfirmasi Perubahan Data Kritis & Sensitif',
        description:
          'Sistem mendeteksi bahwa Anda telah mengubah data di Bagian Berbahaya (NIM atau Status Akademik). Perubahan ini berdampak langsung pada identitas database, relasi nilai/KRS, absensi perkuliahan, dan hak akses portal mahasiswa.',
        confirmLabel: 'Saya Memahami Risikonya & Tetap Simpan',
        cancelLabel: 'Periksa Kembali',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white font-semibold',
        changesSummary: detectedChanges,
        onConfirm: executeSave,
      });
      return;
    }

    // Peringatan normal untuk data umum
    setModalConfig({
      isOpen: true,
      type: 'warning',
      title: 'Konfirmasi: Simpan Perubahan Mahasiswa',
      description: 'Mohon pastikan data yang telah Anda perbarui sudah sesuai dengan dokumen resmi mahasiswa.',
      confirmLabel: 'Ya, Simpan Perubahan',
      cancelLabel: 'Batal',
      confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      changesSummary: detectedChanges,
      onConfirm: executeSave,
    });
  }, [formData, detectedChanges, hasSensitiveChanges, executeSave]);

  // ============================================================
  // AKSI 5: Simpan Khusus Bagian Data Sensitif (di Zona Berbahaya)
  // ============================================================
  const triggerSaveSensitiveOnly = useCallback(() => {
    const sensitiveChanges = detectedChanges.filter((c) => c.isSensitive);

    if (sensitiveChanges.length === 0) {
      setError('Tidak ada perubahan pada data sensitif (NIM atau Status Akademik).');
      return;
    }

    setModalConfig({
      isOpen: true,
      type: 'danger',
      dangerBadgeText: '🚨 PERINGATAN AREA BERBAHAYA',
      title: 'Konfirmasi Eksekusi: Simpan Zona Berbahaya',
      description:
        'Anda secara spesifik akan memperbarui data kunci pada Zona Berbahaya. Pastikan Nomor Induk Mahasiswa (NIM) dan Status Akademik telah diverifikasi sesuai Surat Keputusan (SK) resmi Rektorat.',
      confirmLabel: 'Konfirmasi & Terapkan Data Sensitif',
      cancelLabel: 'Batal',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
      changesSummary: sensitiveChanges,
      onConfirm: executeSave,
    });
  }, [detectedChanges, executeSave]);

  // ============================================================
  // AKSI 6: Hapus Data Mahasiswa (Aksi Ekstrem Berbahaya)
  // ============================================================
  const triggerDeleteStudent = useCallback(() => {
    if (!mhs) return;

    setModalConfig({
      isOpen: true,
      type: 'danger',
      dangerBadgeText: '🚨 AKSI KRITIS TIDAK DAPAT DIBATALKAN',
      title: `Hapus Mahasiswa Permanen: ${mhs.nama_lengkap}?`,
      description: `Mahasiswa dengan NIM ${mhs.nim} beserta seluruh relasi absensi dan KRS akan dihapus permanen dari basis data Universitas Nusantara. Untuk melanjutkan, ketik kata "HAPUS" pada kotak di bawah.`,
      confirmLabel: 'Hapus Permanen Sekarang',
      cancelLabel: 'Batalkan',
      confirmButtonClass: 'bg-red-700 hover:bg-red-800 text-white font-bold',
      requireInputMatch: 'HAPUS',
      onConfirm: async () => {
        setSaving(true);
        try {
          await deleteMahasiswaPermanent(mhs.nim);
          closeModal();
          navigate(`${basePath}/Home`, { replace: true });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Gagal menghapus mahasiswa.');
          closeModal();
        } finally {
          setSaving(false);
        }
      },
    });
  }, [mhs, navigate, basePath, closeModal]);

  return {
    mhs,
    allStudents,
    loading,
    saving,
    error,
    successNotice,
    isEditing,
    formData,
    hasAdminAccess,
    detectedChanges,
    hasSensitiveChanges,
    modalConfig,
    closeModal,
    handleFormChange,
    handleToggleAdmin,
    handleClearSuccess: () => setSuccessNotice(null),
    handleClearError: () => setError(null),
    triggerEnterEditMode,
    triggerCancelEdit,
    triggerResetForm,
    triggerSaveAll,
    triggerSaveSensitiveOnly,
    triggerDeleteStudent,
  };
}
