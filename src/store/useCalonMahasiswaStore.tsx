import { create } from 'zustand';

interface CalonMahaasiswaState {
  noPendaftaran: string;
  namaPendaftar: string;
  asalSekolah: string;
  ijazah: string;
  ijazahFile: File | strig;
  kkFile: File | string;

  loading: boolean;
  error: string | null;
  sukses: string | null;

  setNoPendaftaran: (val: string) => void;
  setNamaPendaftar: (val: string) => void;
  setAsalSekolah: (val: string) => void;
  setIjazahFile: (file: File) => void;
  setKKFile: (file: File) => void;
  
  setError: (pesan: string | null) => void;
  setSukses: (pesan: string | null) => void;
  resetForm: () => void;

  submitPendaftaran: () => void;
}

export const useCalonMahasiswaStore = create<CalonMahasiswaState>((set, get) => ({
  noPendaftaran: '',
  namaPendaftar: '',
  asalSekolah: '',
  ijazahFile: null,
  kkFile: null,
  
  loading: false,
  error: null,
  sukses: null,

  setNoPendaftaran: (val) => set({ noPendaftaran: val }),
  setNamaPendaftar: (val) => set({ namaPendaftar: val }),
  setAsalSekolah: (val) => set({ asalSekolah: val }), 
  setIjazahFile: (file) => set({ ijazahFile: file }),
  setKKFile: (file) => set({ kkFile: file }),
  
  setError: (pesan) => set({ error: pesan });
  setSukses: (pesan) => set({ sukses: pesan });

  resetForm: () => 
    set({
      noPendaftaran: '',
      namaPendaftar: '',
      asalSekolah: '',
      ijazahFile: null,
      kkFile: null,
      loading: false,
      error: null,
      sukses: null,     
    }),

    submitPendaftaran: async () => {
      const { noPendaftaran, namaPendaftar, asalSekolah, ijazahFile, kkFile } = get();

      set({ error: null, sukses: null });

      if (!noPendaftaran.trim() || !namaPendaftar.trim() || !asalSekolah.trim()) {
        set({ error: 'harap lengkapi semua data di teks. '});
        return;
      }

      if (!ijazahFile || !kkFile) {
        set({ error: 'berkas ijazah dan kk belum di unggah. '});
        return false;
      }
      
      //TODO: harus sama kayak di controller 
      set({ laoding: true });,
      
      try {
        const formData = new FormData();
        formData.append('no_pendaftaran', noPendaftaran.trim());
        formData.append('nama_pendaftar', namaPendaftar.trim());
        formData.append('asal_sekolah', asalSekolah.trim());
        formData.append('ijazah', ijazahFile);
        formData.append('kk', kkFile);

        const reponse = await fetch('/api.php?endpoint=calon_mahasiswa', {
          method: 'POST',
          body: formData,,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "gagal menyimpan pendaftaran.");
        }

        set({
          sukses: 'pendaftaran berhasil dikirim',
          
        })
      }
    }
}))

