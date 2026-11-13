import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { Mahasiswa } from '../../helper/types';
import type { StudentFormData, FieldChange } from '../../helper/dashboardTypes';
import { useSessionPath } from '../../helper/useSessionPath';

interface DashboardHeaderProps {
  mhs: Mahasiswa;
  formData: StudentFormData;
  isEditing: boolean;
  hasAdminAccess: boolean;
  saving: boolean;
  detectedChanges: FieldChange[];
  onToggleAdmin: (active: boolean) => void;
  onEnterEditMode: () => void;
  onCancelEdit: () => void;
  onResetForm: () => void;
  onSaveAll: () => void;
}

export default function DashboardHeader({
  mhs,
  formData,
  isEditing,
  hasAdminAccess,
  saving,
  detectedChanges,
  onToggleAdmin,
  onEnterEditMode,
  onCancelEdit,
  onResetForm,
  onSaveAll,
}: DashboardHeaderProps): ReactElement {
  const basePath = useSessionPath();

  return (
    <div className='bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm'>
      {/* Profil Singkat & Tombol Utama */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100'>
        <div className='flex items-start md:items-center gap-4'>
          <div className='w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0 font-merrie'>
            {mhs.nama_lengkap.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-2xl md:text-3xl font-bold font-merrie text-gray-900'>
                {isEditing ? formData.nama_lengkap || 'Edit Nama Mahasiswa' : mhs.nama_lengkap}
              </h1>
              <span
                className={`px-3 py-0.5 text-xs font-semibold rounded-full border ${
                  mhs.status_akademik === 'Aktif'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : mhs.status_akademik === 'DO'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {mhs.status_akademik}
              </span>
            </div>
            <p className='text-gray-500 font-mono text-sm mt-1 flex items-center gap-2'>
              <span>
                NIM: <strong className='text-gray-700'>{mhs.nim}</strong>
              </span>
              <span>•</span>
              <span>{mhs.program_studi}</span>
              <span>•</span>
              <span>Angkatan {mhs.angkatan}</span>
            </p>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <Link
            to={`${basePath}/Home`}
            className='px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-sm font-medium transition flex items-center gap-1.5'
          >
            ← Kembali ke Home
          </Link>

          {!isEditing ? (
            <button
              type='button'
              onClick={onEnterEditMode}
              className='px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer'
            >
              <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                />
              </svg>
              Ubah Data Mahasiswa
            </button>
          ) : (
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={onCancelEdit}
                className='px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition cursor-pointer'
              >
                ✕ Batal
              </button>
              <button
                type='button'
                onClick={onResetForm}
                disabled={detectedChanges.length === 0}
                className='px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-40 rounded-xl text-sm font-medium transition cursor-pointer'
                title='Reset isian ke data awal'
              >
                ↺ Reset
              </button>
              <button
                type='button'
                onClick={onSaveAll}
                disabled={saving}
                className='px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer'
              >
                <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                </svg>
                {saving ? 'Menyimpan...' : 'Simpan Semua'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bar Akses Administrator & Informasi Peringatan */}
      <div className='mt-5 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80'>
        <div className='flex items-center gap-2.5'>
          <span className='inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold'>
            🛡️
          </span>
          <div>
            <p className='font-semibold text-gray-800 flex items-center gap-2'>
              Otoritas Akses:{' '}
              {hasAdminAccess ? (
                <span className='text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full'>
                  Administrator Terverifikasi (Akses Penuh)
                </span>
              ) : (
                <span className='text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full'>
                  Hanya Lihat (Tamu / Mahasiswa)
                </span>
              )}
            </p>
            <p className='text-gray-500 mt-0.5'>
              {hasAdminAccess
                ? 'Sebagai Admin, Anda dapat memperbarui seluruh detail data mahasiswa termasuk bagian sensitif.'
                : 'Aktifkan mode admin untuk dapat mengubah detail informasi mahasiswa.'}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <label className='flex items-center gap-2 cursor-pointer select-none bg-white px-3 py-1.5 rounded-xl border border-gray-300 hover:border-gray-400 transition'>
            <input
              type='checkbox'
              checked={hasAdminAccess}
              onChange={(e) => onToggleAdmin(e.target.checked)}
              className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
            />
            <span className='text-xs font-semibold text-gray-700'>
              {hasAdminAccess ? 'Mode Admin: Aktif' : 'Simulasikan Akses Admin'}
            </span>
          </label>
        </div>
      </div>

      {/* Banner Saat Berada di Mode Edit */}
      {isEditing && (
        <div className='mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl text-amber-900 text-xs flex items-start gap-3'>
          <span className='text-base leading-none'>✏️</span>
          <div>
            <p className='font-bold text-sm text-amber-950'>Mode Pengeditan Aktif</p>
            <p className='mt-0.5 text-amber-800'>
              Anda sedang mengubah data mahasiswa. Terdapat{' '}
              <strong>{detectedChanges.length} perubahan</strong> yang terdeteksi. Setiap tombol simpan
              atau batal akan menampilkan modal peringatan terlebih dahulu.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
