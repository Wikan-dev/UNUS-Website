export type Mahasiswa = {
  nim: string;
  nama_lengkap: string;
  program_studi: string;
  angkatan: number;
  status_akademik: string;
  hash_profil: string;
};

export type User = {
  id: number;
  email: string;
  role?: string;
};

export type AuthResponse = {
  message?: string;
  user?: User;
  error?: string;
};

export type DaftarCalonMahasiswaProps = {
  noPendaftaran: string;
  namaPendaftaran: string;
  asalSekolah: string;
  kkImg: string;
  ijazahImg: File | string;
  statusDokumen: File | string;
}

