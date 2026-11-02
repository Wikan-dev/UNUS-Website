import { useState, useEffect } from 'react';
import type { Mahasiswa } from '../helper/types.tsx';
import { useNavigate, Link } from 'react-router-dom';

export default function LandingPage() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  return (
    <div className='p-8 w-full max-w-7xl mx-auto'>
      <div className='mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold font-merrie text-gray-800'>Home - Data Mahasiswa</h1>
          <p className='text-gray-500 mt-1 text-sm'>
            Portal informasi akademik Universitas Nusantara
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/DaftarCalonMahasiswa')}
            className='cursor-pointer px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl shadow-sm transition'
          >
            + Daftar Calon Mahasiswa
          </button>
        </div>
      </div>

      {loading && <p className='text-gray-500 py-4'>Memuat database...</p>}
      {error && <p className='text-red-500 py-4'>Error: {error}</p>}

      <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600'>
                <th className='p-4 text-center w-14'>No</th>
                <th className='p-4'>NIM</th>
                <th className='p-4'>Nama Lengkap</th>
                <th className='p-4'>Program Studi</th>
                <th className='p-4 text-center'>Angkatan</th>
                <th className='p-4 text-center'>Status</th>
                <th className='p-4 text-center'>Aksi</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 text-sm'>
              {mahasiswa.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className='p-6 text-center text-gray-400'>
                    Tidak ada data mahasiswa.
                  </td>
                </tr>
              )}
              {mahasiswa.map((m, index) => (
                <tr key={m.nim} className='hover:bg-blue-50/40 transition-colors'>
                  <td className='p-4 text-center text-gray-500'>{index + 1}</td>
                  <td className='p-4 font-mono font-medium text-gray-700'>{m.nim}</td>
                  <td className='p-4 font-medium text-gray-900'>{m.nama_lengkap}</td>
                  <td className='p-4 text-gray-600'>{m.program_studi}</td>
                  <td className='p-4 text-center text-gray-600'>{m.angkatan}</td>
                  <td className='p-4 text-center'>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        m.status_akademik === 'Aktif'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {m.status_akademik}
                    </span>
                  </td>
                  <td className='p-4 text-center'>
                    <Link
                      to={`/DashBoardMahasiswa/${m.hash_profil}`}
                      className='inline-block px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition'
                    >
                      Lihat Dashboard
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
