import { useState, useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Mahasiswa } from '../../helper/types';
import { useSessionPath } from '../../helper/useSessionPath';

interface EmptyDashboardProps {
  allStudents: Mahasiswa[];
}

export default function EmptyDashboard({ allStudents }: EmptyDashboardProps): ReactElement {
  const navigate = useNavigate();
  const basePath = useSessionPath();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'aktif' | 'belum_aktif'>('all');

  // Pisahkan mahasiswa aktif (resmi ber-NIM) vs mahasiswa yang belum aktif / belum terverifikasi
  const activeStudents = useMemo(
    () => allStudents.filter((item) => item.status_akademik === 'Aktif' && !item.nim.startsWith('CLNMHS')),
    [allStudents]
  );

  const pendingStudents = useMemo(
    () => allStudents.filter((item) => item.status_akademik !== 'Aktif' || item.nim.startsWith('CLNMHS')),
    [allStudents]
  );

  // Filter pencarian
  const filteredStudents = useMemo(() => {
    return allStudents.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.nama_lengkap.toLowerCase().includes(q) ||
        item.nim.toLowerCase().includes(q) ||
        item.program_studi.toLowerCase().includes(q);

      if (!matchSearch) return false;

      const isBelumAktif = item.status_akademik !== 'Aktif' || item.nim.startsWith('CLNMHS');
      if (filterType === 'aktif') return !isBelumAktif;
      if (filterType === 'belum_aktif') return isBelumAktif;
      return true;
    });
  }, [allStudents, search, filterType]);

  return (
    <div className='p-6 md:p-8 w-full max-w-6xl mx-auto space-y-6'>
      {/* ── Header Pusat Dashboard ── */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold font-merrie text-gray-800'>
            Pusat Dashboard Mahasiswa
          </h1>
          <p className='text-gray-500 mt-1 text-sm'>
            Pilih salah satu mahasiswa dari daftar di bawah ini untuk melihat profil akademik dan detail lengkapnya
          </p>
        </div>

        <Link
          to={`${basePath}/Home`}
          className='inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl transition font-medium text-sm shadow-sm w-fit'
        >
          <span>←</span>
          <span>Buka Dashboard Utama (Home)</span>
        </Link>
      </div>

      {/* ── Ringkasan Jumlah ── */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div
          onClick={() => setFilterType('all')}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            filterType === 'all'
              ? 'bg-blue-50/70 border-blue-300 shadow-xs ring-2 ring-blue-500/20'
              : 'bg-white border-gray-200/80 hover:bg-gray-50'
          }`}
        >
          <div className='text-2xl font-bold text-gray-900'>{allStudents.length}</div>
          <div className='text-xs text-gray-500 font-semibold mt-1'>Total Mahasiswa Terdaftar</div>
        </div>

        <div
          onClick={() => setFilterType('aktif')}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            filterType === 'aktif'
              ? 'bg-blue-50/70 border-blue-300 shadow-xs ring-2 ring-blue-500/20'
              : 'bg-white border-gray-200/80 hover:bg-gray-50'
          }`}
        >
          <div className='text-2xl font-bold text-blue-700'>{activeStudents.length}</div>
          <div className='text-xs text-gray-500 font-semibold mt-1'>Mahasiswa Aktif (Resmi Ber-NIM)</div>
        </div>

        <div
          onClick={() => setFilterType('belum_aktif')}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            filterType === 'belum_aktif'
              ? 'bg-amber-50/70 border-amber-300 shadow-xs ring-2 ring-amber-500/20'
              : 'bg-white border-gray-200/80 hover:bg-gray-50'
          }`}
        >
          <div className='text-2xl font-bold text-amber-700'>{pendingStudents.length}</div>
          <div className='text-xs text-gray-500 font-semibold mt-1'>Belum Terverifikasi / Belum Aktif</div>
        </div>
      </div>

      {/* ── Search Bar & Dropdown Navigasi Cepat ── */}
      <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4'>
        <div className='flex flex-col md:flex-row items-stretch md:items-center gap-3'>
          {/* Input Search */}
          <div className='relative flex-1'>
            <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400'>
              <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' />
              </svg>
            </div>
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Cari nama mahasiswa, NIM, atau nomor pendaftaran...'
              className='w-full pl-10 pr-10 py-2.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition'
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-xs'
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdown Pemilih Mahasiswa Langsung */}
          {allStudents.length > 0 && (
            <div className='w-full md:w-80'>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    navigate(`${basePath}/DashBoardMahasiswa/${e.target.value}`);
                  }
                }}
                defaultValue=''
                className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium'
              >
                <option value='' disabled>
                  -- Pilih Mahasiswa ({allStudents.length} terdaftar) --
                </option>

                {activeStudents.length > 0 && (
                  <optgroup label={`🎓 Mahasiswa Aktif (${activeStudents.length})`}>
                    {activeStudents.map((item) => (
                      <option key={item.nim} value={item.hash_profil}>
                        {item.nim} - {item.nama_lengkap} ({item.program_studi})
                      </option>
                    ))}
                  </optgroup>
                )}

                {pendingStudents.length > 0 && (
                  <optgroup label={`⏳ Belum Terverifikasi (${pendingStudents.length})`}>
                    {pendingStudents.map((item) => (
                      <option key={item.nim} value={item.hash_profil}>
                        {item.nim} - {item.nama_lengkap} ({item.program_studi})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className='flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 text-xs'>
          <span className='text-gray-500 font-semibold mr-1'>Tampilkan:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua ({allStudents.length})
          </button>
          <button
            onClick={() => setFilterType('aktif')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              filterType === 'aktif'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mahasiswa Aktif ({activeStudents.length})
          </button>
          <button
            onClick={() => setFilterType('belum_aktif')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              filterType === 'belum_aktif'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Belum Terverifikasi ({pendingStudents.length})
          </button>
        </div>
      </div>

      {/* ── Grid Daftar Kartu Mahasiswa ── */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredStudents.length === 0 ? (
          <div className='col-span-full bg-white p-10 rounded-2xl border border-gray-200 text-center text-gray-400'>
            Tidak ada mahasiswa atau calon pendaftar yang cocok dengan pencarian.
          </div>
        ) : (
          filteredStudents.map((item) => {
            const isBelumAktif = item.status_akademik !== 'Aktif' || item.nim.startsWith('CLNMHS');
            return (
              <div
                key={item.nim}
                className='bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group'
              >
                <div>
                  <div className='flex items-start justify-between gap-2 mb-3'>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isBelumAktif
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {isBelumAktif ? 'Belum Terverifikasi' : 'Mahasiswa Aktif'}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        item.status_akademik === 'Aktif' || item.status_akademik === 'Valid'
                          ? 'bg-green-100 text-green-700'
                          : item.status_akademik === 'Ditolak'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.status_akademik}
                    </span>
                  </div>

                  <h3 className='font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors'>
                    {item.nama_lengkap}
                  </h3>

                  <div className='font-mono text-xs font-semibold text-gray-500 mt-1'>
                    {isBelumAktif ? 'No. Reg: ' : 'NIM: '}
                    <span className='text-gray-700'>{item.nim}</span>
                  </div>

                  <p className='text-xs font-medium text-blue-700 mt-2 line-clamp-1 flex items-center gap-1.5'>
                    <span>📚</span>
                    <span>{item.program_studi}</span>
                  </p>
                </div>

                <div className='pt-4 mt-4 border-t border-gray-100 flex items-center justify-between'>
                  <span className='text-xs text-gray-400'>
                    Angkatan {item.angkatan || '2024'}
                  </span>
                  <button
                    onClick={() => navigate(`${basePath}/DashBoardMahasiswa/${item.hash_profil}`)}
                    className={`text-xs font-semibold flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-xl transition ${
                      isBelumAktif
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                    }`}
                  >
                    <span>{isBelumAktif ? 'Verifikasi & Aktifkan' : 'Buka Detail'}</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
