import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Mahasiswa } from '../helper/types.tsx';

export default function DashboardMahasiswa() {
  // useParams = "ambil isi semua :param dari URL"
  const { IDMahasiswa } = useParams();   // nama HARUS sama dengan di Route

  const [mhs, setMhs] = useState<Mahasiswa | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!IDMahasiswa) return;   // param kosong? jangan fetch.

    const ambil = async () => {
      try {
        // kirim hash-nya ke server lewat &h=
        const res = await fetch(`/api.php?endpoint=mahasiswa&h=${IDMahasiswa}`);
        if (res.status === 404) {
          setError('Profil tidak ditemukan');
          return;
        }
        if (!res.ok) throw new Error('Gagal memuat data');
        setMhs(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
    ambil();
  }, [IDMahasiswa]);   // ← selalu taruh param di dependency array!

  if (loading) return <p>Memuat...</p>;
  if (error)   return <p className='text-red-500'>{error}</p>;
  if (!mhs)    return null;

  return (
    <div className='p-5'>
      <h1>{mhs.nama_lengkap}</h1>
      <p>NIM: {mhs.nim} — {mhs.program_studi} — Angkatan {mhs.angkatan}</p>
      <Link to='/'>← kembali</Link>
    </div>
  );
}
