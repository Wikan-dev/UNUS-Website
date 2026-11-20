import { useNavigate } from 'react-router-dom'
import gambar from '../assets/jpeg/universitas-harvard.jpeg'
import gedung from '../assets/png/image-20261013-195851.png'
import Pill from '../components/Pill.tsx'
import MasukLogo from '../assets/svg/Icon(2).svg'
import arrow from '../assets/svg/Container(13).svg'
import person from '../assets/svg/Icon(3).svg'
import verified from '../assets/svg/Icon(4).svg'
import achivement from '../assets/svg/Icon(5).svg'
import orang from '../assets/svg/Icon(6).svg'
import cap from '../assets/svg/graduation-cap-svgrepo-com.svg'
import StatisticHome from '../components/StatisticHome.tsx'
import LandingShell from './LandingShell.tsx'
import LandingFooter from './LandingFooter.tsx'
import { getCurrentUser } from '../helper/auth'
import { useSessionPath } from '../helper/useSessionPath'

const trustPills = [
  { image: verified, text: 'QS Asia University #48' },
  { image: achivement, text: 'ISO 21001:2018 Certified' },
  { image: orang, text: '120+ International Partners' },
]

const layananList = [
  {
    judul: 'SIAKAD Pro Portal',
    deskripsi: 'Akses KRS online, jadwal kuliah terintegrasi, transkrip nilai real-time, dan presensi berbasis lokasi.',
    badge: 'Terpadu',
    highlight: true,
  },
  {
    judul: 'Penerimaan Mahasiswa Baru',
    deskripsi: 'Jalur SNBP, SNBT, dan Mandiri. Pendaftaran daring tanpa ribet dengan verifikasi dokumen instan.',
    badge: 'PMB 2024/2025',
  },
  {
    judul: 'E-Library & Riset Global',
    deskripsi: 'Akses jutaan jurnal internasional terindeks Scopus, Springer, repositori skripsi, dan basis data riset.',
    badge: 'Open Access',
  },
  {
    judul: 'Career Center & Inkubasi',
    deskripsi: 'Program magang bersertifikat MBKM, inkubator startup teknologi, dan koneksi ke lebih dari 100 mitra industri.',
    badge: 'Karir & Alumni',
  },
]

const prodiList = [
  { nama: 'Teknik Informatika', jenjang: 'S1', akreditasi: 'Unggul', fakultas: 'Fakultas Teknik', color: 'from-blue-900 to-indigo-800' },
  { nama: 'Sistem Informasi', jenjang: 'S1', akreditasi: 'Unggul', fakultas: 'Fakultas Teknik', color: 'from-slate-900 to-slate-800' },
  { nama: 'Manajemen Bisnis', jenjang: 'S1', akreditasi: 'Unggul', fakultas: 'Fakultas Ekonomi', color: 'from-amber-700 to-orange-600' },
  { nama: 'Akuntansi', jenjang: 'S1', akreditasi: 'Unggul', fakultas: 'Fakultas Ekonomi', color: 'from-emerald-900 to-teal-800' },
  { nama: 'Ilmu Komunikasi', jenjang: 'S1', akreditasi: 'Baik Sekali', fakultas: 'Fakultas Ilmu Sosial', color: 'from-rose-900 to-pink-800' },
  { nama: 'Kedokteran Gigi', jenjang: 'S1', akreditasi: 'Unggul', fakultas: 'Fakultas Kedokteran', color: 'from-cyan-900 to-blue-800' },
]

const kontakList = [
  { judul: 'Alamat Kampus', isi: 'Jl. Pendidikan No. 1, Gedung Rektorat, Nusantara, Jakarta Pusat 10110' },
  { judul: 'Telepon & Helpdesk', isi: '(021) 555-0198 • WhatsApp: 0812-3456-7890' },
  { judul: 'Email Resmi', isi: 'admisi@unus.ac.id • helpdesk@unus.ac.id' },
  { judul: 'Jam Layanan', isi: 'Senin - Jumat, 08.00 - 16.00 WIB (Sabtu-Minggu Tutup)' },
]

