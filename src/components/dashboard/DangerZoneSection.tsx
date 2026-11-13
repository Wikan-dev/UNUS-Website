import type { ReactElement } from 'react';
import type { Mahasiswa } from '../../helper/types';
import type { StudentFormData } from '../../helper/dashboardTypes';
import { STATUS_OPTIONS } from '../../helper/dashboardConstants';

interface DangerZoneSectionProps {
  mhs: Mahasiswa;
  formData: StudentFormData;
  isEditing: boolean;
  saving: boolean;
  hasSensitiveChanges: boolean;
  onFormChange: (updated: Partial<StudentFormData>) => void;
  onSaveSensitiveOnly: () => void;
  onDeleteStudent: () => void;
}

export default function DangerZoneSection({
  mhs,
  formData,
  isEditing,
  saving,
  hasSensitiveChanges,
  onFormChange,
  onSaveSensitiveOnly,
  onDeleteStudent,
}: DangerZoneSectionProps): ReactElement {
  const currentStatusObj = STATUS_OPTIONS.find((s) => s.value === mhs.status_akademik);

  return (
    <section className='bg-gradient-to-b from-red-50/60 to-rose-50/40 rounded-3xl shadow-md overflow-hidden'>
      {/* Header Zona Berbahaya */}
      <div className='p-6 bg-red-500/10 border-b border-red-200 flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='flex items-start md:items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm'>
            ⚠️
          </div>
          <div>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-red-600 text-white'>
                ZONA BERBAHAYA / DANGER ZONE
              </span>
              <span className='px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-red-100 text-red-800 border border-red-300'>
                Data Sensitif & Kritis
              </span>
            </div>
            <h2 className='text-xl font-bold text-red-900 font-merrie mt-1'>
              Section 2: Pengaturan Data Sensitif & Integritas Sistem
            </h2>
          </div>
        </div>

        <div className='text-left md:text-right'>
          <span className='inline-block px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full text-xs font-semibold'>
            Tingkat Risiko: Kritis (High Impact)
          </span>
        </div>
      </div>

      {/* Box Peringatan Resmi Bahaya */}
      <div className='m-6 md:m-8 p-5 bg-white/90 border-2 border-dashed border-red-300 rounded-2xl'>
        <div className='flex items-start gap-3.5'>
          <span className='text-2xl shrink-0'>🚨</span>
          <div className='text-xs text-red-900 space-y-1.5 leading-relaxed'>
            <p className='font-bold text-sm text-red-950 uppercase tracking-wide'>
              PERINGATAN: Bagian ini Sangat Berbahaya Jika Diedit!
            </p>
            <p>
              Bagian ini mengatur data kunci pangkalan data sistem. Mengubah data pada bagian ini memiliki
              konsekuensi langsung:
            </p>
            <ul className='list-disc pl-5 space-y-1 text-red-800'>
              <li>
                <strong>Nomor Induk Mahasiswa (NIM):</strong> Berfungsi sebagai <em>Primary Key</em> sistem.
                Mengubah NIM akan secara otomatis merestrukturisasi foreign key nilai akademik (KRS), riwayat
                presensi digital, dan mengganti tautan URL enkripsi profil mahasiswa.
              </li>
              <li>
                <strong>Status Akademik:</strong> Mengubah status menjadi <em>Cuti</em> atau{' '}
                <em>DO (Drop Out)</em> akan langsung memblokir akses pengisian KRS dan menonaktifkan hak
                keikutsertaan perkuliahan mahasiswa di seluruh sistem kampus.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form Input Data Sensitif */}
      <div className='px-6 md:px-8 pb-8 space-y-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Field Sensitif 1: NIM (Primary Key) */}
          <div className='p-5 bg-white rounded-2xl border border-red-200 shadow-sm'>
            <div className='flex items-center justify-between mb-2'>
              <label className='block text-xs font-bold uppercase tracking-wider text-red-900'>
                Nomor Induk Mahasiswa (NIM) <span className='text-red-600'>*</span>
              </label>
              <span className='text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded'>
                PRIMARY KEY
              </span>
            </div>

            {isEditing ? (
              <div>
                <input
                  type='text'
                  value={formData.nim}
                  onChange={(e) => onFormChange({ nim: e.target.value })}
                  className='w-full px-4 py-2.5 text-sm font-mono font-bold text-gray-900 bg-red-50/40 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:bg-white focus:outline-none transition'
                  placeholder='Contoh: 2301001'
                />
                <p className='text-[11px] text-red-600 mt-2 font-medium flex items-center gap-1.5'>
                  <span>⚠️</span> Perubahan NIM akan mengubah link dashboard mahasiswa ini.
                </p>
              </div>
            ) : (
              <div>
                <div className='p-3 bg-red-50/50 rounded-xl border border-red-200 text-sm font-mono font-bold text-red-950 flex items-center justify-between'>
                  <span>{mhs.nim}</span>
                  <span className='text-xs font-normal text-red-600'>Terkunci (Read Only)</span>
                </div>
                <p className='text-[11px] text-gray-500 mt-1.5'>
                  NIM saat ini digunakan pada seluruh relasi KRS dan absensi.
                </p>
              </div>
            )}
          </div>

          {/* Field Sensitif 2: Status Akademik */}
          <div className='p-5 bg-white rounded-2xl border border-red-200 shadow-sm'>
            <div className='flex items-center justify-between mb-2'>
              <label className='block text-xs font-bold uppercase tracking-wider text-red-900'>
                Status Akademik Mahasiswa <span className='text-red-600'>*</span>
              </label>
              <span className='text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded'>
                HAK AKSES
              </span>
            </div>

            {isEditing ? (
              <div>
                <select
                  value={formData.status_akademik}
                  onChange={(e) => onFormChange({ status_akademik: e.target.value })}
                  className='w-full px-4 py-2.5 text-sm font-bold text-gray-900 bg-red-50/40 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:bg-white focus:outline-none transition'
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} - {opt.desc}
                    </option>
                  ))}
                </select>
                <p className='text-[11px] text-red-600 mt-2 font-medium flex items-center gap-1.5'>
                  <span>⚠️</span> Memilih status 'DO' atau 'Cuti' akan mencabut hak aktif perkuliahan.
                </p>
              </div>
            ) : (
              <div>
                <div className='p-3 bg-red-50/50 rounded-xl border border-red-200 flex items-center justify-between'>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold rounded-lg border ${
                      currentStatusObj?.badgeClass || 'bg-gray-100'
                    }`}
                  >
                    {mhs.status_akademik}
                  </span>
                  <span className='text-xs font-normal text-red-600'>Terkunci (Read Only)</span>
                </div>
                <p className='text-[11px] text-gray-500 mt-1.5'>{currentStatusObj?.desc}</p>
              </div>
            )}
          </div>
        </div>

        {/* Opsi Aksi Cepat Pada Zona Berbahaya */}
        <div className='pt-6 border-t border-red-200/80 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div>
            <p className='text-xs font-bold text-red-950 uppercase tracking-wide'>
              Perintah Khusus Zona Berbahaya
            </p>
            <p className='text-xs text-red-700 mt-0.5'>
              Setiap perintah di bawah ini akan memunculkan dialog konfirmasi berlapis demi keamanan data kampus.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end'>
            {isEditing && (
              <button
                type='button'
                onClick={onSaveSensitiveOnly}
                disabled={saving || !hasSensitiveChanges}
                className='px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer'
              >
                <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4'
                  />
                </svg>
                Simpan Khusus Data Sensitif
              </button>
            )}

            <button
              type='button'
              onClick={onDeleteStudent}
              disabled={saving}
              className='px-4 py-2.5 bg-white hover:bg-red-50 text-red-700 border border-red-300 hover:border-red-500 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer'
            >
              <svg className='w-4 h-4 text-red-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
              Hapus Mahasiswa dari Database
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
