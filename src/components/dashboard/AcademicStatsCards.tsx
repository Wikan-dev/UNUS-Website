import type { ReactElement } from 'react';
import type { Mahasiswa } from '../../helper/types';
import type { StudentFormData } from '../../helper/dashboardTypes';

interface AcademicStatsCardsProps {
  mhs: Mahasiswa;
  formData: StudentFormData;
  isEditing: boolean;
}

export default function AcademicStatsCards({
  mhs,
  formData,
  isEditing,
}: AcademicStatsCardsProps): ReactElement {
  const currentProdi = isEditing ? formData.program_studi : mhs.program_studi;
  const currentAngkatan = isEditing ? formData.angkatan : mhs.angkatan;
  const currentStatus = isEditing ? formData.status_akademik : mhs.status_akademik;
  const currentDosenWali = isEditing ? formData.dosen_wali_nidn : mhs.dosen_wali_nidn;

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm'>
        <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>Program Studi</p>
        <p className='text-base font-bold text-gray-900 mt-1 truncate'>{currentProdi}</p>
        <span className='text-[11px] text-gray-500 mt-1 block'>Fakultas Teknologi Informasi</span>
      </div>

      <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm'>
        <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>Tahun Angkatan</p>
        <p className='text-base font-bold text-gray-900 mt-1'>{currentAngkatan}</p>
        <span className='text-[11px] text-gray-500 mt-1 block'>Kurikulum OBE Terpadu</span>
      </div>

      <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm'>
        <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>Status Keaktifan</p>
        <p className='mt-1'>
          <span
            className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-md ${
              currentStatus === 'Aktif'
                ? 'bg-emerald-100 text-emerald-800'
                : currentStatus === 'DO'
                ? 'bg-red-100 text-red-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {currentStatus}
          </span>
        </p>
        <span className='text-[11px] text-gray-500 mt-1 block'>Semester Genap 2024/2025</span>
      </div>

      <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm'>
        <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>Dosen Wali</p>
        <p className='text-base font-bold text-gray-900 mt-1 truncate'>
          {currentDosenWali || 'Belum Ditentukan'}
        </p>
        <span className='text-[11px] text-gray-500 mt-1 block'>NIDN Pembimbing Akademik</span>
      </div>
    </div>
  );
}
