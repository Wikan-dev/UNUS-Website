const cols = [
  { judul: 'Fakultas', links: ['Fakultas Teknik & Rekayasa', 'Fakultas Ekonomi & Bisnis', 'Fakultas Ilmu Budaya & Humaniora', 'Fakultas Hukum & Kebijakan', 'Sekolah Pascasarjana'] },
  { judul: 'Layanan Akademik', links: ['Portal SIAKAD Dosen & Mahasiswa', 'Kalender Akademik 2024/2025', 'Repositori Kampus', 'Pusat Karir & Alumni', 'Jurnal Riset Terindeks'] },
  { judul: 'Tautan Eksternal', links: ['Kementerian Pendidikan Tinggi', 'Portal Ristekdikti Kemendikbud', 'PDDikti & Informasi Publik', 'Perpustakaan Nasional (WBS)', 'Hubungi Media Relasi'] },
]

export default function LandingFooter() {
  return (
    <footer className='bg-sidebar text-white mt-16'>
      <div className='max-w-7xl mx-auto px-6 lg:px-10 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10'>
        <div>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-white flex items-center justify-center text-sidebar font-bold'>UN</div>
            <div>
              <h1 className='font-bold font-merrie'>UNIVERSITAS NUSANTARA</h1>
              <p className='text-[10px] text-placeholder tracking-widest uppercase'>Akreditasi Unggul</p>
            </div>
          </div>
          <p className='text-sm text-white/60 mt-4 leading-relaxed'>Kampus Utama: Jl. Pendidikan No. 1, Nusantara, Indonesia. Gedung Rektorat Kampus Arjuna, Jakarta Pusat, 10110.</p>
          <p className='text-sm text-white/60 mt-2'>Telepon: (021) 555-0198 · Helpdesk: helpdesk.siap@unus.ac.id</p>
          <div className='flex gap-2 mt-4'>
            <span className='text-[11px] font-semibold bg-primary-2 px-3 py-1.5 rounded-full'>Akreditasi Unggul BAN-PT</span>
            <span className='text-[11px] font-semibold bg-white/10 px-3 py-1.5 rounded-full'>QS 5-Star</span>
          </div>
        </div>
        {cols.map((c, i) => (
          <div key={i}>
            <h2 className='font-bold text-sm tracking-widest uppercase text-primary-2'>{c.judul}</h2>
            <ul className='flex flex-col gap-2.5 mt-4'>
              {c.links.map((l, j) => (
                <li key={j}><a href='#beranda' className='text-sm text-white/60 hover:text-white transition cursor-pointer'>{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className='border-t border-white/10'>
        <div className='max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50'>
          <span>© 2024 Universitas Nusantara. Hak Cipta Dilindungi Undang-Undang.</span>
          <div className='flex gap-5'>
            <a href='#beranda' className='hover:text-white cursor-pointer'>Kebijakan Privasi</a>
            <a href='#beranda' className='hover:text-white cursor-pointer'>Syarat Layanan Portal</a>
            <a href='#beranda' className='hover:text-white cursor-pointer'>Peta Situs</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
