import { useState, useEffect } from 'react'
import type Mahasiswa from '../helper/types.tsx';

export default function LandingPage() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ambilSemua = async () => {
      try {
        const response = await fetch('/api.php?endpoint=mahasiswa');
        if (!response.ok) throw new Error('Gagal mengambil data dari server');
        const data: Mahasiswa[] = await response.json();
        setMahasiswa(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
    ambilSemua();
  }, []);
  
  const ambilDetail = async (nim: string) => {
    const response = await fetch(`/api.php?endpoint=mahasiswa&id=${nim}`);
    if (!response.ok) throw new Error('Data mahasiswa tidak di temukan');
    setSelected(await response.json());
  };

  return (
    <div>
      {loading && <p>Memuat database</p>}
      {error && <p className='text-red-500'>Error: {error}</p>}
      <table className='border-2 table-auto'>
        <tr className='border-2 [&_th]:border [&_th]:px-2'>
          <th>no</th>
          <th>nim</th>
          <th>Nama Lengkap</th>
          <th>Program Studi</th>
          <th>Angkatan</th>
          <th>Status Akademik</th>
        </tr>
        {mahasiswa.map((m, index) => (
          <tr key={m.nim} className='[&_td]:border [&_td]:p-2 [&_td]:text-center'>
            <td>{index + 1}</td>
            <td>{m.nim}</td>
            <td>{m.nama_lengkap}</td>
            <td>{m.program_studi}</td>
            <td>{m.angkatan}</td>
            <td><h1 className={m.status_akademik === 'Aktif' ? 'bg-green-500 text-white rounded-lg' : 'bg-red-500 text-white'}>{m.status_akademik}</h1></td>
          </tr>
        ))}
      </table>
    </div>
  )
}
