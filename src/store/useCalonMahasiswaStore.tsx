import { create } from 'zustand';

interface CalonMahasiswaState {
  noPendaftaran: string;
  namaPendaftar: string;
  asalSekolah: string;
  statusDokumen: string;
  ijazahFile: File | null;
  kkFile: File | null;

  loading: boolean;
  error: string | null;
  sukses: string | null;

  setNoPendaftaran: (val: string) => void;
  setNamaPendaftar: (val: string) => void;
  setAsalSekolah: (val: string) => void;
  setStatusDokumen: (val: string) => void;
  setIjazahFile: (file: File | null) => void;
  setKKFile: (file: File | null) => void;

  setError: (pesan: string | null) => void;
  setSukses: (pesan: string | null) => void;
  resetForm: () => void;

  submitPendaftaran: () => Promise<void>;
}

export const useCalonMahasiswaStore = create<CalonMahasiswaState>((set, get) => ({
  noPendaftaran: '',
  namaPendaftar: '',
  asalSekolah: '',
  statusDokumen: 'Menunggu',
  ijazahFile: null,
  kkFile: null,

  loading: false,
  error: null,
  sukses: null,

  setNoPendaftaran: (val) => set({ noPendaftaran: val }),
  setNamaPendaftar: (val) => set({ namaPendaftar: val }),
  setAsalSekolah: (val) => set({ asalSekolah: val }),
  setStatusDokumen: (val) => set({ statusDokumen: val }),
  setIjazahFile: (file) => set({ ijazahFile: file }),
  setKKFile: (file) => set({ kkFile: file }),

  setError: (pesan) => set({ error: pesan }),
  setSukses: (pesan) => set({ sukses: pesan }),

  resetForm: () =>
    set({
      noPendaftaran: '',
      namaPendaftar: '',
      asalSekolah: '',
      statusDokumen: 'Menunggu',
      ijazahFile: null,
      kkFile: null,
      loading: false,
      error: null,
      sukses: null,
    }),

  submitPendaftaran: async () => {
    const { noPendaftaran, namaPendaftar, asalSekolah, statusDokumen, ijazahFile, kkFile } = get();

    set({ error: null, sukses: null });

    if (!noPendaftaran.trim() || !namaPendaftar.trim() || !asalSekolah.trim()) {
      set({ error: 'harap lengkapi semua data di teks.' });
      return;
    }

    if (!ijazahFile || !kkFile) {
      set({ error: 'berkas ijazah dan kk belum di unggah.' });
      return;
    }

    set({ loading: true });

    try {
      const formData = new FormData();
      formData.append('no_pendaftaran', noPendaftaran.trim());
      formData.append('nama_pendaftar', namaPendaftar.trim());
      formData.append('asal_sekolah', asalSekolah.trim());
      formData.append('status_dokumen', statusDokumen.trim() || 'Menunggu');
      formData.append('ijazah', ijazahFile);
      formData.append('kk', kkFile);

      const response = await fetch('/api.php?endpoint=calon_mahasiswa', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
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
