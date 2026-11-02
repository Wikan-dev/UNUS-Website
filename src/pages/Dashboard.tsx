import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Mahasiswa } from '../helper/types.tsx';

export default function DashboardMahasiswa() {
  const { IDMahasiswa } = useParams();

  const [mhs, setMhs] = useState<Mahasiswa | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(IDMahasiswa));

  useEffect(() => {
    if (!IDMahasiswa) {
      return;
    }

    const ambil = async () => {
      try {
        const res = await fetch(`/api.php?endpoint=mahasiswa&h=${IDMahasiswa}`);
        if (res.status === 404) {
          setError('Profil mahasiswa tidak ditemukan');
          return;
        }
        if (!res.ok) throw new Error('Gagal memuat data mahasiswa');
        setMhs(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
    ambil();
  }, [IDMahasiswa]);

  if (!IDMahasiswa) {
    return (
      <div className='p-8 w-full max-w-4xl mx-auto'>
        <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-lg mx-auto mt-10'>
          <div className='w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-7 h-7' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
            </svg>
          </div>
          <h2 className='text-2xl font-bold font-merrie text-gray-800 mb-2'>Dashboard Mahasiswa</h2>
          <p className='text-gray-500 text-sm mb-6'>
            Pilih salah satu mahasiswa dari daftar di halaman Home untuk melihat informasi lengkap dan dashboard akademik.
          </p>
          <Link
            to='/'
            className='inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm shadow-sm'
          >
            ← Buka Halaman Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className='p-8 text-gray-500'>Memuat data mahasiswa...</div>;

  if (error) {
    return (
      <div className='p-8 w-full max-w-4xl mx-auto'>
        <div className='bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl mb-4'>
          <p className='font-semibold'>Error:</p>
          <p className='text-sm mt-1'>{error}</p>
        </div>
        <Link to='/' className='text-blue-600 hover:underline text-sm font-medium'>
          ← Kembali ke Home
        </Link>
      </div>
    );
  }

  if (!mhs) return null;

  return (
    <div className='p-8 w-full max-w-4xl mx-auto'>
      <div className='mb-6 flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold font-merrie text-gray-800'>{mhs.nama_lengkap}</h1>
          <p className='text-gray-500 mt-1 font-mono text-sm'>NIM: {mhs.nim}</p>
        </div>
        <Link
          to='/'
          className='px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition'
        >
          ← Kembali ke Home
        </Link>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <div className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm'>
          <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Program Studi</p>
          <p className='text-lg font-bold text-gray-800 mt-1'>{mhs.program_studi}</p>
        </div>
        <div className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm'>
          <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Angkatan</p>
          <p className='text-lg font-bold text-gray-800 mt-1'>{mhs.angkatan}</p>
        </div>
        <div className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm'>
          <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Status Akademik</p>
          <p className='mt-1'>
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                mhs.status_akademik === 'Aktif'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {mhs.status_akademik}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
