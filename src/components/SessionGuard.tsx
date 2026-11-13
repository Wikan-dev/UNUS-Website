import { useEffect, useState } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { getCurrentUser, verifySessionHash, logoutUser } from '../helper/auth';

/**
 * SessionGuard — Komponen layout yang memverifikasi session_hash di URL.
 *
 * Semua route yang dilindungi harus berada di bawah path `/s/:sessionHash/...`
 * Guard ini akan:
 * 1. Mengecek apakah user sudah login (ada di localStorage)
 * 2. Mengecek apakah session_hash di URL cocok dengan session_hash user
 * 3. Memverifikasi ke backend bahwa session masih valid
 * 4. Jika gagal, redirect ke halaman login
 */
export default function SessionGuard() {
  const { sessionHash } = useParams<{ sessionHash: string }>();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const user = getCurrentUser();

      // Tidak ada user di localStorage -> redirect ke login
      if (!user) {
        logoutUser();
        navigate('/Login', { replace: true });
        return;
      }

      // Session hash di URL tidak cocok dengan yang tersimpan
      if (!sessionHash || user.session_hash !== sessionHash) {
        logoutUser();
        navigate('/Login', { replace: true });
        return;
      }

      // Verifikasi ke backend
      const isValid = await verifySessionHash(sessionHash);
      if (!isValid) {
        // Session sudah tidak valid (mungkin login dari perangkat lain)
        logoutUser();
        navigate('/Login', { replace: true });
        return;
      }

      setVerified(true);
      setChecking(false);
    };

    checkSession();
  }, [sessionHash, navigate]);

  if (checking && !verified) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='text-center'>
          <div className='w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-sm font-medium text-gray-500'>Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  if (!verified) return null;

  return <Outlet />;
}
