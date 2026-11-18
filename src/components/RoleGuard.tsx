import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../helper/auth';
import { canAccessPage } from '../helper/rbac';
import { useSessionPath } from '../helper/useSessionPath';

interface RoleGuardProps {
  /** Nama halaman yang diproteksi (relativePath, misal 'Home', 'DaftarCalonMahasiswa') */
  page: string;
  children: React.ReactNode;
}

/**
 * RoleGuard — Komponen wrapper yang mengecek apakah user 
 * memiliki role yang diizinkan untuk mengakses halaman tertentu.
 *
 * Jika tidak diizinkan, tampilkan pesan "Akses Ditolak" dengan
 * tombol kembali.
 */
export default function RoleGuard({ page, children }: RoleGuardProps) {
  const user = getCurrentUser();
  const basePath = useSessionPath();

  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  if (!canAccessPage(user.role, page)) {
    return (
      <div className='flex items-center justify-center min-h-[70vh]'>
        <div className='text-center max-w-md mx-auto p-8'>
          {/* Icon gembok */}
          <div className='w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center'>
            <svg className='w-10 h-10 text-red-500' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
            </svg>
          </div>

          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
            Akses Ditolak
          </h2>
          <p className='text-gray-500 mb-2 text-sm'>
            Anda tidak memiliki hak akses untuk halaman ini.
          </p>
          <p className='text-gray-400 text-xs mb-6'>
            Role Anda: <span className='font-semibold text-gray-600'>{user.role || 'Tidak diketahui'}</span>
          </p>

          <a
            href={`${basePath}/HomePage`}
            className='inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition shadow-sm'
          >
            ← Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
