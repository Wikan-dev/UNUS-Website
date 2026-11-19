import Pill from '../components/Pill.tsx'
import cap from '../assets/svg/graduation-cap-svgrepo-com.svg'

const grads = ['from-sidebar to-gray-700', 'from-primary-2 to-orange-400', 'from-[#1e3a8a] to-blue-500', 'from-[#065f46] to-emerald-500', 'from-[#4c1d95] to-violet-500', 'from-[#9f1239] to-rose-500', 'from-[#0e7490] to-cyan-500', 'from-[#374151] to-gray-500']
const prodiList = [
  { nama: 'Teknik Informatika', fakultas: 'Fakultas Teknik', jenjang: 'S1', akreditasi: 'Unggul' },
  { nama: 'Sistem Informasi', fakultas: 'Fakultas Teknik', jenjang: 'S1', akreditasi: 'Unggul' },
  { nama: 'Manajemen', fakultas: 'Fakultas Ekonomi & Bisnis', jenjang: 'S1', akreditasi: 'Baik Sekali' },
  { nama: 'Akuntansi', fakultas: 'Fakultas Ekonomi & Bisnis', jenjang: 'S1', akreditasi: 'Unggul' },
  { nama: 'Hukum', fakultas: 'Fakultas Hukum', jenjang: 'S1', akreditasi: 'Baik Sekali' },
  { nama: 'Pendidikan Guru SD', fakultas: 'Fakultas Keguruan & Ilmu Pendidikan', jenjang: 'S1', akreditasi: 'Unggul' },
  { nama: 'Ilmu Komunikasi', fakultas: 'Fakultas Ilmu Sosial & Politik', jenjang: 'S1', akreditasi: 'Baik Sekali' },
  { nama: 'Kedokteran Gigi', fakultas: 'Fakultas Kedokteran Gigi', jenjang: 'S1', akreditasi: 'Unggul' },
]

export default function ProgramStudiSection() {
  return (
    <section id='program-studi' className='scroll-mt-24'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <p className='text-xs font-bold tracking-widest uppercase text-primary-2'>Fakultas & Program Studi</p>
          <h1 className='font-bold text-4xl font-merrie mt-2'>Fakultas Unggulan</h1>
          <p className='text-black/60 mt-2 max-w-3xl'>Kurikulum berbasis standar internasional yang berorientasi pada pemecahan tantangan masa depan.</p>
        </div>
        <a href='#akademik' className='text-sm font-semibold text-sidebar hover:underline cursor-pointer'>Unduh Buku Panduan Akademik ⬇</a>
      </div>
      <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8'>
        {prodiList.map((p, i) => (
          <div key={i} className='bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300'>
            <div className={`h-32 bg-gradient-to-br ${grads[i % grads.length]} relative flex items-center justify-center`}>
              <img src={cap} alt='' className='w-16 h-16 opacity-90 drop-shadow-lg' />
              <span className='absolute top-3 left-3 text-[10px] font-bold bg-white/95 text-sidebar px-2.5 py-1 rounded-full'>Akreditasi {p.akreditasi}</span>
            </div>
            <div className='p-5'>
              <h2 className='font-bold text-lg font-merrie leading-snug'>{p.nama}</h2>
              <p className='text-xs text-black/50 mt-1'>{p.fakultas}</p>
              <div className='flex flex-wrap gap-1.5 mt-3'>
                <span className='text-[11px] font-semibold bg-background-home text-sidebar px-2.5 py-1 rounded-full'>{p.jenjang}</span>
                <span className='text-[11px] font-semibold bg-background-home text-sidebar px-2.5 py-1 rounded-full'>Terakreditasi</span>
              </div>
              <button className='text-xs font-bold text-primary-2 mt-4 hover:underline cursor-pointer'>Rencana Kurikulum & Dosen →</button>
            </div>
          </div>
        ))}
      </div>
      <div className='mt-8'><Pill color={'#DEE9FF'} text={'14 FAKULTAS • 72 PROGRAM STUDI • 100% TERAKREDITASI'} ballColor={'#FFA02C'} /></div>
    </section>
  )
}
