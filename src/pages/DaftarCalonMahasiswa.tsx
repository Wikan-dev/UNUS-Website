import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import NoPendaftaran from '../helper/noPendaftaranFunction.tsx';
import { useCalonMahasiswaStore } from '../store/useCalonMahasiswaStore';
import { useSessionPath } from '../helper/useSessionPath';

export default function CalonMahasiswa() {
  const basePath = useSessionPath();
  const {
    noPendaftaran, namaPendaftar, asalSekolah, statusDokumen,
    setNoPendaftaran, setNamaPendaftar, setAsalSekolah, setStatusDokumen,
    setIjazahFile, setKKFile,
    loading, error, sukses, submitPendaftaran,
  } = useCalonMahasiswaStore();

  // Isi otomatis no. pendaftaran saat halaman dibuka
  useEffect(() => {
    setNoPendaftaran(NoPendaftaran());
  }, [setNoPendaftaran]);

  return (
    <div className='p-8 w-full max-w-4xl mx-auto'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold font-merrie text-gray-800'>Pendaftaran Calon Mahasiswa</h1>
          <p className='text-gray-500 mt-1 text-sm'>
            Formulir pendaftaran mahasiswa baru Universitas Nusantara
          </p>
        </div>
        <Link
          to={`${basePath}/Home`}
          className='px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition'
        >
          ← Kembali ke Home
        </Link>
      </div>

      <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-200'>
        <form
          className='flex flex-col gap-4 max-w-lg'
          onSubmit={(e) => {
            e.preventDefault(); // cegah reload halaman bawaan <form>
            submitPendaftaran();
          }}
        >
          <div>
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-1 tracking-wider'>
              No. Pendaftaran
            </label>
            <input
              readOnly
              placeholder='no. pendaftaran'
              value={noPendaftaran}
              onChange={(e) => setNoPendaftaran(e.target.value)}
              className='w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 font-mono text-sm'
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-1 tracking-wider'>
              Nama Pendaftar
            </label>
            <input
              placeholder='Masukkan nama pendaftar'
              type='text'
              value={namaPendaftar}
              onChange={(e) => setNamaPendaftar(e.target.value)}
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600'
              required
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-1 tracking-wider'>
              Asal Sekolah
            </label>
            <input
              placeholder='Masukkan asal sekolah'
              type='text'
              value={asalSekolah}
              onChange={(e) => setAsalSekolah(e.target.value)}
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600'
              required
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-1 tracking-wider'>
              Berkas Ijazah
            </label>
            <input
              type='file'
              accept='image/*,application/pdf'
              onChange={(e) => setIjazahFile(e.target.files?.[0] ?? null)}
              className='w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-1 tracking-wider'>
              Berkas KK (Kartu Keluarga)
            </label>
            <input
              type='file'
              accept='image/*,application/pdf'
              onChange={(e) => setKKFile(e.target.files?.[0] ?? null)}
              className='w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-1 tracking-wider'>
              Status Dokumen
            </label>
            <input
              placeholder='status Dokumen'
              type='text'
              value={statusDokumen}
              onChange={(e) => setStatusDokumen(e.target.value)}
              className='w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 text-sm'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='cursor-pointer w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition'
          >
            {loading ? 'Mengirim data...' : 'Simpan Pendaftaran'}
          </button>
        </form>

        {error && <p className='mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200'>Error: {error}</p>}
        {sukses && <p className='mt-4 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200'>{sukses}</p>}
      </div>
    </div>
  );
}
