import Pill from '../components/Pill.tsx'

const ic = 'w-7 h-7 stroke-current fill-none'
const penelitianList = [
  { judul: 'Kecerdasan Buatan & Data Science', isi: 'Riset machine learning, big data, dan penerapan AI untuk industri kreatif.', icon: <svg className={ic} strokeWidth={1.8} viewBox='0 0 24 24'><rect x='4' y='4' width='16' height='16' rx='3' /><path d='M9 9h.01M15 9h.01M9 15c.8.8 1.9 1.2 3 1.2s2.2-.4 3-1.2M2 9V6a2 2 0 012-2h3M22 9V6a2 2 0 00-2-2h-3M2 15v3a2 2 0 002 2h3M22 15v3a2 2 0 01-2 2h-3' /></svg> },
  { judul: 'Energi Terbarukan', isi: 'Pengembangan teknologi hijau, solar cell, dan bioenergi berkelanjutan.', icon: <svg className={ic} strokeWidth={1.8} viewBox='0 0 24 24'><path d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' /></svg> },
  { judul: 'Kesehatan Masyarakat', isi: 'Penelitian epidemiologi, gizi, dan kesehatan digital berbasis populasi.', icon: <svg className={ic} strokeWidth={1.8} viewBox='0 0 24 24'><path d='M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' /></svg> },
  { judul: 'Ekonomi Kreatif UMKM', isi: 'Kajian pemberdayaan UMKM, digitalisasi bisnis, dan kewirausahaan mahasiswa.', icon: <svg className={ic} strokeWidth={1.8} viewBox='0 0 24 24'><path d='M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg> },
]

export default function PenelitianSection() {
  return (
    <section id='penelitian' className='scroll-mt-24'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <Pill color={'#DEE9FF'} text={'PENELITIAN'} ballColor={'#FFA02C'} />
          <h1 className='font-bold text-4xl font-merrie mt-5'>Riset & Inovasi</h1>
          <p className='text-black/60 mt-2 max-w-3xl'>Himpunan peneliti Universitas Nusantara aktif menghasilkan publikasi dan inovasi berdampak bagi masyarakat.</p>
        </div>
        <a href='#berita' className='text-sm font-semibold text-sidebar hover:underline cursor-pointer'>Publikasi Terbaru →</a>
      </div>
      <div className='grid sm:grid-cols-2 gap-6 mt-8'>
        {penelitianList.map((p, i) => (
          <div key={i} className='rounded-2xl p-7 border border-white/60 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background-card to-background-home'>
            <div className='flex items-start justify-between'>
              <div className='w-14 h-14 rounded-xl bg-white text-sidebar flex items-center justify-center shadow-sm'>{p.icon}</div>
              <span className='text-[10px] font-bold text-sidebar bg-white px-2.5 py-1 rounded-full border border-black/5'>RISET {String(i + 1).padStart(2, '0')}</span>
            </div>
            <h2 className='font-bold text-xl font-merrie mt-4'>{p.judul}</h2>
            <p className='text-black/60 mt-2 text-sm'>{p.isi}</p>
            <button className='text-sm font-semibold text-sidebar mt-3 hover:underline cursor-pointer'>Lihat Karya Ilmiah →</button>
          </div>
        ))}
      </div>
    </section>
  )
}
