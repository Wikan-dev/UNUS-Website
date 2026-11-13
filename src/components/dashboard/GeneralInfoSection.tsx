import type { ReactElement } from 'react';
import type { Mahasiswa } from '../../helper/types';
import type { StudentFormData } from '../../helper/dashboardTypes';
import { PRODI_OPTIONS } from '../../helper/dashboardConstants';

interface GeneralInfoSectionProps {
  mhs: Mahasiswa;
  formData: StudentFormData;
  isEditing: boolean;
  onFormChange: (updated: Partial<StudentFormData>) => void;
}

export default function GeneralInfoSection({
  mhs,
  formData,
  isEditing,
  onFormChange,
}: GeneralInfoSectionProps): ReactElement {
  return (
    <section className='bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden'>
      {/* Header Section 1 */}
      <div className='p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-2'>
        <div>
          <div className='flex items-center gap-2'>
            <span className='px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-blue-100 text-blue-700'>
              Section 1
            </span>
            <h2 className='text-lg font-bold text-gray-900 font-merrie'>
              Data Identitas & Informasi Akademik Umum
            </h2>
          </div>
          <p className='text-xs text-gray-500 mt-1'>
            Informasi data mahasiswa reguler yang dapat diperbarui secara rutin (Nama, Program Studi, Angkatan, dan Pembimbing).
          </p>
        </div>
        <span className='text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full w-fit'>
          ● Tingkat Risiko: Standar
        </span>
      </div>

      {/* Konten Field-field Section 1 */}
      <div className='p-6 md:p-8 space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Field: Nama Lengkap */}
          <div>
            <label className='block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2'>
              Nama Lengkap Mahasiswa <span className='text-red-500'>*</span>
            </label>
            {isEditing ? (
              <div>
                <input
                  type='text'
                  value={formData.nama_lengkap}
                  onChange={(e) => onFormChange({ nama_lengkap: e.target.value })}
                  placeholder='Masukkan nama lengkap mahasiswa'
                  className='w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition'
                />
                <p className='text-[11px] text-gray-400 mt-1'>Sesuai dengan ijazah terakhir / KTP resmi.</p>
              </div>
            ) : (
              <div className='p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900'>
                {mhs.nama_lengkap}
              </div>
            )}
          </div>

          {/* Field: Program Studi */}
          <div>
            <label className='block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2'>
              Program Studi <span className='text-red-500'>*</span>
            </label>
            {isEditing ? (
              <div>
                <select
                  value={formData.program_studi}
                  onChange={(e) => onFormChange({ program_studi: e.target.value })}
                  className='w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition'
                >
                  {PRODI_OPTIONS.map((prodi) => (
                    <option key={prodi} value={prodi}>
                      {prodi}
                    </option>
                  ))}
                  {!PRODI_OPTIONS.includes(formData.program_studi) && formData.program_studi && (
                    <option value={formData.program_studi}>{formData.program_studi}</option>
                  )}
                </select>
                <p className='text-[11px] text-gray-400 mt-1'>Program studi terdaftar di Fakultas.</p>
              </div>
            ) : (
              <div className='p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900'>
                {mhs.program_studi}
              </div>
            )}
          </div>

          {/* Field: Tahun Angkatan */}
          <div>
            <label className='block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2'>
              Tahun Angkatan Masuk <span className='text-red-500'>*</span>
            </label>
            {isEditing ? (
              <div>
                <input
                  type='number'
                  min='2000'
                  max='2035'
                  value={formData.angkatan}
                  onChange={(e) => onFormChange({ angkatan: Number(e.target.value) })}
                  className='w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition'
                />
                <p className='text-[11px] text-gray-400 mt-1'>Tahun registrasi awal mahasiswa di UNUS.</p>
              </div>
            ) : (
              <div className='p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900'>
                {mhs.angkatan}
              </div>
            )}
          </div>

          {/* Field: Dosen Wali (NIDN) */}
          <div>
            <label className='block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2'>
              NIDN Dosen Wali / Pembimbing
            </label>
            {isEditing ? (
              <div>
                <input
                  type='text'
                  value={formData.dosen_wali_nidn}
                  onChange={(e) => onFormChange({ dosen_wali_nidn: e.target.value })}
                  placeholder='Contoh: 0412038901 (opsional)'
                  className='w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition'
                />
                <p className='text-[11px] text-gray-400 mt-1'>Kosongkan jika mahasiswa belum memiliki dosen wali.</p>
              </div>
            ) : (
              <div className='p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900'>
                {mhs.dosen_wali_nidn || <span className='text-gray-400 italic'>Belum ditentukan</span>}
              </div>
            )}
          </div>

          {/* Field: Email Akun Mahasiswa */}
          <div className='md:col-span-2'>
            <label className='block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2'>
              Email Akun SIAKAD Terhubung
            </label>
            {isEditing ? (
              <div>
                <input
                  type='email'
                  value={formData.user_email}
                  onChange={(e) => onFormChange({ user_email: e.target.value })}
                  placeholder='nama@email.com'
                  className='w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition'
                />
                <p className='text-[11px] text-gray-400 mt-1'>
                  Email yang digunakan mahasiswa untuk login ke portal SIAKAD.
                </p>
              </div>
            ) : (
              <div className='p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 flex items-center justify-between'>
                <span>{mhs.user_email || <span className='text-gray-400 italic'>Tidak ada email terhubung</span>}</span>
                <span className='text-[11px] text-gray-400'>ID User: {mhs.id_user || '-'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
