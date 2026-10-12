import { useState, useEffect } from 'react'
import type { Mahasiswa } from '../helper/types.tsx';

export default function LandingPage() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Mahasiswa | null>(null);

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
    try {
      const response = await fetch(`/api.php?endpoint=mahasiswa&id=${nim}`);
      if (!response.ok) throw new Error('Data mahasiswa tidak di temukan');
      setSelected(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'terjadi kesalahan');
    }
  };

  return (
    <div className='p-5'>
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
          <tr key={m.nim} onClick={() => ambilDetail(m.nim)} className='cursor-pointer [&_td]:border [&_td]:p-2 [&_td]:text-center hover:bg-gray-100'>
            <td>{index + 1}</td>
            <td>{m.nim}</td>
            <td>{m.nama_lengkap}</td>
            <td>{m.program_studi}</td>
            <td>{m.angkatan}</td>
            <td><h1 className={m.status_akademik === 'Aktif' ? 'bg-green-500 text-white rounded-lg' : 'bg-red-500 text-white'}>{m.status_akademik}</h1></td>
          </tr>
        ))}
      </table>
      {selected && (
        <div className='mt-4 border-2 p-3'>
          <h2 className='text-lg font-bold'>{selected.nama_lengkap}</h2>
          <p>{selected.nim} - {selected.program_studi} - Angkatan {selected.angkatan} - {selected.status_akademik}</p>
        </div>
      )}
    </div>
  )
}
