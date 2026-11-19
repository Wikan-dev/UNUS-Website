import Pill from '../components/Pill.tsx'
import news1 from '../assets/png/image-20261013-195851.png'
import news2 from '../assets/jpeg/universitas-harvard.jpeg'

const beritaList = [
  { img: news1, tag: 'Prestasi Dunia', date: '14 Oktober 2024', judul: 'Mahasiswa Informatika Universitas Nusantara Raih Medali di International AI Hackathon 2024', isi: 'Tim "Nusantara Neural" berhasil meraih medali emas pada kompetisi AI tingkat universitas di Tokyo, mengungguli 120 peserta dari berbagai negara.' },
  { img: news2, tag: 'Riset & Inovasi', date: '09 Oktober 2024', judul: 'Simposium Internasional Perubahan Klimas & Hilirisasi Energi Terbarukan', isi: 'Simposium tahunan mempertemukan peneliti lintas benua untuk mempresentasikan riset transformasi energi berkelanjutan.' },
]

const agendaList = [
  { d: '12', m: 'OKT', judul: 'Jadwal Pengisian KRS Semester Ganjil', isi: 'SIAKAD dibuka untuk seluruh mahasiswa aktif 2024-2025.' },
  { d: '14', m: 'OKT', judul: 'Kuliah Perdana Semester 2024/1', isi: 'Awal masa studi tatap muka & pengambilan kelas.' },
  { d: '21', m: 'OKT', judul: 'Ujian Tengah Semester (UTS)', isi: 'Pekan pertama UTS mendatang di gedung terpadu.' },
]

export default function BeritaSection() {
  return (
    <section id='berita' className='scroll-mt-24'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <p className='text-xs font-bold tracking-widest uppercase text-primary-2'>Warta & Jadwal Penting</p>
          <h1 className='font-bold text-4xl font-merrie mt-2'>Kabar Nusantara Terkini</h1>
        </div>
        <a href='#beranda' className='text-sm font-semibold text-sidebar hover:underline cursor-pointer'>Arsip Berita & Rilis Media →</a>
      </div>
      <div className='grid lg:grid-cols-3 gap-6 mt-8'>
        <div className='lg:col-span-2 grid sm:grid-cols-2 gap-6'>
          {beritaList.map((b, i) => (
            <article key={i} className='bg-background-card rounded-2xl overflow-hidden border border-white/60 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300'>
              <img src={b.img} alt={b.judul} className='w-full h-44 object-cover' />
              <div className='p-5'>
                <div className='flex items-center gap-2 text-xs'>
                  <span className='bg-primary-2 text-white font-bold px-2.5 py-1 rounded-full'>{b.tag}</span>
                  <span className='text-black/50'>{b.date}</span>
                </div>
                <h2 className='font-bold font-merrie mt-3 leading-snug'>{b.judul}</h2>
                <p className='text-sm text-black/60 mt-2'>{b.isi}</p>
                <button className='text-sm font-semibold text-sidebar mt-3 hover:underline cursor-pointer'>Baca Selengkapnya →</button>
              </div>
            </article>
          ))}
        </div>
        <div className='bg-white rounded-2xl border border-black/5 shadow-sm p-6 h-fit'>
          <div className='flex items-center justify-between'>
            <h2 className='font-bold text-xl font-merrie'>Kalender & Agenda Penting</h2>
            <span className='text-2xl'>📅</span>
          </div>
          <div className='flex flex-col gap-4 mt-5'>
            {agendaList.map((a, i) => (
              <div key={i} className='flex gap-4 items-start'>
                <div className='w-12 shrink-0 text-center bg-background-home rounded-lg overflow-hidden'>
                  <div className='bg-sidebar text-white text-[10px] font-bold py-0.5'>{a.m}</div>
                  <div className='font-bold text-lg py-1'>{a.d}</div>
                </div>
                <div>
                  <h3 className='font-semibold text-sm leading-snug'>{a.judul}</h3>
                  <p className='text-xs text-black/50 mt-1'>{a.isi}</p>
                </div>
              </div>
            ))}
          </div>
          <button className='w-full mt-5 text-sm font-semibold text-sidebar border border-sidebar/20 rounded-xl py-2.5 hover:bg-background-home transition cursor-pointer'>Buka Kalender Akademik Lengkap →</button>
        </div>
      </div>
      <div className='mt-8'><Pill color={'#DEE9FF'} text={'UPDATE SETIAP HARI • 24/7 INFORMASI AKADEMIK'} ballColor={'#FFA02C'} /></div>
    </section>
  )
}
