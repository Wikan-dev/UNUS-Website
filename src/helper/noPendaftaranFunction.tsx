import type { Mahasiswa } from './types.tsx';

// Membuat format no. pendaftaran dari tanggal sekarang, contoh: CLNMHS202610
export default function NoPendaftaran() {
  const date = new Date();                     // objek Date berisi waktu sekarang

  const dateYear = date.getFullYear();         // ambil tahun, contoh: 2026
  const dateMonth = String(date.getMonth() + 1) // bulan (0-11) jadi 1-12, lalu jadi string
    .padStart(2, '0');                          // tambah angka 0 di depan bila 1 digit, contoh: 9 -> "09"
  const dateNow = `CLNMHS${dateYear}${dateMonth}`; // gabungkan jadi satu string
  console.log(dateNow);
  return dateNow;
}

// Mengambil data mahasiswa dari API PHP (backend/controllers/mahasiswa.php).
// - tanpa argumen  -> mengembalikan semua mahasiswa (array)
// - dengan nim      -> mengembalikan 1 mahasiswa saja (object)
export async function getMahasiswa(nim?: string): Promise<Mahasiswa | Mahasiswa[]> {
  // ?: = operator ternary; bila ada nim, tambahkan &id=nim ke URL
  const url = `/api.php?endpoint=mahasiswa${nim ? `&id=${encodeURIComponent(nim)}` : ''}`;
  const res = await fetch(url);                // kirim permintaan GET ke server PHP
  if (!res.ok) throw new Error('Data mahasiswa tidak ditemukan'); // gagal? hentikan dengan error
  return res.json();                           // ubah respons JSON menjadi objek/array JS
}
