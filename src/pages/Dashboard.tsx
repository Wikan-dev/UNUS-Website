import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo, type FormEvent } from 'react';
import type { Mahasiswa } from '../helper/types.tsx';
import { getCurrentUser } from '../helper/auth.ts';

// Tipe untuk data formulir pengeditan
interface StudentFormData {
  nim: string;
  nama_lengkap: string;
  program_studi: string;
  angkatan: number;
  status_akademik: string;
  dosen_wali_nidn: string;
  user_email: string;
}

// Konfigurasi dialog peringatan / modal konfirmasi
interface ModalConfig {
  isOpen: boolean;
  type: 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmButtonClass?: string;
  dangerBadgeText?: string;
  requireInputMatch?: string;
  changesSummary?: Array<{
    label: string;
    oldVal: string;
    newVal: string;
    isSensitive?: boolean;
  }>;
  onConfirm: () => void | Promise<void>;
}

// Tahun standar awal
const DEFAULT_YEAR = 2025;

// Daftar pilihan Program Studi standar di UNUS
const PRODI_OPTIONS = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Teknik Elektro',
  'Teknik Industri',
  'Ilmu Komunikasi',
  'Manajemen',
  'Akuntansi',
  'Hukum',
];

// Daftar pilihan Status Akademik
const STATUS_OPTIONS = [
  { value: 'Aktif', label: 'Aktif', desc: 'Mahasiswa terdaftar aktif mengikuti kegiatan akademik perkuliahan & KRS.', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'Cuti', label: 'Cuti', desc: 'Mahasiswa mengambil masa cuti resmi, hak akses pengisian KRS dihentikan sementara.', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'Lulus', label: 'Lulus', desc: 'Mahasiswa telah menyelesaikan seluruh kurikulum dan yudisium.', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'DO', label: 'DO (Drop Out)', desc: 'Status kritis: mahasiswa diberhentikan secara permanen dari pangkalan data akademik.', badgeClass: 'bg-red-100 text-red-800 border-red-300' },
];

