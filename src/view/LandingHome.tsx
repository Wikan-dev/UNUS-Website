import { useNavigate } from 'react-router-dom'
import gambar from '../assets/jpeg/universitas-harvard.jpeg'
import heroDecor from '../assets/hero.png'
import Pill from '../components/Pill.tsx'
import MasukLogo from '../assets/svg/Icon(2).svg'
import arrow from '../assets/svg/Container(13).svg'
import person from '../assets/svg/Icon(3).svg'
import verified from '../assets/svg/Icon(4).svg'
import achivement from '../assets/svg/Icon(5).svg'
import orang from '../assets/svg/Icon(6).svg'
import StatisticHome from '../components/StatisticHome.tsx'
import LandingShell from './LandingShell.tsx'
import LayananSection from './LayananSection.tsx'
import ProgramStudiSection from './ProgramStudiSection.tsx'
import AkademikSection from './AkademikSection.tsx'
import PenelitianSection from './PenelitianSection.tsx'
import TentangSection from './TentangSection.tsx'
import BeritaSection from './BeritaSection.tsx'
import KontakSection from './KontakSection.tsx'
import CtaSection from './CtaSection.tsx'
import LandingFooter from './LandingFooter.tsx'

const pillList = [
  { image: verified, text: 'QS Asia University #48' },
  { image: achivement, text: 'ISO 21001:2018 Certified' },
  { image: orang, text: '120+ International Partners' },
]

export default function LandingHome() {
  const navigate = useNavigate()

  return (
    <div>
      <LandingShell>
        <section id='beranda' className='grid grid-cols-2 p-5 gap-10 scroll-mt-24 relative'>
          <img src={heroDecor} alt='' className='absolute -top-4 left-1/3 w-40 opacity-60 pointer-events-none hidden xl:block' />
          <div className='flex flex-col gap-10 justify-center'>
            <Pill color={'#DEE9FF'} text={'TAHUN AKADEMIK 2024/2025 • AKREDITASI UNGGUL BAN-PT'} ballColor={'#FFA02C'} />
            <h1 className='font-bold text-6xl font-merrie'>Mencetak Generasi Pemimpin & Inovator Berwawasan Global</h1>
            <p className='text-2xl text-black/60'>Universitas Nusantara memadukan keunggulan akademik, riset mutakhir berstandar internasional, dan ekosistem digital terintegrasi untuk membentuk masa depan peradaban bangsa.</p>
            <div className='flex flex-row gap-10 font-bold text-lg cursor-pointer'>
              <button onClick={() => navigate('/Login')} className='bg-primary-2 w-fit flex flex-row p-5 rounded-lg gap-3 drop-shadow-lg/30 hover:drop-shadow-xl hover:scale-110 transition-all duration-250'><img src={MasukLogo} />Masuk SIAKAD PORTAL<img src={arrow} /></button>
              <button onClick={() => navigate('/Login')} className='bg-sidebar text-white w-fit flex flex-row p-5 rounded-lg gap-3 drop-shadow-lg/30 hover:drop-shadow-xl hover:scale-110 transition-all duration-250'><img src={person} />Daftar Mahasiswa Baru (PMB)</button>
            </div>
            <div className='flex flex-row gap-2'>
              {pillList.map((list, i) => (
                <div key={i} className='flex flex-row items-center bg-gray-200 w-fit p-2 px-4 gap-3 rounded-full'>
                  <img src={list.image} className='w-5 h-5' />
                  <h1>{list.text}</h1>
                </div>
              ))}
            </div>
          </div>
          <div className='relative'>
            <img src={gambar} className='mx-auto w-full rounded-2xl h-200 object-cover object-left' />
            <div className='absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl px-5 py-4 border border-black/5 hidden lg:block'>
              <div className='text-3xl font-bold font-merrie text-sidebar'>4,9/5</div>
              <div className='text-xs text-black/50'>Rating kepuasan mahasiswa</div>
            </div>
          </div>
        </section>

        <div className='mt-16 flex flex-col gap-20'>
          <StatisticHome />
          <LayananSection />
          <ProgramStudiSection />
          <AkademikSection />
          <PenelitianSection />
          <TentangSection />
          <BeritaSection />
          <KontakSection />
          <CtaSection />
        </div>
      </LandingShell>
      <LandingFooter />
    </div>
  )
}
