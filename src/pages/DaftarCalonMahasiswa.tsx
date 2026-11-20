import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NoPendaftaran from '../helper/noPendaftaranFunction.tsx';
import { useCalonMahasiswaStore } from '../store/useCalonMahasiswaStore';
import { useSessionPath } from '../helper/useSessionPath';
import { PRODI_OPTIONS } from '../helper/dashboardConstants';

export default function CalonMahasiswa() {
  const navigate = useNavigate();
  const basePath = useSessionPath();
  const {
    noPendaftaran, namaPendaftar, asalSekolah, programStudi, statusDokumen,
    setNoPendaftaran, setNamaPendaftar, setAsalSekolah, setProgramStudi,
    setIjazahFile, setKKFile,
    loading, error, sukses, submitPendaftaran,
  } = useCalonMahasiswaStore();

  // Isi otomatis no. pendaftaran saat halaman dibuka jika belum ada
  useEffect(() => {
    if (!noPendaftaran) {
      setNoPendaftaran(NoPendaftaran());
    }
  }, [noPendaftaran, setNoPendaftaran]);

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
          to={`${basePath}/Home?tab=calon`}
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
            <div className='flex items-center justify-between mb-1'>
              <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                No. Pendaftaran
              </label>
              <button
                type='button'
                onClick={() => setNoPendaftaran(NoPendaftaran())}
                className='text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer flex items-center gap-1 transition'
                title='Buat nomor pendaftaran baru'
              >
                ↻ Acak Ulang
              </button>
            </div>
            <input
              readOnly
              placeholder='no. pendaftaran'
              value={noPendaftaran}
              onChange={(e) => setNoPendaftaran(e.target.value)}
              className='w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-mono text-sm select-all'
            />
            <p className='text-[11px] text-gray-400 mt-1'>
              Nomor pendaftaran dibuat otomatis & unik untuk setiap pendaftaran.
            </p>
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
              Pilihan Program Studi <span className='text-red-500'>*</span>
            </label>
            <select
              value={programStudi}
              onChange={(e) => setProgramStudi(e.target.value)}
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white cursor-pointer font-medium'
              required
            >
              {PRODI_OPTIONS.map((prodi) => (
                <option key={prodi} value={prodi}>
                  {prodi}
                </option>
              ))}
            </select>
            <p className='text-[11px] text-gray-400 mt-1'>
              Pilih program studi yang Anda minati di Universitas Nusantara.
            </p>
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
              readOnly
              type='text'
              value={statusDokumen || 'Menunggu Validasi'}
              className='w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-sm cursor-not-allowed select-none'
            />
            <p className='text-[11px] text-gray-400 mt-1'>
              Status dokumen otomatis terisi &quot;Menunggu Validasi&quot; hingga diverifikasi oleh panitia.
            </p>
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
        {sukses && (
          <div className='mt-4 p-4 text-sm text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
            <div>
              <p className='font-semibold'>{sukses}</p>
              <p className='text-xs text-emerald-600 mt-0.5'>
                Data pendaftaran telah tercatat di sistem dan dapat dilihat pada dashboard utama.
              </p>
            </div>
            <button
              type='button'
              onClick={() => navigate(`${basePath}/Home?tab=calon`)}
              className='px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer whitespace-nowrap'
            >
              Lihat di Dashboard Home →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
