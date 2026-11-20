export type Mahasiswa = {
  nim: string;
  nama_lengkap: string;
  program_studi: string;
  angkatan: number;
  status_akademik: 'Aktif' | 'Cuti' | 'Lulus' | 'DO' | string;
  hash_profil: string;
  id_user?: number;
  dosen_wali_nidn?: string | null;
  user_email?: string;
};

export type User = {
  id: number;
  email: string;
  role?: string;
  session_hash?: string;
};

export type AuthResponse = {
  message?: string;
  user?: User;
  error?: string;
};

export type CalonMahasiswa = {
  id_pendaftar: string | number;
  id_user: string | number;
  no_pendaftaran: string;
  nama_pendaftar: string;
  asal_sekolah: string;
  program_studi?: string;
  url_ijazah: string;
  url_kk: string;
  status_dokumen: 'Menunggu Validasi' | 'Valid' | 'Ditolak' | string;
  status_penerimaan?: 'Diproses' | 'Lolos' | 'Tidak Lolos' | string;
};

export type DaftarCalonMahasiswaProps = {
  noPendaftaran: string;
  namaPendaftaran: string;
  asalSekolah: string;
  kkImg: string;
  ijazahImg: File | string;
  statusDokumen: File | string;
}

export type PillProps = {
  color: string;
  text: string;
  ballColor?: string;
  textColor?: string;
}
