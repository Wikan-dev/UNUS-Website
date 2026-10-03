import { useState, useEffect } from 'react';

// Bentuk data yang dikirim api.php
interface Mahasiswa {
  nim: string;
  nama_lengkap: string;
  program_studi: string;
  angkatan: number;
  status_akademik: string;
}

export default function App() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [selected, setSelected] = useState<Mahasiswa | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ambil semua data saat halaman pertama dibuka.
  // useEffect kedua argumen [] = hanya jalan sekali.
  useEffect(() => {
    const ambilSemua = async () => {
      try {
        // Alamat relatif, Vite proxy meneruskannya ke PHP port 8080
        const response = await fetch('/api.php?endpoint=mahasiswa');
        if (!response.ok) throw new Error('Gagal mengambil data dari server');

        const data: Mahasiswa[] = await response.json();
        setMahasiswa(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    ambilSemua();
  }, []);

  // Ambil satu baris spesifik saat tombol diklik
  const ambilDetail = async (nim: string) => {
    try {
      const response = await fetch(`/api.php?endpoint=mahasiswa&id=${nim}`);
      if (!response.ok) throw new Error('Data mahasiswa tidak ditemukan');

      const data: Mahasiswa = await response.json();
      setSelected(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  if (loading) return <p className="p-8 text-gray-500">Memuat data database...</p>;
  if (error) return <p className="p-8 text-red-500">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* TABEL: tiap baris data = satu <tr> di dalam <tbody> */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h1 className="text-xl font-bold mb-4 text-gray-800">Daftar Mahasiswa</h1>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-3 py-2 text-left">No</th>
                  <th className="px-3 py-2 text-left">NIM</th>
                  <th className="px-3 py-2 text-left">Nama Mahasiswa</th>
                  <th className="px-3 py-2 text-left">Program Studi</th>
                  <th className="px-3 py-2 text-left">Angkatan</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {/* .map() mengubah tiap objek jadi satu baris.
                    key wajib agar React bisa melacak baris saat data berubah.
                    index + 1 supaya nomor urut mulai dari 1. */}
                {mahasiswa.map((m, index) => (
                  <tr key={m.nim} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2">{m.nim}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{m.nama_lengkap}</td>
                    <td className="px-3 py-2">{m.program_studi}</td>
                    <td className="px-3 py-2">{m.angkatan}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {m.status_akademik}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => ambilDetail(m.nim)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Data kosong: pesan tetap di dalam tbody supaya judul kolom tidak hilang */}
                {mahasiswa.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                      Belum ada data mahasiswa
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAIL: tampil jika ada data terpilih, selain itu tampil ajakan */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Detail Mahasiswa</h2>

          {selected ? (
            <div className="space-y-3">
              <div className="border-b border-gray-100 pb-2">
                <span className="text-xs text-gray-500 uppercase">NIM</span>
                <p className="font-semibold text-gray-800">{selected.nim}</p>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <span className="text-xs text-gray-500 uppercase">Nama Lengkap</span>
                <p className="font-semibold text-gray-800">{selected.nama_lengkap}</p>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <span className="text-xs text-gray-500 uppercase">Program Studi</span>
                <p className="text-gray-600">{selected.program_studi}</p>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <span className="text-xs text-gray-500 uppercase">Angkatan</span>
                <p className="text-gray-600">{selected.angkatan}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase">Status Akademik</span>
                <p className="text-gray-600">{selected.status_akademik}</p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors"
              >
                Tutup Detail
              </button>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Klik tombol &quot;Lihat Detail&quot; pada tabel untuk memuat data
              spesifik satu mahasiswa dari API.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
