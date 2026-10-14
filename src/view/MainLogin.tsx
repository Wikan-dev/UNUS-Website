import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../helper/auth';

export default function MainLogin() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async(e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Username dan password wajib diisi');
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await registerUser(email.trim(), password);
      } else {
        await loginUser(email.trim(), password);
      }
      // Berhasil -> alihkan ke landing page / dashboard
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen px-8 py-12'>
      <div className='w-full max-w-md p-8 bg-white border border-gray-100 shadow-xl rounded-2xl'>
        {/* Header Form */}
        <div className='mb-6 text-center'>
          <h2 className='text-2xl font-bold text-gray-800 font-merrie'>
            {isRegister ? 'Buat Akun Baru' : 'Masuk ke SIAKAD'}
          </h2>
          <p className='mt-1 text-sm text-gray-500'>
            {isRegister
              ? 'Daftarkan kredensial akademik Anda'
              : 'Gunakan username dan password terdaftar'}
          </p>
        </div>

        {/* Alert Error */}
        {error && (
          <div className='p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50'>
            {error}
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div>
            <label className='block mb-1 text-xs font-semibold tracking-wider text-gray-600 uppercase'>
              Email
            </label>
            <input
              type='text'
              value={email}
              onChange={(e:string) => setEmail(e.target.value)}
              placeholder='contoh: admin'
              autoComplete='username'
              className='w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition'
            />
          </div>

          <div>
            <label className='block mb-1 text-xs font-semibold tracking-wider text-gray-600 uppercase'>
              Password
            </label>
            <input
              type='password'
              value={password}
              onChange={(e:string) => setPassword(e.target.value)}
              placeholder='••••••••'
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className='w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition'
            />
          </div>

          {isRegister && (
            <div>
              <label className='block mb-1 text-xs font-semibold tracking-wider text-gray-600 uppercase'>
                Ulangi Password
              </label>
              <input
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='••••••••'
                autoComplete='new-password'
                className='w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition'
              />
            </div>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full py-2.5 mt-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition shadow-md'
          >
            {loading
              ? 'Memproses...'
              : isRegister
              ? 'Daftar Sekarang'
              : 'Masuk'}
          </button>
        </form>

        {/* Switch Mode Login / Register */}
        <div className='pt-6 mt-6 text-sm text-center border-t border-gray-100'>
          {isRegister ? (
            <p className='text-gray-600'>
              Sudah punya akun?{' '}
              <button
                type='button'
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className='font-semibold text-blue-600 hover:underline'
              >
                Masuk di sini
              </button>
            </p>
          ) : (
            <p className='text-gray-600'>
              Belum punya akun?{' '}
              <button
                type='button'
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
                className='font-semibold text-blue-600 hover:underline'
              >
                Daftar sekarang
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
