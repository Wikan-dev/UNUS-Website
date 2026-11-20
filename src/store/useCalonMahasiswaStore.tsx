import { create } from 'zustand';
import { getCurrentUser } from '../helper/auth';
import NoPendaftaran from '../helper/noPendaftaranFunction';
import { PRODI_OPTIONS } from '../helper/dashboardConstants';

interface CalonMahasiswaState {
  noPendaftaran: string;
  namaPendaftar: string;
  asalSekolah: string;
  programStudi: string;
  statusDokumen: string;
  ijazahFile: File | null;
  kkFile: File | null;

  loading: boolean;
  error: string | null;
  sukses: string | null;

  setNoPendaftaran: (val: string) => void;
  setNamaPendaftar: (val: string) => void;
  setAsalSekolah: (val: string) => void;
  setProgramStudi: (val: string) => void;
  setStatusDokumen: (val: string) => void;
  setIjazahFile: (file: File | null) => void;
  setKKFile: (file: File | null) => void;

  setError: (pesan: string | null) => void;
  setSukses: (pesan: string | null) => void;
  resetForm: () => void;

  submitPendaftaran: () => Promise<void>;
}

export const useCalonMahasiswaStore = create<CalonMahasiswaState>((set, get) => ({
  noPendaftaran: NoPendaftaran(),
  namaPendaftar: '',
  asalSekolah: '',
  programStudi: PRODI_OPTIONS[0] || 'Teknik Informatika',
  statusDokumen: 'Menunggu Validasi',
  ijazahFile: null,
  kkFile: null,

  loading: false,
  error: null,
  sukses: null,

  setNoPendaftaran: (val) => set({ noPendaftaran: val }),
  setNamaPendaftar: (val) => set({ namaPendaftar: val }),
  setAsalSekolah: (val) => set({ asalSekolah: val }),
  setProgramStudi: (val) => set({ programStudi: val }),
  setStatusDokumen: (val) => set({ statusDokumen: val }),
  setIjazahFile: (file) => set({ ijazahFile: file }),
  setKKFile: (file) => set({ kkFile: file }),

  setError: (pesan) => set({ error: pesan }),
  setSukses: (pesan) => set({ sukses: pesan }),

  resetForm: () =>
    set({
      noPendaftaran: NoPendaftaran(),
      namaPendaftar: '',
      asalSekolah: '',
      programStudi: PRODI_OPTIONS[0] || 'Teknik Informatika',
      statusDokumen: 'Menunggu Validasi',
      ijazahFile: null,
      kkFile: null,
      loading: false,
      error: null,
      sukses: null,
    }),

  submitPendaftaran: async () => {
    const { noPendaftaran, namaPendaftar, asalSekolah, programStudi, statusDokumen, ijazahFile, kkFile } = get();

    set({ error: null, sukses: null });

    const currentNoPendaftaran = noPendaftaran.trim() || NoPendaftaran();

    if (!currentNoPendaftaran || !namaPendaftar.trim() || !asalSekolah.trim()) {
      set({ error: 'harap lengkapi semua data di teks.' });
      return;
    }

    if (!ijazahFile || !kkFile) {
      set({ error: 'berkas ijazah dan kk belum di unggah.' });
      return;
    }

    // Tabel calon_mahasiswa punya Foreign Key id_user -> users.
    // id_user diambil dari hasil login yang disimpan auth.ts di localStorage.
    const user = getCurrentUser();
    if (!user) {
      set({ error: 'silakan login dulu sebelum mengisi pendaftaran.' });
      return;
    }

    set({ loading: true });

    try {
      const formData = new FormData();
      formData.append('id_user', String(user.id));
      formData.append('no_pendaftaran', currentNoPendaftaran);
      formData.append('nama_pendaftar', namaPendaftar.trim());
      formData.append('asal_sekolah', asalSekolah.trim());
      formData.append('program_studi', (programStudi || PRODI_OPTIONS[0] || 'Teknik Informatika').trim());
      formData.append('status_dokumen', statusDokumen.trim() || 'Menunggu Validasi');
      formData.append('ijazah', ijazahFile);
      formData.append('kk', kkFile);

      const response = await fetch('/api.php?endpoint=calon_mahasiswa', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Jika ada konflik nomor pendaftaran, otomatis buat nomor baru
        if (response.status === 409) {
          set({ noPendaftaran: NoPendaftaran() });
        }
        throw new Error(data.error || 'gagal menyimpan pendaftaran.');
      }

      get().resetForm();
      set({ sukses: data.message || 'pendaftaran berhasil dikirim' });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'terjadi kesalahan' });
    } finally {
      set({ loading: false });
    }
  },
}));