export default function LandingHome() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const basePath = useSessionPath()

  const handlePortalClick = () => {
    if (user) {
      navigate(`${basePath}/HomePage`)
    } else {
      navigate('/Login')
    }
  }

  const handlePmbClick = () => {
    if (user) {
      navigate(`${basePath}/DaftarCalonMahasiswa`)
    } else {
      navigate('/Login')
    }
  }

  return (
    <div className='min-h-screen bg-slate-50 text-gray-900 font-inter'>
      <LandingShell>
        {/* ── 1. HERO SECTION ── */}
        <section id='beranda' className='grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center scroll-mt-24'>
          {/* Sisi Kiri: Teks & Aksi */}
          <div className='flex flex-col gap-6 sm:gap-7'>
            <div>
              <Pill
                color='#DEE9FF'
                text='TAHUN AKADEMIK 2024/2025 • AKREDITASI UNGGUL BAN-PT'
                ballColor='#FFA02C'
              />
            </div>

            <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold font-merrie text-gray-900 leading-tight tracking-tight'>
              Mencetak Generasi Pemimpin & Inovator Berwawasan Global
            </h1>

            <p className='text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl'>
              Universitas Nusantara memadukan keunggulan akademik, riset mutakhir berstandar internasional,
              dan ekosistem digital terintegrasi untuk membentuk masa depan peradaban bangsa.
            </p>

            {/* Tombol Utama */}
            <div className='flex flex-col sm:flex-row gap-3.5 pt-1'>
              <button
                onClick={handlePortalClick}
                className='bg-primary-2 text-sidebar font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer text-sm sm:text-base'
              >
                <img src={MasukLogo} alt='' className='w-5 h-5' />
                <span>Masuk SIAKAD PORTAL</span>
                <img src={arrow} alt='' className='w-4 h-4' />
              </button>

              <button
                onClick={handlePmbClick}
                className='bg-sidebar text-white font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer text-sm sm:text-base'
              >
                <img src={person} alt='' className='w-5 h-5' />
                <span>Daftar Mahasiswa Baru (PMB)</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className='flex flex-wrap items-center gap-2 pt-2'>
              {trustPills.map((item, i) => (
                <div
                  key={i}
                  className='flex items-center gap-2 bg-white border border-gray-200/80 px-3.5 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-xs'
                >
                  <img src={item.image} alt='' className='w-4 h-4 shrink-0' />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sisi Kanan: Gambar Kampus */}
          <div className='relative'>
            <div className='overflow-hidden rounded-3xl shadow-xl border border-gray-200/80 bg-gray-100'>
              <img
                src={gambar}
                alt='Kampus Universitas Nusantara'
                className='w-full h-[320px] sm:h-[420px] lg:h-[460px] object-cover object-center hover:scale-105 transition-transform duration-700'
              />
            </div>

            {/* Floating Badge Rating */}
            <div className='absolute -bottom-4 left-4 sm:-bottom-5 sm:left-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl px-5 py-3.5 border border-gray-100 flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-sidebar text-primary-2 flex items-center justify-center font-bold text-lg'>
                ★
              </div>
              <div>
                <div className='text-xl sm:text-2xl font-bold font-merrie text-sidebar leading-none'>4,9 / 5.0</div>
                <div className='text-xs text-gray-500 mt-1'>Kepuasan Akademik & Layanan Kampus</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. STATISTIK KAMPUS ── */}
        <StatisticHome />

        {/* ── 3. LAYANAN & FASILITAS UNGGULAN ── */}
        <section id='layanan' className='scroll-mt-24 space-y-6'>
          <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-3'>
            <div>
              <p className='text-xs font-bold tracking-widest uppercase text-primary-2'>Ekosistem Terintegrasi</p>
              <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold font-merrie text-gray-900 mt-1'>
                Layanan & Fasilitas Kampus
              </h2>
            </div>
            <p className='text-xs sm:text-sm text-gray-500 max-w-md'>
              Didukung infrastruktur modern berbasis cloud dan konektivitas terpadu untuk kemudahan belajar mengajar.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
            {layananList.map((item, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between ${
                  item.highlight
                    ? 'bg-sidebar text-white border-sidebar shadow-md'
                    : 'bg-white border-gray-200/70 shadow-xs'
                }`}
              >
                <div>
                  <div className='flex items-center justify-between gap-2 mb-4'>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        item.highlight
                          ? 'bg-primary-2 text-sidebar font-extrabold'
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <h3 className={`text-lg font-bold font-merrie ${item.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {item.judul}
                  </h3>
                  <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${item.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.deskripsi}
                  </p>
                </div>

                <button
                  onClick={handlePortalClick}
                  className={`mt-6 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    item.highlight ? 'text-primary-2 hover:underline' : 'text-sidebar hover:text-blue-700'
                  }`}
                >
                  <span>Akses Fitur</span>
                  <span>→</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. PROGRAM STUDI PILIHAN ── */}
        <section id='program-studi' className='scroll-mt-24 space-y-6'>
          <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-3'>
            <div>
              <p className='text-xs font-bold tracking-widest uppercase text-primary-2'>Pilihan Masa Depan</p>
              <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold font-merrie text-gray-900 mt-1'>
                Program Studi Unggulan
              </h2>
            </div>
            <p className='text-xs sm:text-sm text-gray-500 max-w-md'>
              Kurikulum adaptif berbasis standar industri dan akreditasi BAN-PT berskala internasional.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {prodiList.map((prodi, i) => (
              <div
                key={i}
                className='bg-white rounded-2xl overflow-hidden border border-gray-200/70 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between'
              >
                <div>
                  <div className={`h-24 bg-gradient-to-r ${prodi.color} p-4 flex items-center justify-between text-white relative`}>
                    <img src={cap} alt='' className='w-10 h-10 opacity-30 drop-shadow' />
                    <span className='text-[10px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 px-2.5 py-1 rounded-full'>
                      Akreditasi {prodi.akreditasi}
                    </span>
                  </div>
                  <div className='p-5'>
                    <div className='text-xs font-medium text-gray-400'>{prodi.fakultas}</div>
                    <h3 className='text-lg font-bold font-merrie text-gray-900 mt-1'>{prodi.nama}</h3>
                    <div className='flex items-center gap-2 mt-3'>
                      <span className='text-[11px] font-semibold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-md'>
                        Jenjang {prodi.jenjang}
                      </span>
                      <span className='text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md'>
                        Reguler & Karyawan
                      </span>
                    </div>
                  </div>
                </div>

                <div className='p-5 pt-0'>
                  <button
                    onClick={handlePmbClick}
                    className='w-full py-2.5 text-xs font-semibold text-sidebar bg-slate-100 hover:bg-sidebar hover:text-white rounded-xl transition cursor-pointer text-center'
                  >
                    Daftar di Prodi Ini →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. TENTANG KAMPUS ── */}
        <section id='tentang' className='scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/70 shadow-xs'>
          <div className='space-y-5'>
            <div>
              <Pill color='#DEE9FF' text='TENTANG KAMI' ballColor='#FFA02C' />
            </div>
            <h2 className='text-2xl sm:text-3xl font-bold font-merrie text-gray-900 leading-tight'>
              Membangun Peradaban Lewat Pendidikan Berkualitas
            </h2>
            <p className='text-sm sm:text-base text-gray-600 leading-relaxed'>
              Berdiri sejak tahun 1987, Universitas Nusantara telah mencetak lebih dari 45.000 alumni
              yang kini berkarya di perusahaan multinasional, lembaga pemerintahan, dan technopreneur terkemuka.
            </p>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2'>
              <div className='p-4 rounded-xl bg-slate-50 border border-gray-100'>
                <div className='font-bold font-merrie text-sidebar text-base'>Visi</div>
                <p className='text-xs text-gray-600 mt-1 leading-relaxed'>
                  Menjadi perguruan tinggi berkelas dunia yang unggul dalam ilmu pengetahuan dan teknologi.
                </p>
              </div>
              <div className='p-4 rounded-xl bg-slate-50 border border-gray-100'>
                <div className='font-bold font-merrie text-sidebar text-base'>Misi</div>
                <p className='text-xs text-gray-600 mt-1 leading-relaxed'>
                  Menyelenggarakan tridharma perguruan tinggi berstandar internasional dan berjiwa kebangsaan.
                </p>
              </div>
            </div>
          </div>

          <div className='relative'>
            <img
              src={gedung}
              alt='Gedung Universitas Nusantara'
              className='w-full h-[300px] sm:h-[380px] object-cover rounded-2xl shadow-md border border-gray-100'
            />
            <div className='absolute bottom-4 left-4 right-4 bg-sidebar/95 backdrop-blur-md text-white p-4 rounded-xl shadow-lg flex items-center justify-between'>
              <div>
                <div className='text-xs text-primary-2 font-bold uppercase tracking-wider'>Berdiri Sejak</div>
                <div className='text-2xl font-bold font-merrie'>1987</div>
              </div>
              <div className='text-right text-xs text-gray-300 max-w-[200px]'>
                37+ Tahun Mengabdi Membangun Bangsa
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. KONTAK INFORMASI ── */}
        <section id='kontak' className='scroll-mt-24 space-y-6'>
          <div className='text-center max-w-xl mx-auto space-y-2'>
            <p className='text-xs font-bold tracking-widest uppercase text-primary-2'>Pusat Bantuan & Komunikasi</p>
            <h2 className='text-2xl sm:text-3xl font-bold font-merrie text-gray-900'>
              Hubungi Layanan Kami
            </h2>
            <p className='text-xs sm:text-sm text-gray-500'>
              Punya pertanyaan seputar PMB, beasiswa, atau SIAKAD? Tim layanan kami siap membantu.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5'>
            {kontakList.map((item, i) => (
              <div key={i} className='bg-white rounded-2xl p-5 border border-gray-200/70 shadow-xs'>
                <div className='w-8 h-8 rounded-lg bg-sidebar text-white font-bold text-xs flex items-center justify-center mb-3'>
                  0{i + 1}
                </div>
                <h3 className='font-bold text-sm font-merrie text-gray-900'>{item.judul}</h3>
                <p className='text-xs text-gray-600 mt-1.5 leading-relaxed'>{item.isi}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. CTA BANNER ── */}
        <section className='bg-gradient-to-br from-sidebar via-[#162a33] to-[#0A161A] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl'>
          <div className='absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary-2/20 blur-3xl pointer-events-none' />
          <div className='relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8'>
            <div className='max-w-xl space-y-3'>
              <span className='text-xs font-bold tracking-widest uppercase text-primary-2 bg-primary-2/15 border border-primary-2/30 px-3 py-1 rounded-full'>
                Penerimaan Mahasiswa Baru
              </span>
              <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold font-merrie leading-tight'>
                Mulai Perjalanan Akademikmu Bersama Universitas Nusantara
              </h2>
              <p className='text-sm text-gray-300 leading-relaxed'>
                Daftarkan dirimu sekarang secara daring atau login ke portal SIAKAD untuk mengelola seluruh perkuliahan.
              </p>
            </div>

            <div className='flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto'>
              <button
                onClick={handlePmbClick}
                className='bg-primary-2 text-sidebar font-bold px-7 py-3.5 rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer text-center text-sm'
              >
                Daftar PMB Sekarang →
              </button>
              <button
                onClick={handlePortalClick}
                className='bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition cursor-pointer text-center text-sm'
              >
                Masuk ke SIAKAD Portal
              </button>
            </div>
          </div>
        </section>
      </LandingShell>

      <LandingFooter />
    </div>
  )
}
