import Pill from '../components/Pill.tsx'
import gedung from '../assets/png/image-20261013-195851.png'

const nilaiList = [
  { judul: 'Visi', isi: 'Menjadi universitas unggul dan terpercaya dalam mencetak pemimpin berwawasan global.' },
  { judul: 'Misi', isi: 'Menyelenggarakan pendidikan, riset, dan pengabdian masyarakat berstandar internasional.' },
  { judul: 'Nilai', isi: 'Integritas, kolaborasi, inovasi, dan keberlanjutan menjadi fondasi setiap aktivitas kampus.' },
]

export default function TentangSection() {
  return (
    <section id='tentang' className='scroll-mt-24'>
      <div className='grid lg:grid-cols-2 gap-10 items-center'>
        <div>
          <Pill color={'#DEE9FF'} text={'TENTANG KAMI'} ballColor={'#FFA02C'} />
          <h1 className='font-bold text-4xl font-merrie mt-5'>Universitas Nusantara</h1>
          <p className='text-lg text-black/60 mt-3'>Berdiri sejak 1987, Universitas Nusantara terus berkembang menjadi perguruan tinggi dengan lebih dari 38.000 mahasiswa dan ribuan alumni yang berkontribusi di berbagai bidang.</p>
          <div className='flex flex-col gap-4 mt-6'>
            {nilaiList.map((n, i) => (
              <div key={i} className='bg-background-card rounded-2xl p-5 border border-white/60 flex gap-4 items-start'>
                <div className='w-10 h-10 shrink-0 rounded-lg bg-sidebar text-white font-bold font-merrie flex items-center justify-center'>{n.judul[0]}</div>
                <div>
                  <h2 className='font-bold text-lg font-merrie'>{n.judul}</h2>
                  <p className='text-sm text-black/60 mt-1'>{n.isi}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='relative'>
          <img src={gedung} alt='Kampus Universitas Nusantara' className='w-full rounded-2xl h-140 object-cover shadow-lg' />
          <div className='absolute -bottom-6 left-6 right-6 bg-sidebar text-white rounded-2xl p-5 shadow-xl flex items-center gap-4'>
            <div className='text-4xl font-bold font-merrie text-primary-2'>1987</div>
            <div className='text-sm text-white/70'>Berdiri dan terus tumbuh menjadi kampus berstandar internasional dengan akreditasi <span className='text-white font-semibold'>Unggul</span> BAN-PT.</div>
          </div>
        </div>
      </div>
    </section>
  )
}
