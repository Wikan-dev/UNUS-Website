export type Mahasiswa = {
  nim: string;
  nama_lengkap: string;
  program_studi: string;
  angkatan: number;
  status_akademik: string;
};

export type User = {
  id: number;
  username: string;
};

export type AuthResponse = {
  message?: string;
  user?: User;
  error?: string;
};
