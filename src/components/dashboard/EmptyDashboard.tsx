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

  return (
    <div className='p-6 md:p-10 w-full max-w-5xl mx-auto'>
      <div className='bg-white p-8 rounded-3xl shadow-sm border border-gray-200 text-center max-w-xl mx-auto mt-6'>
        <div className='w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm'>
          <svg className='w-8 h-8' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
            />
          </svg>
        </div>
        <h2 className='text-2xl font-bold font-merrie text-gray-800 mb-2'>Pusat Dashboard Mahasiswa</h2>
        <p className='text-gray-500 text-sm mb-6 leading-relaxed'>
          Pilih salah satu mahasiswa dari daftar di bawah ini atau melalui halaman Home untuk melihat profil dan mengelola seluruh detail akademik.
        </p>

        {/* Quick Select Dropdown */}
        {allStudents.length > 0 && (
          <div className='mb-6 text-left bg-gray-50 p-4 rounded-2xl border border-gray-200'>
            <label className='block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2'>
              Pilih Mahasiswa Langsung:
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  navigate(`${basePath}/DashBoardMahasiswa/${e.target.value}`);
                }
              }}
              defaultValue=''
              className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-blue-600 focus:outline-none'
            >
              <option value='' disabled>
                -- Pilih Mahasiswa ({allStudents.length} terdaftar) --
              </option>
              {allStudents.map((item) => (
                <option key={item.nim} value={item.hash_profil}>
                  {item.nim} - {item.nama_lengkap} ({item.program_studi})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className='flex justify-center gap-3'>
          <Link
            to={`${basePath}/Home`}
            className='inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm shadow-sm'
          >
            ← Buka Halaman Utama (Home)
          </Link>
        </div>
      </div>
    </div>
  );
}
