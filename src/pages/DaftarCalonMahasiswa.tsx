import { useEffect } from 'react';
import NoPendaftaran from '../helper/noPendaftaranFunction.tsx';
import { useCalonMahasiswaStore } from '../store/useCalonMahasiswaStore';

export default function CalonMahasiswa() {
  const {
    noPendaftaran, namaPendaftar, asalSekolah, statusDokumen,
    setNoPendaftaran, setNamaPendaftar, setAsalSekolah, setStatusDokumen,
    setIjazahFile, setKKFile,
    loading, error, sukses, submitPendaftaran,
  } = useCalonMahasiswaStore();

  // Isi otomatis no. pendaftaran saat halaman dibuka
  useEffect(() => {
    setNoPendaftaran(NoPendaftaran());
  }, [setNoPendaftaran]);

  return (
    <div>
      <form
        className='[&_input]:border flex flex-col gap-4 w-fit'
        onSubmit={(e) => {
          e.preventDefault(); // cegah reload halaman bawaan <form>
          submitPendaftaran();
        }}
      >
        <input
          placeholder='no. pendaftaran'
          value={noPendaftaran}
          onChange={(e) => setNoPendaftaran(e.target.value)}
        />
        <input
          placeholder='Nama Pendaftar'
          type='text'
          value={namaPendaftar}
          onChange={(e) => setNamaPendaftar(e.target.value)}
        />
        <input
          placeholder='Asal Sekolah'
          type='text'
          value={asalSekolah}
          onChange={(e) => setAsalSekolah(e.target.value)}
        />
        <input
          placeholder='ijazah'
          type='file'
          accept='image/*,application/pdf'
          onChange={(e) => setIjazahFile(e.target.files?.[0] ?? null)}
        />
        <input
          placeholder='kk'
          type='file'
          accept='image/*,application/pdf'
          onChange={(e) => setKKFile(e.target.files?.[0] ?? null)}
        />
        <input
          placeholder='status Dokumen'
          type='text'
          value={statusDokumen}
          onChange={(e) => setStatusDokumen(e.target.value)}
        />

        <button type='submit' disabled={loading}>
          {loading ? 'Mengirim...' : 'enter'}
        </button>
      </form>

      {error && <p className='text-red-500'>Error: {error}</p>}
      {sukses && <p className='text-green-600'>{sukses}</p>}
    </div>
  );
}
