import Pill from '../components/Pill.tsx'

const kontakList = [
  { judul: 'Alamat', isi: 'Jl. Pendidikan No. 1, Nusantara, Indonesia' },
  { judul: 'Telepon', isi: '(021) 555-0198' },
  { judul: 'Email', isi: 'info@unus.ac.id' },
  { judul: 'Jam Layanan', isi: 'Senin - Jumat, 08.00 - 16.00 WIB' },
]

export default function KontakSection() {
  return (
    <section id='kontak' className='scroll-mt-24'>
      <Pill color={'#DEE9FF'} text={'KONTAK'} ballColor={'#FFA02C'} />
      <h1 className='font-bold text-5xl font-merrie mt-6'>Hubungi Kami</h1>
      <p className='text-xl text-black/60 mt-4 max-w-3xl'>Punya pertanyaan seputar pendaftaran, program studi, atau kerja sama? Kami siap membantu.</p>
      <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10'>
        {kontakList.map((k, i) => (
          <div key={i} className='bg-background-card rounded-2xl p-7 border border-white/60 shadow-sm'>
            <div className='w-10 h-10 rounded-lg bg-sidebar text-white font-bold flex items-center justify-center'>{i + 1}</div>
            <h2 className='font-bold text-lg font-merrie mt-4'>{k.judul}</h2>
            <p className='text-black/60 mt-1'>{k.isi}</p>
          </div>
        ))}
      </div>
      <div className='bg-sidebar text-white rounded-2xl p-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4'>
        <div>
          <h2 className='font-bold text-2xl font-merrie'>Siap bergabung bersama kami?</h2>
          <p className='text-white/70 mt-1'>Daftarkan dirimu melalui PMB Universitas Nusantara.</p>
        </div>
        <button className='bg-primary-2 text-white font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-all duration-250 cursor-pointer'>Daftar PMB Sekarang</button>
      </div>
    </section>
  )
}
