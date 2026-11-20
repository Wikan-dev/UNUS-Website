import { useState, useEffect, useMemo } from 'react';
import type { Mahasiswa, CalonMahasiswa } from '../helper/types.tsx';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useSessionPath } from '../helper/useSessionPath';
import { getAuthHeaders } from '../helper/auth';

export default function LandingPage() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [calonMahasiswa, setCalonMahasiswa] = useState<CalonMahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'menunggu' | 'valid' | 'ditolak' | 'lolos'>('all');

  // Modal Detail Status Pendaftaran
  const [selectedCalon, setSelectedCalon] = useState<CalonMahasiswa | null>(null);
  const [copied, setCopied] = useState(false);

  // State untuk form edit status di modal
  const [editStatusDokumen, setEditStatusDokumen] = useState<string>('Menunggu Validasi');
  const [editStatusPenerimaan, setEditStatusPenerimaan] = useState<string>('Diproses');
  const [updating, setUpdating] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'mahasiswa' ? 'mahasiswa' : 'calon';
  const [activeTab, setActiveTab] = useState<'calon' | 'mahasiswa'>(initialTab);

  const navigate = useNavigate();
  const basePath = useSessionPath();

  useEffect(() => {
    const ambilSemua = async () => {
      setLoading(true);
      setError(null);
      try {
        const [resMhs, resCalon] = await Promise.all([
          fetch('/api.php?endpoint=mahasiswa', { headers: getAuthHeaders() }),
          fetch('/api.php?endpoint=calon_mahasiswa', { headers: getAuthHeaders() }),
        ]);

        if (resMhs.ok) {
          const dataMhs: Mahasiswa[] = await resMhs.json();
          setMahasiswa(Array.isArray(dataMhs) ? dataMhs : []);
        }

        if (resCalon.ok) {
          const dataCalon: CalonMahasiswa[] = await resCalon.json();
          setCalonMahasiswa(Array.isArray(dataCalon) ? dataCalon : []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    };

    ambilSemua();
  }, []);

  // Sinkronkan state edit saat modal dibuka
  useEffect(() => {
    if (selectedCalon) {
      setEditStatusDokumen(selectedCalon.status_dokumen || 'Menunggu Validasi');
      setEditStatusPenerimaan(selectedCalon.status_penerimaan || 'Diproses');
      setUpdateSuccess(null);
      setUpdateError(null);
    }
  }, [selectedCalon]);

  const handleTabChange = (tab: 'calon' | 'mahasiswa') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Filter Calon Mahasiswa berdasarkan Search & Filter Status
  const filteredCalon = useMemo(() => {
    return calonMahasiswa.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        c.nama_pendaftar.toLowerCase().includes(q) ||
        c.no_pendaftaran.toLowerCase().includes(q) ||
        c.asal_sekolah.toLowerCase().includes(q);

      if (!matchQuery) return false;

      if (statusFilter === 'menunggu') return c.status_dokumen === 'Menunggu Validasi';
      if (statusFilter === 'valid') return c.status_dokumen === 'Valid';
      if (statusFilter === 'ditolak') return c.status_dokumen === 'Ditolak';
      if (statusFilter === 'lolos') return c.status_penerimaan === 'Lolos';

      return true;
    });
  }, [calonMahasiswa, searchQuery, statusFilter]);

  // Filter Mahasiswa Aktif
  const filteredMhs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return mahasiswa;
    return mahasiswa.filter(
      (m) =>
        m.nama_lengkap.toLowerCase().includes(q) ||
        m.nim.toLowerCase().includes(q) ||
        m.program_studi.toLowerCase().includes(q)
    );
  }, [mahasiswa, searchQuery]);

  // Cek langsung dengan No. Pendaftaran dari Search Bar
  const handleDirectCheck = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    const matched = calonMahasiswa.find(
      (c) => c.no_pendaftaran.toLowerCase() === q || c.nama_pendaftar.toLowerCase() === q
    );

    if (matched) {
      setSelectedCalon(matched);
      setActiveTab('calon');
    }
  };

  const handleCopyNoPendaftaran = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fungsi mengubah status di database (PATCH)
  const handleSaveStatus = async (targetDokumen?: string, targetPenerimaan?: string) => {
    if (!selectedCalon) return;

    const docToSave = targetDokumen ?? editStatusDokumen;
    const penerimaanToSave = targetPenerimaan ?? editStatusPenerimaan;

    setUpdating(true);
    setUpdateSuccess(null);
    setUpdateError(null);

    try {
      const response = await fetch('/api.php?endpoint=calon_mahasiswa', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          id_pendaftar: selectedCalon.id_pendaftar,
          status_dokumen: docToSave,
          status_penerimaan: penerimaanToSave,
        }),
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.error || 'Gagal mengubah status di database');
      }

      // Update state calonMahasiswa lokal
      setCalonMahasiswa((prev) =>
        prev.map((c) =>
          String(c.id_pendaftar) === String(selectedCalon.id_pendaftar)
            ? {
                ...c,
                status_dokumen: docToSave,
                status_penerimaan: penerimaanToSave,
              }
            : c
        )
      );

      // Update selectedCalon saat modal masih terbuka
      setSelectedCalon((prev) =>
        prev
          ? {
              ...prev,
              status_dokumen: docToSave,
              status_penerimaan: penerimaanToSave,
            }
          : null
      );

      setEditStatusDokumen(docToSave);
      setEditStatusPenerimaan(penerimaanToSave);
      setUpdateSuccess('Status berhasil diperbarui di database!');
      setTimeout(() => setUpdateSuccess(null), 3000);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setUpdating(false);
    }
  };

  // Fungsi pengubahan instan dari dropdown tabel
  const handleQuickUpdate = async (
    id_pendaftar: string | number,
    newStatusDokumen?: string,
    newStatusPenerimaan?: string
  ) => {
    try {
      const payload: Record<string, string | number> = { id_pendaftar };
      if (newStatusDokumen) payload.status_dokumen = newStatusDokumen;
      if (newStatusPenerimaan) payload.status_penerimaan = newStatusPenerimaan;

      const response = await fetch('/api.php?endpoint=calon_mahasiswa', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.error || 'Gagal mengubah status');
      }

      setCalonMahasiswa((prev) =>
        prev.map((c) =>
          String(c.id_pendaftar) === String(id_pendaftar)
            ? {
                ...c,
                ...(newStatusDokumen ? { status_dokumen: newStatusDokumen } : {}),
                ...(newStatusPenerimaan ? { status_penerimaan: newStatusPenerimaan } : {}),
              }
            : c
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan saat memperbarui status');
    }
  };

  const pendingCount = calonMahasiswa.filter((c) => c.status_dokumen === 'Menunggu Validasi').length;
  const validCount = calonMahasiswa.filter((c) => c.status_dokumen === 'Valid').length;
  const lolosCount = calonMahasiswa.filter((c) => c.status_penerimaan === 'Lolos').length;

  return (
    <div className='p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6'>
      {/* ── 1. Header Atas ── */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold font-merrie text-gray-800'>
            Dashboard Utama Akademik
          </h1>
          <p className='text-gray-500 mt-1 text-sm'>
            Kelola data mahasiswa aktif serta status verifikasi calon mahasiswa baru (PMB)
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate(`${basePath}/DaftarCalonMahasiswa`)}
            className='cursor-pointer px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl shadow-sm transition flex items-center gap-2 text-sm'
          >
            <span className='font-bold text-base'>+</span>
            <span>Daftar Calon Mahasiswa Baru</span>
          </button>
        </div>
      </div>

      {/* ── 2. Kartu Ringkasan Statistik ── */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div className='bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4'>
          <div className='w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl'>
            🎓
          </div>
          <div>
            <div className='text-2xl font-bold text-gray-800'>{mahasiswa.length}</div>
            <div className='text-xs text-gray-500 font-medium'>Mahasiswa Aktif Terdaftar</div>
          </div>
        </div>

        <div className='bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4'>
          <div className='w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl'>
            📝
          </div>
          <div>
            <div className='text-2xl font-bold text-gray-800'>{calonMahasiswa.length}</div>
            <div className='text-xs text-gray-500 font-medium'>Total Pendaftar Calon Mahasiswa</div>
          </div>
        </div>

        <div className='bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4'>
          <div className='w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xl'>
            ⏳
          </div>
          <div>
            <div className='text-2xl font-bold text-gray-800'>{pendingCount}</div>
            <div className='text-xs text-gray-500 font-medium'>Dokumen Menunggu Validasi</div>
          </div>
        </div>
      </div>

      {/* ── 3. SEARCH BAR UTAMA & FILTER CEPAT ── */}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDirectCheck()}
              placeholder='Cari nomor pendaftaran (contoh: CLNMHS...), nama lengkap, atau asal sekolah...'
              className='w-full pl-10 pr-10 py-3 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer'
                title='Hapus pencarian'
              >
                ✕
              </button>
            )}
          </div>

          {/* Tombol Cek Status Instan */}
          <button
            onClick={handleDirectCheck}
            className='px-5 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer'
          >
            <span>Cek Status</span>
            <span>→</span>
          </button>
        </div>

        {/* Filter Chips untuk Calon Mahasiswa */}
        {activeTab === 'calon' && (
          <div className='flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 text-xs'>
            <span className='text-gray-500 font-semibold mr-1'>Filter Status:</span>

            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua ({calonMahasiswa.length})
            </button>

            <button
              onClick={() => setStatusFilter('menunggu')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'menunggu'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <span>Menunggu Validasi</span>
              <span className='font-bold'>({pendingCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('valid')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'valid'
                  ? 'bg-green-600 text-white shadow-2xs'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              <span>Dokumen Valid</span>
              <span className='font-bold'>({validCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('lolos')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'lolos'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <span>Lolos Seleksi</span>
              <span className='font-bold'>({lolosCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* ── 4. TAB SWITCHER ── */}
      <div className='flex items-center gap-2'>
        <button
          onClick={() => handleTabChange('calon')}
          className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'calon'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span>Pendaftaran Calon Mahasiswa (PMB)</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'calon'
                ? 'bg-white/20 text-white'
                : 'bg-blue-50 text-blue-700'
            }`}
          >
            {filteredCalon.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('mahasiswa')}
          className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'mahasiswa'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span>Mahasiswa Aktif</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'mahasiswa'
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {filteredMhs.length}
          </span>
        </button>
      </div>

      {loading && <p className='text-gray-500 py-4'>Memuat data dari database...</p>}
      {error && <p className='text-red-500 py-4 bg-red-50 p-4 rounded-xl border border-red-200'>Error: {error}</p>}

      {/* ── 5. TABEL 1: DATA CALON MAHASISWA & DROPDOWN VALIDASI INSTAN ── */}
      {activeTab === 'calon' && !loading && (
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50'>
            <div>
              <h2 className='font-bold text-gray-800 font-merrie text-lg'>
                Daftar Calon Mahasiswa Terdaftar
              </h2>
              <p className='text-xs text-gray-500'>
                Ubah status validasi dokumen dan status seleksi langsung melalui dropdown atau tombol <strong>Cek Status</strong>
              </p>
            </div>
            <span className='text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full'>
              {filteredCalon.length} dari {calonMahasiswa.length} pendaftar
            </span>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600'>
                  <th className='p-4 text-center w-12'>No</th>
                  <th className='p-4'>No. Pendaftaran</th>
                  <th className='p-4'>Nama Pendaftar</th>
                  <th className='p-4'>Pilihan Prodi</th>
                  <th className='p-4'>Asal Sekolah</th>
                  <th className='p-4 text-center'>Berkas Upload</th>
                  <th className='p-4 text-center'>Status Dokumen</th>
                  <th className='p-4 text-center'>Status Seleksi</th>
                  <th className='p-4 text-center'>Aksi</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 text-sm'>
                {filteredCalon.length === 0 ? (
                  <tr>
                    <td colSpan={9} className='p-8 text-center text-gray-400'>
                      Tidak ada calon mahasiswa yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredCalon.map((c, index) => (
                    <tr key={c.id_pendaftar} className='hover:bg-blue-50/40 transition-colors'>
                      <td className='p-4 text-center text-gray-500'>{index + 1}</td>
                      <td className='p-4 font-mono font-semibold text-blue-700 whitespace-nowrap'>
                        {c.no_pendaftaran}
                      </td>
                      <td className='p-4 font-semibold text-gray-900'>
                        {c.nama_pendaftar}
                      </td>
                      <td className='p-4 text-xs font-semibold text-blue-800 whitespace-nowrap'>
                        {c.program_studi || 'Teknik Informatika'}
                      </td>
                      <td className='p-4 text-gray-600'>{c.asal_sekolah}</td>
                      <td className='p-4 text-center whitespace-nowrap'>
                        <div className='inline-flex items-center gap-1.5'>
                          {c.url_ijazah ? (
                            <a
                              href={`/uploads/${c.url_ijazah}`}
                              target='_blank'
                              rel='noreferrer'
                              className='px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition'
                              title='Lihat Ijazah'
                            >
                              📄 Ijazah
                            </a>
                          ) : (
                            <span className='text-xs text-gray-400'>-</span>
                          )}
                          {c.url_kk ? (
                            <a
                              href={`/uploads/${c.url_kk}`}
                              target='_blank'
                              rel='noreferrer'
                              className='px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition'
                              title='Lihat Kartu Keluarga'
                            >
                              📋 KK
                            </a>
                          ) : (
                            <span className='text-xs text-gray-400'>-</span>
                          )}
                        </div>
                      </td>

                      {/* Dropdown Cepat Status Dokumen */}
                      <td className='p-4 text-center whitespace-nowrap'>
                        <select
                          value={c.status_dokumen || 'Menunggu Validasi'}
                          onChange={(e) => handleQuickUpdate(c.id_pendaftar, e.target.value, undefined)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                            c.status_dokumen === 'Valid'
                              ? 'bg-green-50 text-green-700 border-green-300'
                              : c.status_dokumen === 'Ditolak'
                              ? 'bg-red-50 text-red-700 border-red-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}
                          title='Ubah Status Dokumen'
                        >
                          <option value='Menunggu Validasi'>⏳ Menunggu Validasi</option>
                          <option value='Valid'>✓ Valid</option>
                          <option value='Ditolak'>✕ Ditolak</option>
                        </select>
                      </td>

                      {/* Dropdown Cepat Status Seleksi */}
                      <td className='p-4 text-center whitespace-nowrap'>
                        <select
                          value={c.status_penerimaan || 'Diproses'}
                          onChange={(e) => handleQuickUpdate(c.id_pendaftar, undefined, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                            c.status_penerimaan === 'Lolos'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : c.status_penerimaan === 'Tidak Lolos'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : 'bg-blue-50 text-blue-700 border-blue-300'
                          }`}
                          title='Ubah Status Penerimaan'
                        >
                          <option value='Diproses'>• Diproses</option>
                          <option value='Lolos'>✓ Lolos</option>
                          <option value='Tidak Lolos'>✕ Tidak Lolos</option>
                        </select>
                      </td>

                      {/* Tombol Cek Detail & Edit Lengkap */}
                      <td className='p-4 text-center whitespace-nowrap'>
                        <button
                          onClick={() => setSelectedCalon(c)}
                          className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg border border-blue-200 transition cursor-pointer shadow-2xs'
                          title='Cek Detail Status Pendaftaran'
                        >
                          <svg className='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z' />
                            <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                          </svg>
                          <span>Cek Status</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 6. TABEL 2: DATA MAHASISWA AKTIF ── */}
      {activeTab === 'mahasiswa' && !loading && (
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50'>
            <div>
              <h2 className='font-bold text-gray-800 font-merrie text-lg'>
                Data Mahasiswa Aktif
              </h2>
              <p className='text-xs text-gray-500'>
                Mahasiswa yang telah memiliki NIM dan terdaftar aktif di SIAKAD
              </p>
            </div>
            <span className='text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full'>
              Total: {filteredMhs.length} mahasiswa
            </span>
          </div>

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
                {filteredMhs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='p-6 text-center text-gray-400'>
                      Tidak ada data mahasiswa yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredMhs.map((m, index) => (
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
                          to={`${basePath}/DashBoardMahasiswa/${m.hash_profil}`}
                          className='inline-block px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition'
                        >
                          Lihat Dashboard
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 7. MODAL POPUP: DETAIL & UBAH STATUS VALIDASI PENDAFTARAN ── */}
      {selectedCalon && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200'>
          <div
            className='bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className='px-6 py-5 bg-gradient-to-r from-sidebar to-[#1e3a47] text-white flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl'>
                  📋
                </div>
                <div>
                  <h3 className='font-bold font-merrie text-lg'>Status Pendaftaran PMB</h3>
                  <p className='text-xs text-white/70'>Detail verifikasi dokumen & pembaruan status seleksi</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCalon(null)}
                className='p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer'
                title='Tutup'
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className='p-6 overflow-y-auto space-y-6 text-sm text-gray-800'>
              {/* Pesan Sukses / Error Pembaruan */}
              {updateSuccess && (
                <div className='p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2'>
                  <span className='font-bold text-sm'>✓</span>
                  <span>{updateSuccess}</span>
                </div>
              )}
              {updateError && (
                <div className='p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2'>
                  <span className='font-bold text-sm'>✕</span>
                  <span>{updateError}</span>
                </div>
              )}

              {/* Nomor Pendaftaran Card */}
              <div className='bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                <div>
                  <div className='text-xs font-semibold text-blue-800 uppercase tracking-wider'>
                    Nomor Pendaftaran
                  </div>
                  <div className='text-xl font-mono font-bold text-blue-900 mt-0.5'>
                    {selectedCalon.no_pendaftaran}
                  </div>
                </div>
                <button
                  onClick={() => handleCopyNoPendaftaran(selectedCalon.no_pendaftaran)}
                  className='px-3 py-1.5 bg-white border border-blue-300 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100/50 transition cursor-pointer flex items-center gap-1.5 w-fit'
                >
                  {copied ? (
                    <>
                      <span>✓</span>
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <span>📋</span>
                      <span>Salin Nomor</span>
                    </>
                  )}
                </button>
              </div>

              {/* Data Diri Pendaftar */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200/70'>
                <div>
                  <span className='text-xs text-gray-500 font-medium block'>Nama Lengkap Pendaftar:</span>
                  <span className='font-bold text-gray-900 text-base'>{selectedCalon.nama_pendaftar}</span>
                </div>
                <div>
                  <span className='text-xs text-gray-500 font-medium block'>Asal Sekolah:</span>
                  <span className='font-semibold text-gray-800'>{selectedCalon.asal_sekolah}</span>
                </div>
              </div>

              {/* ── PANEL KONTROL: UBAH STATUS VALIDASI & SELEKSI ── */}
              <div className='bg-slate-50 border-2 border-blue-100 p-5 rounded-2xl space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='text-lg'>⚙</span>
                    <h4 className='font-bold text-gray-900 font-merrie text-sm'>
                      Ubah Status Validasi & Penerimaan
                    </h4>
                  </div>
                  <span className='text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full'>
                    Update Database
                  </span>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {/* Select Status Dokumen */}
                  <div>
                    <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1'>
                      Status Dokumen (Berkas):
                    </label>
                    <select
                      value={editStatusDokumen}
                      onChange={(e) => setEditStatusDokumen(e.target.value)}
                      className='w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-blue-600 focus:outline-none'
                    >
                      <option value='Menunggu Validasi'>Menunggu Validasi</option>
                      <option value='Valid'>Valid</option>
                      <option value='Ditolak'>Ditolak</option>
                    </select>
                  </div>

                  {/* Select Status Penerimaan */}
                  <div>
                    <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1'>
                      Status Seleksi Penerimaan:
                    </label>
                    <select
                      value={editStatusPenerimaan}
                      onChange={(e) => setEditStatusPenerimaan(e.target.value)}
                      className='w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-blue-600 focus:outline-none'
                    >
                      <option value='Diproses'>Diproses</option>
                      <option value='Lolos'>Lolos</option>
                      <option value='Tidak Lolos'>Tidak Lolos</option>
                    </select>
                  </div>
                </div>

                {/* Tombol Aksi Cepat & Simpan */}
                <div className='flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-200/60'>
                  <div className='flex flex-wrap items-center gap-2 text-xs'>
                    <span className='text-gray-500 font-medium'>Aksi Cepat:</span>
                    <button
                      type='button'
                      disabled={updating}
                      onClick={() => handleSaveStatus('Valid', 'Lolos')}
                      className='px-2.5 py-1 bg-green-100 hover:bg-green-200 text-green-800 font-semibold rounded-lg transition cursor-pointer disabled:opacity-50'
                      title='Tandai Berkas Valid & Loloskan'
                    >
                      ✓ Valid & Lolos
                    </button>
                    <button
                      type='button'
                      disabled={updating}
                      onClick={() => handleSaveStatus('Ditolak', 'Tidak Lolos')}
                      className='px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-semibold rounded-lg transition cursor-pointer disabled:opacity-50'
                      title='Tolak Berkas & Tidak Lolos'
                    >
                      ✕ Tolak
                    </button>
                  </div>

                  <button
                    type='button'
                    disabled={updating}
                    onClick={() => handleSaveStatus()}
                    className='px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-xs shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50'
                  >
                    {updating ? (
                      <>
                        <div className='w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <span>💾 Simpan Status</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Dokumen & Penerimaan Overview */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {/* Dokumen Card */}
                <div className='p-4 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-2'>
                  <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider block'>
                    1. Verifikasi Berkas Dokumen
                  </span>
                  <div>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                        selectedCalon.status_dokumen === 'Valid'
                          ? 'bg-green-100 text-green-700'
                          : selectedCalon.status_dokumen === 'Ditolak'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {selectedCalon.status_dokumen || 'Menunggu Validasi'}
                    </span>
                  </div>
                  <p className='text-xs text-gray-500 leading-relaxed'>
                    {selectedCalon.status_dokumen === 'Valid'
                      ? 'Berkas Ijazah dan KK telah dinyatakan memenuhi syarat oleh panitia verifikator.'
                      : selectedCalon.status_dokumen === 'Ditolak'
                      ? 'Berkas ditolak. Pastikan foto ijazah/KK tidak buram dan sesuai dokumen asli.'
                      : 'Berkas dalam antrean pengecekan berkala oleh tim panitia pendaftaran.'}
                  </p>
                </div>

                {/* Status Seleksi Card */}
                <div className='p-4 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-2'>
                  <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider block'>
                    2. Hasil Seleksi Penerimaan
                  </span>
                  <div>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                        selectedCalon.status_penerimaan === 'Lolos'
                          ? 'bg-emerald-100 text-emerald-700'
                          : selectedCalon.status_penerimaan === 'Tidak Lolos'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {selectedCalon.status_penerimaan || 'Diproses'}
                    </span>
                  </div>
                  <p className='text-xs text-gray-500 leading-relaxed'>
                    {selectedCalon.status_penerimaan === 'Lolos'
                      ? 'Selamat! Calon mahasiswa dinyatakan lolos seleksi penerimaan Universitas Nusantara.'
                      : selectedCalon.status_penerimaan === 'Tidak Lolos'
                      ? 'Calon mahasiswa belum berhasil pada gelombang seleksi periode ini.'
                      : 'Tahap seleksi nilai dan berkas masih berlangsung sesuai jadwal panitia.'}
                  </p>
                </div>
              </div>

              {/* Alur Tahapan / Timeline */}
              <div className='bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3'>
                <h4 className='font-bold text-xs uppercase tracking-wider text-gray-600'>
                  Tahapan Alur Pendaftaran
                </h4>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs'>
                  <div className='p-3 bg-white rounded-xl border border-emerald-200 flex items-center gap-2.5'>
                    <span className='w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0'>
                      ✓
                    </span>
                    <div>
                      <div className='font-bold text-gray-800'>1. Formulir</div>
                      <div className='text-[11px] text-emerald-600'>Terkirim Sukses</div>
                    </div>
                  </div>

                  <div className={`p-3 bg-white rounded-xl border flex items-center gap-2.5 ${
                    selectedCalon.status_dokumen === 'Valid'
                      ? 'border-emerald-200'
                      : selectedCalon.status_dokumen === 'Ditolak'
                      ? 'border-red-200'
                      : 'border-amber-200'
                  }`}>
                    <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center shrink-0 ${
                      selectedCalon.status_dokumen === 'Valid'
                        ? 'bg-emerald-100 text-emerald-700'
                        : selectedCalon.status_dokumen === 'Ditolak'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedCalon.status_dokumen === 'Valid' ? '✓' : selectedCalon.status_dokumen === 'Ditolak' ? '✕' : '⏳'}
                    </span>
                    <div>
                      <div className='font-bold text-gray-800'>2. Validasi Dokumen</div>
                      <div className='text-[11px] text-gray-500'>{selectedCalon.status_dokumen || 'Proses Pengecekan'}</div>
                    </div>
                  </div>

                  <div className={`p-3 bg-white rounded-xl border flex items-center gap-2.5 ${
                    selectedCalon.status_penerimaan === 'Lolos'
                      ? 'border-emerald-200'
                      : selectedCalon.status_penerimaan === 'Tidak Lolos'
                      ? 'border-red-200'
                      : 'border-blue-200'
                  }`}>
                    <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center shrink-0 ${
                      selectedCalon.status_penerimaan === 'Lolos'
                        ? 'bg-emerald-100 text-emerald-700'
                        : selectedCalon.status_penerimaan === 'Tidak Lolos'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedCalon.status_penerimaan === 'Lolos' ? '✓' : selectedCalon.status_penerimaan === 'Tidak Lolos' ? '✕' : '•'}
                    </span>
                    <div>
                      <div className='font-bold text-gray-800'>3. Pengumuman</div>
                      <div className='text-[11px] text-gray-500'>{selectedCalon.status_penerimaan || 'Menunggu Hasil'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Berkas Dokumen Terlampir */}
              <div className='space-y-2'>
                <span className='text-xs font-semibold text-gray-600 uppercase tracking-wider block'>
                  Berkas Dokumen yang Diunggah
                </span>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {selectedCalon.url_ijazah ? (
                    <a
                      href={`/uploads/${selectedCalon.url_ijazah}`}
                      target='_blank'
                      rel='noreferrer'
                      className='p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition flex items-center justify-between group'
                    >
                      <div className='flex items-center gap-2.5 truncate'>
                        <span className='text-lg'>📄</span>
                        <div className='truncate'>
                          <div className='font-semibold text-xs text-gray-800 group-hover:text-blue-700'>
                            Berkas Ijazah Terlegalisir
                          </div>
                          <div className='text-[11px] text-gray-400 truncate'>{selectedCalon.url_ijazah}</div>
                        </div>
                      </div>
                      <span className='text-xs font-bold text-blue-600 shrink-0 ml-2'>Buka ↗</span>
                    </a>
                  ) : (
                    <div className='p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-400'>
                      Berkas Ijazah tidak ada
                    </div>
                  )}

                  {selectedCalon.url_kk ? (
                    <a
                      href={`/uploads/${selectedCalon.url_kk}`}
                      target='_blank'
                      rel='noreferrer'
                      className='p-3 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-xl transition flex items-center justify-between group'
                    >
                      <div className='flex items-center gap-2.5 truncate'>
                        <span className='text-lg'>📋</span>
                        <div className='truncate'>
                          <div className='font-semibold text-xs text-gray-800 group-hover:text-emerald-700'>
                            Kartu Keluarga (KK)
                          </div>
                          <div className='text-[11px] text-gray-400 truncate'>{selectedCalon.url_kk}</div>
                        </div>
                      </div>
                      <span className='text-xs font-bold text-emerald-600 shrink-0 ml-2'>Buka ↗</span>
                    </a>
                  ) : (
                    <div className='p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-400'>
                      Berkas Kartu Keluarga tidak ada
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className='px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3'>
              <span className='text-xs text-gray-500'>
                Perubahan status akan langsung tercermin pada database kampus
              </span>
              <button
                type='button'
                onClick={() => setSelectedCalon(null)}
                className='px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl text-sm transition cursor-pointer'
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
