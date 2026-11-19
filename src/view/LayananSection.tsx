import Pill from '../components/Pill.tsx'

const ic = 'w-6 h-6 stroke-current fill-none'
const layanan = [
  { badge: 'Baru Saja', dark: true, judul: 'SIAKAD Pro Portal', isi: 'Akses seluruh layanan akademik (KRS), monitoring riset real-time, jadwal kuliah terintegrasi, dan presensi GPS.', cta: 'Buka Portal Mahasiswa & Dosen', icon: <svg className={ic} strokeWidth={1.8} viewBox='0 0 24 24'><rect x='3' y='3' width='7' height='7' rx='1.5' /><rect x='14' y='3' width='7' height='7' rx='1.5' /><rect x='3' y='14' width='7' height='7' rx='1.5' /><rect x='14' y='14' width='7' height='7' rx='1.5' /></svg> },
  { badge: 'Pendaftaran Dibuka', judul: 'Penerimaan Mahasiswa Baru', isi: 'Jalur SBMPTN, SNBP, dan Mandiri. Pendaftaran online tanpa ribet, verifikasi berkas via upload, dan simulasi beasiswa KIP.', cta: 'Daftar PMB Sekarang', icon: <svg className={ic} strokeWidth={1.8} viewBox='0 0 24 24'><path d='M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' /></svg> },
  { badge: 'Open Access', judul: 'Perpustakaan & Repositori', isi: 'Akses jutaan jurnal internasional, Springer, buku referensi mata kuliah, repositori skripsi, dan e-library cetak riset.', cta: 'Telusuri Koleksi', icon: <svg className={ic} strokeWidth={1.8} viewBox='0 0 24 24'><path d='M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.865 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25' /></svg> },
  { badge: 'Modul Baru', judul: 'LMS Nusantara E-Learning', isi: 'Platform pembelajaran daring interaktif: forum diskusi, kuis adaptif, upload tugas, video streaming, dan penilaian adaptif.', cta: 'Akses Kelas Virtual', icon: <svg className={ic} strokeWidth={1.8} viewBox='0 0 24 24'><rect x='2.5' y='4' width='19' height='13' rx='2' /><path d='M8 21h8M12 17v4' /></svg> },
  { badge: '43 Papers 2024', judul: 'Pusat Riset & Inovasi', isi: 'Fasilitas riset Artificial Intelligence, Green Energy, Kesehatan Masyarakat, Ekonomi Kreatif, hingga konsorsium riset.', cta: 'Lihat Karya Ilmiah', icon: <svg className={ic} strokeWidth={1.8} viewBox='0 0 24 24'><path d='M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5m-4.25-11.396c.251.023.501.05.75.082M5 14.5l-1.479-1.479A2.25 2.25 0 003 14.732V19.5A2.25 2.25 0 005.25 21.75h13.5A2.25 2.25 0 0021 19.5v-4.768a2.25 2.25 0 00-.659-1.591L19 14.5m-14 0L7.221 7.779A2.25 2.25 0 019 6.268h6a2.25 2.25 0 011.779 1.511L19 14.5' /></svg> },
  { badge: '50+ Mitra Kerja', judul: 'Career Center & Incubator', isi: 'Peluang magang bersertifikat (MBKM), inkubator startup mahasiswa, kelas industri, sertifikasi profesi, dan jaringan alumni.', cta: 'Kembangkan Industri', icon: <svg className={ic} strokeWidth={1.8} viewBox='0 0 24 24'><rect x='3' y='7' width='18' height='13' rx='2' /><path d='M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 12h18' /></svg> },
]

export default function LayananSection() {
  return (
    <section id='layanan' className='scroll-mt-24'>
      <p className='text-xs font-bold tracking-widest uppercase text-primary-2'>Infrastruktur Teknologi Terpadu</p>
      <div className='flex flex-wrap items-end justify-between gap-3 mt-2'>
        <div>
          <h1 className='font-bold text-4xl font-merrie'>Ekosistem Kampus & Layanan Terintegrasi</h1>
          <p className='text-black/60 mt-2'>Satu pintu akses untuk seluruh kebutuhan civitas akademika, calon mahasiswa, dan mitra riset industri.</p>
        </div>
        <a href='#beranda' className='text-sm font-semibold text-sidebar hover:underline cursor-pointer'>Semua Layanan Portal →</a>
      </div>
      <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
        {layanan.map((l, i) => (
          <div key={i} className={`rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${l.dark ? 'bg-sidebar text-white border-sidebar' : 'bg-background-card border-white/60'}`}>
            <div className='flex items-start justify-between gap-3'>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${l.dark ? 'bg-white/10 text-primary-2' : 'bg-background-home text-sidebar'}`}>{l.icon}</div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${l.dark ? 'bg-primary-2 text-white' : 'bg-white border border-black/10 text-black/60'}`}>{l.badge}</span>
            </div>
            <h2 className='font-bold text-xl font-merrie mt-4'>{l.judul}</h2>
            <p className={`text-sm mt-2 ${l.dark ? 'text-white/70' : 'text-black/60'}`}>{l.isi}</p>
            <button className={`mt-4 text-sm font-semibold cursor-pointer ${l.dark ? 'w-full bg-primary-2 text-white py-2.5 rounded-lg hover:scale-[1.02]' : 'text-sidebar hover:underline'} transition-all`}>{l.cta} →</button>
          </div>
        ))}
      </div>
      <div className='mt-8'><Pill color={'#DEE9FF'} text={'99,9% UPTIME SIAKAD • SSL 256-BIT TERENKRIPSI'} ballColor={'#FFA02C'} /></div>
    </section>
  )
}
