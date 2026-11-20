import type { Mahasiswa } from './types.tsx';

// Membuat format no. pendaftaran unik dari tanggal + angka acak, contoh: CLNMHS20261119-4821
export default function NoPendaftaran() {
  const date = new Date();
  const dateYear = date.getFullYear();
  const dateMonth = String(date.getMonth() + 1).padStart(2, '0');
  const dateDay = String(date.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit angka unik acak
  return `CLNMHS${dateYear}${dateMonth}${dateDay}-${randomSuffix}`;
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
