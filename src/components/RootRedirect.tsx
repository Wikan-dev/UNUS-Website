import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../helper/auth';

/**
 * RootRedirect — Halaman yang meng-handle akses ke `/`
 *
 * Jika user sudah login dan punya session_hash:
 *   -> Redirect ke /s/{session_hash}/Home
 *
 * Jika user belum login:
 *   -> Redirect ke /Login
 *
 * User biasa TIDAK boleh mengakses "/" langsung tanpa session hash.
 */
export default function RootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();

    if (user && user.session_hash) {
      // User sudah login -> arahkan ke halaman Home dalam session mereka
      navigate(`/s/${user.session_hash}/Home`, { replace: true });
    } else {
      // Belum login -> ke halaman Login
      navigate('/Login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <div className='text-center'>
        <div className='w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
        <p className='text-sm font-medium text-gray-500'>Mengalihkan...</p>
      </div>
    </div>
  );
}
