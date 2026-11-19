import { useNavigate } from 'react-router-dom'

const chips = ['Akses cepat portal', 'Mobile friendly', 'Terintegrasi & tersinkron']

export default function CtaSection() {
  const navigate = useNavigate()
  return (
    <section className='bg-sidebar text-white rounded-3xl p-10 relative overflow-hidden'>
      <div className='absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary-2/20 blur-2xl' />
      <div className='absolute -left-10 bottom-0 w-48 h-48 rounded-full bg-background-home/10 blur-2xl' />
      <div className='relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6'>
        <div>
          <p className='text-xs font-bold tracking-widest uppercase text-primary-2'>⚙ Sistem Informasi Akademik Terpadu</p>
          <h1 className='font-bold text-3xl font-merrie mt-3'>Siap Memulai Aktivitas Perkuliahan?</h1>
          <p className='text-white/70 mt-2 max-w-xl'>Akses jadwal harian Anda, periksa rencana studi (KRS), pantau transkrip nilai real-time, atau lakukan presensi kuliah melalui Portal SIAKAD terpadu.</p>
          <div className='flex flex-wrap gap-2 mt-5'>
            {chips.map((c, i) => (
              <span key={i} className='text-xs bg-white/10 border border-white/15 px-3 py-1.5 rounded-full text-white/80'>{c}</span>
            ))}
          </div>
        </div>
        <div className='flex flex-col gap-3 shrink-0'>
          <button onClick={() => navigate('/Login')} className='bg-primary-2 text-white font-semibold px-7 py-3.5 rounded-xl hover:scale-105 transition-all duration-250 cursor-pointer shadow-lg shadow-primary-2/30'>Masuk ke SIAKAD Portal Sekarang →</button>
          <span className='text-[11px] text-white/50 text-center'>Enkripsi SSL 256-bit • Terpercaya SSD</span>
        </div>
      </div>
    </section>
  )
}