export default function DashboardMahasiswa() {
  const { IDMahasiswa } = useParams<{ IDMahasiswa?: string }>();
  const navigate = useNavigate();

  // Pengguna yang sedang login
  const currentUser = getCurrentUser();
  const isAdminUser = currentUser?.role === 'admin';

  // State Mahasiswa
  const [mhs, setMhs] = useState<Mahasiswa | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(IDMahasiswa));
  const [saving, setSaving] = useState(false);

  // State Mahasiswa List (untuk pemilih mahasiswa di dashboard)
  const [allStudents, setAllStudents] = useState<Mahasiswa[]>([]);

  // State Mode Admin & Edit
  const [adminSimulated, setAdminSimulated] = useState<boolean>(false);
  const hasAdminAccess = Boolean(isAdminUser || adminSimulated);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // State Nilai Formulir
  const [formData, setFormData] = useState<StudentFormData>(() => ({
    nim: '',
    nama_lengkap: '',
    program_studi: '',
    angkatan: DEFAULT_YEAR,
    status_akademik: 'Aktif',
    dosen_wali_nidn: '',
    user_email: '',
  }));

  // State Modal Konfirmasi / Peringatan
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [typedConfirmation, setTypedConfirmation] = useState('');

  // Muat daftar semua mahasiswa untuk dropdown navigasi cepat
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch('/api.php?endpoint=mahasiswa');
        if (res.ok) {
          const list: Mahasiswa[] = await res.json();
          setAllStudents(list);
        }
      } catch {
        // Abaikan kegagalan minor fetch list
      }
    };
    fetchAll();
  }, []);

  // Muat detail mahasiswa yang dipilih
  useEffect(() => {
    if (!IDMahasiswa) {
      return;
    }

    const ambilDetail = async () => {
      setLoading(true);
      setError(null);
      setSuccessNotice(null);
      try {
        const res = await fetch(`/api.php?endpoint=mahasiswa&h=${encodeURIComponent(IDMahasiswa)}`);
        if (res.status === 404) {
          setError('Profil mahasiswa tidak ditemukan di pangkalan data.');
          setMhs(null);
          return;
        }
        if (!res.ok) {
          throw new Error('Gagal memuat detail data mahasiswa');
        }
        const data: Mahasiswa = await res.json();
        setMhs(data);
        setFormData({
          nim: data.nim || '',
          nama_lengkap: data.nama_lengkap || '',
          program_studi: data.program_studi || '',
          angkatan: data.angkatan ? Number(data.angkatan) : new Date().getFullYear(),
          status_akademik: data.status_akademik || 'Aktif',
          dosen_wali_nidn: data.dosen_wali_nidn || '',
          user_email: data.user_email || '',
        });
        setIsEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat mengambil data.');
      } finally {
        setLoading(false);
      }
    };

    ambilDetail();
  }, [IDMahasiswa]);

  // Evaluasi daftar perubahan data
  const detectedChanges = useMemo(() => {
    if (!mhs) return [];
    const list: Array<{ label: string; oldVal: string; newVal: string; isSensitive?: boolean }> = [];

    if (formData.nama_lengkap.trim() !== (mhs.nama_lengkap || '').trim()) {
      list.push({
        label: 'Nama Lengkap',
        oldVal: mhs.nama_lengkap || '-',
        newVal: formData.nama_lengkap,
      });
    }

    if (formData.program_studi.trim() !== (mhs.program_studi || '').trim()) {
      list.push({
        label: 'Program Studi',
        oldVal: mhs.program_studi || '-',
        newVal: formData.program_studi,
      });
    }

    if (Number(formData.angkatan) !== Number(mhs.angkatan)) {
      list.push({
        label: 'Tahun Angkatan',
        oldVal: String(mhs.angkatan || '-'),
        newVal: String(formData.angkatan),
      });
    }

    if ((formData.dosen_wali_nidn || '').trim() !== (mhs.dosen_wali_nidn || '').trim()) {
      list.push({
        label: 'Dosen Wali (NIDN)',
        oldVal: mhs.dosen_wali_nidn || 'Belum Ditentukan',
        newVal: formData.dosen_wali_nidn || 'Dikosongkan',
      });
    }

    if ((formData.user_email || '').trim() !== (mhs.user_email || '').trim()) {
      list.push({
        label: 'Email Akun Mahasiswa',
        oldVal: mhs.user_email || '-',
        newVal: formData.user_email || '-',
      });
    }

    // DATA SENSITIF
    if (formData.nim.trim() !== (mhs.nim || '').trim()) {
      list.push({
        label: 'NIM (Primary Key & Hash Profil)',
        oldVal: mhs.nim || '-',
        newVal: formData.nim,
        isSensitive: true,
      });
    }

    if (formData.status_akademik.trim() !== (mhs.status_akademik || '').trim()) {
      list.push({
        label: 'Status Akademik',
        oldVal: mhs.status_akademik || '-',
        newVal: formData.status_akademik,
        isSensitive: true,
      });
    }

    return list;
  }, [mhs, formData]);

  const hasSensitiveChanges = useMemo(() => {
    return detectedChanges.some((c) => c.isSensitive);
  }, [detectedChanges]);

  // Tutup modal
  const closeModal = () => {
    setModalConfig(null);
    setTypedConfirmation('');
  };

  // ============================================================
  // AKSI 1: Masuk ke Mode Edit (dengan Peringatan)
  // ============================================================
  const triggerEnterEditMode = () => {
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
  };

  // ============================================================
  // AKSI 2: Batalkan Pengeditan (dengan Peringatan jika ada perubahan)
  // ============================================================
  const triggerCancelEdit = () => {
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
        if (mhs) {
          setFormData({
            nim: mhs.nim || '',
            nama_lengkap: mhs.nama_lengkap || '',
            program_studi: mhs.program_studi || '',
            angkatan: mhs.angkatan ? Number(mhs.angkatan) : new Date().getFullYear(),
            status_akademik: mhs.status_akademik || 'Aktif',
            dosen_wali_nidn: mhs.dosen_wali_nidn || '',
            user_email: mhs.user_email || '',
          });
        }
        setIsEditing(false);
        closeModal();
      },
    });
  };

  // ============================================================
  // AKSI 3: Reset Formulir ke Data Asli (dengan Peringatan)
  // ============================================================
  const triggerResetForm = () => {
    if (detectedChanges.length === 0) {
      return;
    }

    setModalConfig({
      isOpen: true,
      type: 'warning',
      title: 'Peringatan: Reset Formulir?',
      description: 'Apakah Anda yakin ingin mengembalikan seluruh isian formulir ke nilai awal database?',
      confirmLabel: 'Ya, Reset Formulir',
      cancelLabel: 'Batal',
      confirmButtonClass: 'bg-gray-700 hover:bg-gray-800 text-white',
      onConfirm: () => {
        if (mhs) {
          setFormData({
            nim: mhs.nim || '',
            nama_lengkap: mhs.nama_lengkap || '',
            program_studi: mhs.program_studi || '',
            angkatan: mhs.angkatan ? Number(mhs.angkatan) : new Date().getFullYear(),
            status_akademik: mhs.status_akademik || 'Aktif',
            dosen_wali_nidn: mhs.dosen_wali_nidn || '',
            user_email: mhs.user_email || '',
          });
        }
        closeModal();
      },
    });
  };

  // ============================================================
  // Eksekusi API Simpan Perubahan
  // ============================================================
  const executeSave = async () => {
    if (!mhs) return;
    setSaving(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const payload = {
        original_nim: mhs.nim,
        nim: formData.nim.trim(),
        nama_lengkap: formData.nama_lengkap.trim(),
        program_studi: formData.program_studi.trim(),
        angkatan: Number(formData.angkatan),
        status_akademik: formData.status_akademik,
        dosen_wali_nidn: formData.dosen_wali_nidn.trim() || null,
        user_email: formData.user_email.trim() || null,
      };

      const res = await fetch('/api.php?endpoint=mahasiswa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Gagal menyimpan perubahan ke basis data.');
      }

      const updatedStudent: Mahasiswa = resData.data;
      setMhs(updatedStudent);
      setFormData({
        nim: updatedStudent.nim,
        nama_lengkap: updatedStudent.nama_lengkap,
        program_studi: updatedStudent.program_studi,
        angkatan: Number(updatedStudent.angkatan),
        status_akademik: updatedStudent.status_akademik,
        dosen_wali_nidn: updatedStudent.dosen_wali_nidn || '',
        user_email: updatedStudent.user_email || '',
      });
      setIsEditing(false);
      setSuccessNotice('Semua perubahan data mahasiswa berhasil disimpan ke sistem!');

      // Jika NIM berubah, URL hash profil ikut berganti
      if (updatedStudent.hash_profil && updatedStudent.hash_profil !== IDMahasiswa) {
        navigate(`/DashBoardMahasiswa/${updatedStudent.hash_profil}`, { replace: true });
      }

      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kegagalan saat menyimpan.');
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // AKSI 4: Simpan Seluruh Perubahan (dengan Peringatan Berjenjang)
  // ============================================================
  const triggerSaveAll = (e?: FormEvent) => {
    if (e) e.preventDefault();

    // Validasi Form
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
  };

  // ============================================================
  // AKSI 5: Simpan Khusus Bagian Data Sensitif (di Zona Berbahaya)
  // ============================================================
  const triggerSaveSensitiveOnly = () => {
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
  };

  // ============================================================
  // AKSI 6: Hapus Data Mahasiswa (Aksi Ekstrem Berbahaya)
  // ============================================================
  const triggerDeleteStudent = () => {
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
          const res = await fetch(`/api.php?endpoint=mahasiswa&nim=${encodeURIComponent(mhs.nim)}`, {
            method: 'DELETE',
          });
          const resData = await res.json();
          if (!res.ok) {
            throw new Error(resData.error || 'Gagal menghapus data mahasiswa.');
          }
          closeModal();
          navigate('/', { replace: true });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Gagal menghapus mahasiswa.');
          closeModal();
        } finally {
          setSaving(false);
        }
      },
    });
  };

  // ============================================================
  // RENDER: Jika parameter IDMahasiswa belum dipilih
  // ============================================================
  if (!IDMahasiswa) {
    return (
      <div className='p-6 md:p-10 w-full max-w-5xl mx-auto'>
        <div className='bg-white p-8 rounded-3xl shadow-sm border border-gray-200 text-center max-w-xl mx-auto mt-6'>
          <div className='w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm'>
            <svg className='w-8 h-8' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
            </svg>
          </div>
          <h2 className='text-2xl font-bold font-merrie text-gray-800 mb-2'>Pusat Dashboard Mahasiswa</h2>
          <p className='text-gray-500 text-sm mb-6 leading-relaxed'>
            Pilih salah satu mahasiswa dari daftar di bawah ini atau melalui halaman Home untuk melihat profil dan mengelola seluruh detail akademik.
          </p>

          {/* Quick Select Dropdown */}
          {allStudents.length > 0 && (
            <div className='mb-6 text-left bg-gray-50 p-4 rounded-2xl border border-gray-200'>
              <label className='block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2'>
                Pilih Mahasiswa Langsung:
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    navigate(`/DashBoardMahasiswa/${e.target.value}`);
                  }
                }}
                defaultValue=''
                className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-blue-600 focus:outline-none'
              >
                <option value='' disabled>
                  -- Pilih Mahasiswa ({allStudents.length} terdaftar) --
                </option>
                {allStudents.map((item) => (
                  <option key={item.nim} value={item.hash_profil}>
                    {item.nim} - {item.nama_lengkap} ({item.program_studi})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className='flex justify-center gap-3'>
            <Link
              to='/'
              className='inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm shadow-sm'
            >
              ← Buka Halaman Utama (Home)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Loading State
  // ============================================================
  if (loading) {
    return (
      <div className='p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-gray-500'>
        <div className='w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4' />
        <p className='text-sm font-medium'>Memuat data detail mahasiswa...</p>
      </div>
    );
  }

  // ============================================================
  // RENDER: Error State
  // ============================================================
  if (error && !mhs) {
    return (
      <div className='p-6 md:p-10 w-full max-w-4xl mx-auto'>
        <div className='bg-red-50 border-2 border-red-200 text-red-800 p-6 rounded-2xl mb-6 shadow-sm'>
          <div className='flex items-center gap-3 mb-2'>
            <span className='text-2xl'>⚠️</span>
            <h3 className='font-bold text-lg'>Terjadi Kesalahan</h3>
          </div>
          <p className='text-sm text-red-700'>{error}</p>
        </div>
        <Link
          to='/'
          className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition'
        >
          ← Kembali ke Halaman Home
        </Link>
      </div>
    );
  }

  if (!mhs) return null;

  return (
    <div className='p-6 md:p-10 w-full max-w-6xl mx-auto space-y-8'>
      {/* ======================================================== */}
      {/* BANNER NOTIFIKASI SUKSES / ERROR (FEEDBACK)               */}
      {/* ======================================================== */}
      {successNotice && (
        <div className='flex items-center justify-between p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl shadow-sm animate-fade-in'>
          <div className='flex items-center gap-3'>
            <svg className='w-6 h-6 text-emerald-600 shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <span className='text-sm font-medium'>{successNotice}</span>
          </div>
          <button
            type='button'
            onClick={() => setSuccessNotice(null)}
            className='text-emerald-700 hover:text-emerald-900 font-bold p-1'
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className='flex items-center justify-between p-4 bg-red-50 border border-red-300 text-red-800 rounded-2xl shadow-sm'>
          <div className='flex items-center gap-3'>
            <svg className='w-6 h-6 text-red-600 shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
            </svg>
            <span className='text-sm font-medium'>{error}</span>
          </div>
          <button
            type='button'
            onClick={() => setError(null)}
            className='text-red-700 hover:text-red-900 font-bold p-1'
          >
            ✕
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* HEADER UTAMA & KONTROL ADMINISTRATOR                     */}
      {/* ======================================================== */}
      <div className='bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100'>
          <div className='flex items-start md:items-center gap-4'>
            <div className='w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0 font-merrie'>
              {mhs.nama_lengkap.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='text-2xl md:text-3xl font-bold font-merrie text-gray-900'>
                  {isEditing ? formData.nama_lengkap || 'Edit Nama Mahasiswa' : mhs.nama_lengkap}
                </h1>
                <span
                  className={`px-3 py-0.5 text-xs font-semibold rounded-full border ${
                    mhs.status_akademik === 'Aktif'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : mhs.status_akademik === 'DO'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {mhs.status_akademik}
                </span>
              </div>
              <p className='text-gray-500 font-mono text-sm mt-1 flex items-center gap-2'>
                <span>NIM: <strong className='text-gray-700'>{mhs.nim}</strong></span>
                <span>•</span>
                <span>{mhs.program_studi}</span>
                <span>•</span>
                <span>Angkatan {mhs.angkatan}</span>
              </p>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <Link
              to='/'
              className='px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-sm font-medium transition flex items-center gap-1.5'
            >
              ← Kembali ke Home
            </Link>

            {/* Tombol Pemicu Mode Edit */}
            {!isEditing ? (
              <button
                type='button'
                onClick={triggerEnterEditMode}
                className='px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer'
              >
                <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                </svg>
                Ubah Data Mahasiswa
              </button>
            ) : (
              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  onClick={triggerCancelEdit}
                  className='px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition cursor-pointer'
                >
                  ✕ Batal
                </button>
                <button
                  type='button'
                  onClick={triggerResetForm}
                  disabled={detectedChanges.length === 0}
                  className='px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-40 rounded-xl text-sm font-medium transition cursor-pointer'
                  title='Reset isian ke data awal'
                >
                  ↺ Reset
                </button>
                <button
                  type='button'
                  onClick={triggerSaveAll}
                  disabled={saving}
                  className='px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer'
                >
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                  </svg>
                  {saving ? 'Menyimpan...' : 'Simpan Semua'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bar Akses Administrator & Informasi Peringatan */}
        <div className='mt-5 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80'>
          <div className='flex items-center gap-2.5'>
            <span className='inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold'>
              🛡️
            </span>
            <div>
              <p className='font-semibold text-gray-800 flex items-center gap-2'>
                Otoritas Akses: {hasAdminAccess ? (
                  <span className='text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full'>
                    Administrator Terverifikasi (Akses Penuh)
                  </span>
                ) : (
                  <span className='text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full'>
                    Hanya Lihat (Tamu / Mahasiswa)
                  </span>
                )}
              </p>
              <p className='text-gray-500 mt-0.5'>
                {hasAdminAccess
                  ? 'Sebagai Admin, Anda dapat memperbarui seluruh detail data mahasiswa termasuk bagian sensitif.'
                  : 'Aktifkan mode admin untuk dapat mengubah detail informasi mahasiswa.'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            {/* Toggle Simulasi Admin */}
            <label className='flex items-center gap-2 cursor-pointer select-none bg-white px-3 py-1.5 rounded-xl border border-gray-300 hover:border-gray-400 transition'>
              <input
                type='checkbox'
                checked={hasAdminAccess}
                onChange={(e) => {
                  const active = e.target.checked;
                  setAdminSimulated(active);
                  if (!active && isEditing) {
                    setIsEditing(false);
                  }
                }}
                className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
              />
              <span className='text-xs font-semibold text-gray-700'>
                {hasAdminAccess ? 'Mode Admin: Aktif' : 'Simulasikan Akses Admin'}
              </span>
            </label>
          </div>
        </div>

        {/* Banner Saat Berada di Mode Edit */}
        {isEditing && (
          <div className='mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl text-amber-900 text-xs flex items-start gap-3'>
            <span className='text-base leading-none'>✏️</span>
            <div>
              <p className='font-bold text-sm text-amber-950'>Mode Pengeditan Aktif</p>
              <p className='mt-0.5 text-amber-800'>
                Anda sedang mengubah data mahasiswa. Terdapat <strong>{detectedChanges.length} perubahan</strong> yang terdeteksi. Setiap tombol simpan atau batal akan menampilkan modal peringatan terlebih dahulu.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* RINGKASAN KARTU AKADEMIK (QUICK STATS)                   */}
      {/* ======================================================== */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm'>
          <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>Program Studi</p>
          <p className='text-base font-bold text-gray-900 mt-1 truncate'>
            {isEditing ? formData.program_studi : mhs.program_studi}
          </p>
          <span className='text-[11px] text-gray-500 mt-1 block'>Fakultas Teknologi Informasi</span>
        </div>

        <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm'>
          <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>Tahun Angkatan</p>
          <p className='text-base font-bold text-gray-900 mt-1'>
            {isEditing ? formData.angkatan : mhs.angkatan}
          </p>
          <span className='text-[11px] text-gray-500 mt-1 block'>Kurikulum OBE Terpadu</span>
        </div>

        <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm'>
          <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>Status Keaktifan</p>
          <p className='mt-1'>
            <span
              className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-md ${
                (isEditing ? formData.status_akademik : mhs.status_akademik) === 'Aktif'
                  ? 'bg-emerald-100 text-emerald-800'
                  : (isEditing ? formData.status_akademik : mhs.status_akademik) === 'DO'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isEditing ? formData.status_akademik : mhs.status_akademik}
            </span>
          </p>
          <span className='text-[11px] text-gray-500 mt-1 block'>Semester Genap 2024/2025</span>
        </div>

        <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm'>
          <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>Dosen Wali</p>
          <p className='text-base font-bold text-gray-900 mt-1 truncate'>
            {isEditing ? formData.dosen_wali_nidn || 'Belum Ditentukan' : mhs.dosen_wali_nidn || 'Belum Ditentukan'}
          </p>
          <span className='text-[11px] text-gray-500 mt-1 block'>NIDN Pembimbing Akademik</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: DATA IDENTITAS & INFORMASI AKADEMIK UMUM       */}
      {/* ======================================================== */}
      <section className='bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden'>
        <div className='p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-2'>
          <div>
            <div className='flex items-center gap-2'>
              <span className='px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-blue-100 text-blue-700'>
                Section 1
              </span>
              <h2 className='text-lg font-bold text-gray-900 font-merrie'>
                Data Identitas & Informasi Akademik Umum
              </h2>
            </div>
            <p className='text-xs text-gray-500 mt-1'>
              Informasi data mahasiswa reguler yang dapat diperbarui secara rutin (Nama, Program Studi, Angkatan, dan Pembimbing).
            </p>
          </div>
          <span className='text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full w-fit'>
            ● Tingkat Risiko: Standar
          </span>
        </div>

        <div className='p-6 md:p-8 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Field: Nama Lengkap */}
            <div>
              <label className='block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2'>
                Nama Lengkap Mahasiswa <span className='text-red-500'>*</span>
              </label>
              {isEditing ? (
                <div>
                  <input
                    type='text'
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    placeholder='Masukkan nama lengkap mahasiswa'
                    className='w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition'
                  />
                  <p className='text-[11px] text-gray-400 mt-1'>Sesuai dengan ijazah terakhir / KTP resmi.</p>
                </div>
              ) : (
                <div className='p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900'>
                  {mhs.nama_lengkap}
                </div>
              )}
            </div>

            {/* Field: Program Studi */}
            <div>
              <label className='block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2'>
                Program Studi <span className='text-red-500'>*</span>
              </label>
              {isEditing ? (
                <div>
                  <select
                    value={formData.program_studi}
                    onChange={(e) => setFormData({ ...formData, program_studi: e.target.value })}
                    className='w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition'
                  >
                    {PRODI_OPTIONS.map((prodi) => (
                      <option key={prodi} value={prodi}>
                        {prodi}
                      </option>
                    ))}
                    {!PRODI_OPTIONS.includes(formData.program_studi) && formData.program_studi && (
                      <option value={formData.program_studi}>{formData.program_studi}</option>
                    )}
                  </select>
                  <p className='text-[11px] text-gray-400 mt-1'>Program studi terdaftar di Fakultas.</p>
                </div>
              ) : (
                <div className='p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900'>
                  {mhs.program_studi}
                </div>
              )}
            </div>

            {/* Field: Tahun Angkatan */}
            <div>
              <label className='block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2'>
                Tahun Angkatan Masuk <span className='text-red-500'>*</span>
              </label>
              {isEditing ? (
                <div>
                  <input
                    type='number'
                    min='2000'
                    max='2035'
                    value={formData.angkatan}
                    onChange={(e) => setFormData({ ...formData, angkatan: Number(e.target.value) })}
                    className='w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition'
                  />
                  <p className='text-[11px] text-gray-400 mt-1'>Tahun registrasi awal mahasiswa di UNUS.</p>
                </div>
              ) : (
                <div className='p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900'>
                  {mhs.angkatan}
                </div>
              )}
            </div>

            {/* Field: Dosen Wali (NIDN) */}
            <div>
              <label className='block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2'>
                NIDN Dosen Wali / Pembimbing
              </label>
              {isEditing ? (
                <div>
                  <input
                    type='text'
                    value={formData.dosen_wali_nidn}
                    onChange={(e) => setFormData({ ...formData, dosen_wali_nidn: e.target.value })}
                    placeholder='Contoh: 0412038901 (opsional)'
                    className='w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition'
                  />
                  <p className='text-[11px] text-gray-400 mt-1'>Kosongkan jika mahasiswa belum memiliki dosen wali.</p>
                </div>
              ) : (
                <div className='p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900'>
                  {mhs.dosen_wali_nidn || <span className='text-gray-400 italic'>Belum ditentukan</span>}
                </div>
              )}
            </div>

            {/* Field: Email Akun Mahasiswa */}
            <div className='md:col-span-2'>
              <label className='block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2'>
                Email Akun SIAKAD Terhubung
              </label>
              {isEditing ? (
                <div>
                  <input
                    type='email'
                    value={formData.user_email}
                    onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                    placeholder='nama@email.com'
                    className='w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition'
                  />
                  <p className='text-[11px] text-gray-400 mt-1'>
                    Email yang digunakan mahasiswa untuk login ke portal SIAKAD.
                  </p>
                </div>
              ) : (
                <div className='p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 flex items-center justify-between'>
                  <span>{mhs.user_email || <span className='text-gray-400 italic'>Tidak ada email terhubung</span>}</span>
                  <span className='text-[11px] text-gray-400'>ID User: {mhs.id_user || '-'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2 (PALING BAWAH): ZONA DATA SENSITIF & BERBAHAYA */}
      {/* ======================================================== */}
      <section className='bg-gradient-to-b from-red-50/60 to-rose-50/40 rounded-3xl border-2 border-red-300 shadow-md overflow-hidden'>
        {/* Header Zona Berbahaya */}
        <div className='p-6 bg-red-500/10 border-b border-red-200 flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div className='flex items-start md:items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm'>
              ⚠️
            </div>
            <div>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-red-600 text-white'>
                  ZONA BERBAHAYA / DANGER ZONE
                </span>
                <span className='px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-red-100 text-red-800 border border-red-300'>
                  Data Sensitif & Kritis
                </span>
              </div>
              <h2 className='text-xl font-bold text-red-900 font-merrie mt-1'>
                Section 2: Pengaturan Data Sensitif & Integritas Sistem
              </h2>
            </div>
          </div>

          <div className='text-left md:text-right'>
            <span className='inline-block px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full text-xs font-semibold'>
              Tingkat Risiko: Kritis (High Impact)
            </span>
          </div>
        </div>

        {/* Box Peringatan Resmi Bahaya */}
        <div className='m-6 md:m-8 p-5 bg-white/90 border-2 border-dashed border-red-300 rounded-2xl'>
          <div className='flex items-start gap-3.5'>
            <span className='text-2xl shrink-0'>🚨</span>
            <div className='text-xs text-red-900 space-y-1.5 leading-relaxed'>
              <p className='font-bold text-sm text-red-950 uppercase tracking-wide'>
                PERINGATAN: Bagian ini Sangat Berbahaya Jika Diedit!
              </p>
              <p>
                Bagian ini mengatur data kunci pangkalan data sistem. Mengubah data pada bagian ini memiliki konsekuensi langsung:
              </p>
              <ul className='list-disc pl-5 space-y-1 text-red-800'>
                <li>
                  <strong>Nomor Induk Mahasiswa (NIM):</strong> Berfungsi sebagai <em>Primary Key</em> sistem. Mengubah NIM akan secara otomatis merestrukturisasi foreign key nilai akademik (KRS), riwayat presensi digital, dan mengganti tautan URL enkripsi profil mahasiswa.
                </li>
                <li>
                  <strong>Status Akademik:</strong> Mengubah status menjadi <em>Cuti</em> atau <em>DO (Drop Out)</em> akan langsung memblokir akses pengisian KRS dan menonaktifkan hak keikutsertaan perkuliahan mahasiswa di seluruh sistem kampus.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Input Data Sensitif */}
        <div className='px-6 md:px-8 pb-8 space-y-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Field Sensitif 1: NIM (Primary Key) */}
            <div className='p-5 bg-white rounded-2xl border border-red-200 shadow-sm'>
              <div className='flex items-center justify-between mb-2'>
                <label className='block text-xs font-bold uppercase tracking-wider text-red-900'>
                  Nomor Induk Mahasiswa (NIM) <span className='text-red-600'>*</span>
                </label>
                <span className='text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded'>
                  PRIMARY KEY
                </span>
              </div>

              {isEditing ? (
                <div>
                  <input
                    type='text'
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    className='w-full px-4 py-2.5 text-sm font-mono font-bold text-gray-900 bg-red-50/40 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:bg-white focus:outline-none transition'
                    placeholder='Contoh: 2301001'
                  />
                  <p className='text-[11px] text-red-600 mt-2 font-medium flex items-center gap-1.5'>
                    <span>⚠️</span> Perubahan NIM akan mengubah link dashboard mahasiswa ini.
                  </p>
                </div>
              ) : (
                <div>
                  <div className='p-3 bg-red-50/50 rounded-xl border border-red-200 text-sm font-mono font-bold text-red-950 flex items-center justify-between'>
                    <span>{mhs.nim}</span>
                    <span className='text-xs font-normal text-red-600'>Terkunci (Read Only)</span>
                  </div>
                  <p className='text-[11px] text-gray-500 mt-1.5'>
                    NIM saat ini digunakan pada seluruh relasi KRS dan absensi.
                  </p>
                </div>
              )}
            </div>

            {/* Field Sensitif 2: Status Akademik */}
            <div className='p-5 bg-white rounded-2xl border border-red-200 shadow-sm'>
              <div className='flex items-center justify-between mb-2'>
                <label className='block text-xs font-bold uppercase tracking-wider text-red-900'>
                  Status Akademik Mahasiswa <span className='text-red-600'>*</span>
                </label>
                <span className='text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded'>
                  HAK AKSES
                </span>
              </div>

              {isEditing ? (
                <div>
                  <select
                    value={formData.status_akademik}
                    onChange={(e) => setFormData({ ...formData, status_akademik: e.target.value })}
                    className='w-full px-4 py-2.5 text-sm font-bold text-gray-900 bg-red-50/40 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:bg-white focus:outline-none transition'
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} - {opt.desc}
                      </option>
                    ))}
                  </select>
                  <p className='text-[11px] text-red-600 mt-2 font-medium flex items-center gap-1.5'>
                    <span>⚠️</span> Memilih status 'DO' atau 'Cuti' akan mencabut hak aktif perkuliahan.
                  </p>
                </div>
              ) : (
                <div>
                  <div className='p-3 bg-red-50/50 rounded-xl border border-red-200 flex items-center justify-between'>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-bold rounded-lg border ${
                        STATUS_OPTIONS.find((s) => s.value === mhs.status_akademik)?.badgeClass || 'bg-gray-100'
                      }`}
                    >
                      {mhs.status_akademik}
                    </span>
                    <span className='text-xs font-normal text-red-600'>Terkunci (Read Only)</span>
                  </div>
                  <p className='text-[11px] text-gray-500 mt-1.5'>
                    {STATUS_OPTIONS.find((s) => s.value === mhs.status_akademik)?.desc}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Opsi Aksi Cepat Pada Zona Berbahaya */}
          <div className='pt-6 border-t border-red-200/80 flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div>
              <p className='text-xs font-bold text-red-950 uppercase tracking-wide'>
                Perintah Khusus Zona Berbahaya
              </p>
              <p className='text-xs text-red-700 mt-0.5'>
                Setiap perintah di bawah ini akan memunculkan dialog konfirmasi berlapis demi keamanan data kampus.
              </p>
            </div>

            <div className='flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end'>
              {/* Tombol Simpan Khusus Data Sensitif jika dalam mode edit */}
              {isEditing && (
                <button
                  type='button'
                  onClick={triggerSaveSensitiveOnly}
                  disabled={saving || !hasSensitiveChanges}
                  className='px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer'
                >
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4' />
                  </svg>
                  Simpan Khusus Data Sensitif
                </button>
              )}

              {/* Tombol Hapus Mahasiswa */}
              <button
                type='button'
                onClick={triggerDeleteStudent}
                disabled={saving}
                className='px-4 py-2.5 bg-white hover:bg-red-50 text-red-700 border border-red-300 hover:border-red-500 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer'
              >
                <svg className='w-4 h-4 text-red-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                </svg>
                Hapus Mahasiswa dari Database
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* MODAL PERINGATAN / KONFIRMASI INTERAKTIF (SEMUA PERINTAH) */}
      {/* ======================================================== */}
      {modalConfig && modalConfig.isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in'>
          <div
            className='bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 space-y-5 animate-scale-up'
            role='dialog'
            aria-modal='true'
          >
            {/* Header Modal */}
            <div className='flex items-start gap-4'>
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                  modalConfig.type === 'danger'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : modalConfig.type === 'warning'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}
              >
                {modalConfig.type === 'danger' ? '🚨' : modalConfig.type === 'warning' ? '⚠️' : 'ℹ️'}
              </div>
              <div className='flex-1'>
                {modalConfig.dangerBadgeText && (
                  <span className='inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-red-600 text-white mb-1'>
                    {modalConfig.dangerBadgeText}
                  </span>
                )}
                <h3 className='text-lg font-bold font-merrie text-gray-900'>
                  {modalConfig.title}
                </h3>
                <p className='text-xs text-gray-600 mt-1.5 leading-relaxed'>
                  {modalConfig.description}
                </p>
              </div>
            </div>

            {/* Rangkuman Perubahan Data (Jika Ada) */}
            {modalConfig.changesSummary && modalConfig.changesSummary.length > 0 && (
              <div className='bg-gray-50 p-4 rounded-2xl border border-gray-200 max-h-48 overflow-y-auto space-y-2.5'>
                <p className='text-[11px] font-bold text-gray-500 uppercase tracking-wider'>
                  Rincian Perubahan Data:
                </p>
                {modalConfig.changesSummary.map((item, index) => (
                  <div
                    key={index}
                    className={`p-2.5 rounded-xl border text-xs ${
                      item.isSensitive
                        ? 'bg-red-50/80 border-red-200 text-red-900'
                        : 'bg-white border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className='flex items-center justify-between font-semibold'>
                      <span>{item.label}</span>
                      {item.isSensitive && (
                        <span className='text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded'>
                          Sensitif
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-2 mt-1 text-[11px] font-mono'>
                      <span className='line-through text-gray-400 truncate max-w-[150px]'>{item.oldVal}</span>
                      <span className='text-gray-400'>→</span>
                      <span className='font-bold text-blue-600 truncate max-w-[180px]'>{item.newVal}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Input Verifikasi Khusus (Contoh: Ketik HAPUS) */}
            {modalConfig.requireInputMatch && (
              <div className='space-y-1.5 bg-red-50 p-3.5 rounded-2xl border border-red-200'>
                <label className='block text-xs font-semibold text-red-900'>
                  Ketik kata <span className='font-mono font-bold text-red-700 bg-white px-1 rounded'>{modalConfig.requireInputMatch}</span> untuk melanjutkan:
                </label>
                <input
                  type='text'
                  value={typedConfirmation}
                  onChange={(e) => setTypedConfirmation(e.target.value)}
                  placeholder={`Ketik "${modalConfig.requireInputMatch}"`}
                  className='w-full px-3 py-2 bg-white border border-red-300 rounded-xl text-xs font-mono font-bold text-red-900 focus:outline-none focus:ring-2 focus:ring-red-600'
                />
              </div>
            )}

            {/* Tombol Aksi Modal */}
            <div className='flex items-center justify-end gap-3 pt-3 border-t border-gray-100'>
              <button
                type='button'
                onClick={closeModal}
                className='px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition cursor-pointer'
              >
                {modalConfig.cancelLabel || 'Batal'}
              </button>
              <button
                type='button'
                disabled={
                  Boolean(modalConfig.requireInputMatch) &&
                  typedConfirmation.trim() !== modalConfig.requireInputMatch
                }
                onClick={() => {
                  modalConfig.onConfirm();
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition disabled:opacity-40 cursor-pointer ${
                  modalConfig.confirmButtonClass || 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {modalConfig.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
