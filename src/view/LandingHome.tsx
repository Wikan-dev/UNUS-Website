import gambar from '../assets/jpeg/universitas-harvard.jpeg'
import Pill from '../components/Pill.tsx';
import MasukLogo from '../assets/svg/Icon(2).svg'
import arrow from '../assets/svg/Container(13).svg'
import person from '../assets/svg/Icon(3).svg'
import verified from '../assets/svg/Icon(4).svg'
import achivement from '../assets/svg/Icon(5).svg'
import orang from '../assets/svg/Icon(6).svg'
import StatisticHome from '../components/StatisticHome.tsx'

interface PillListProps {
  image: string;
  text: string;
}

const pillList:PillListProps = [
  {
    image: verified,
    text: "QS Asia University #48"
  },
  {
    image: achivement,
    text: "ISO 21001:2018 Certified"
  },
  {
    image: orang,
    text: "120+ International Partners"
  },
]

export default function LandingHome() {
  return (
    <div>
      <header className="bg-background-home text-center py-5 border-b-10 border-white/90 backgrop-blur-md sticky">
        <h1 className='font-bold text-2xl'>UNIVERSITAS NUSANTARA</h1>
      </header>       
      <div className='px-10'>
        <section className='grid grid-cols-2 p-5 gap-10 mt-10'>
          <div className='flex flex-col gap-10 justify-center'>
            <Pill color={'#DEE9FF'} text={'TAHUN AKADEMIK 2024/2025 • AKREDITASI UNGGUL BAN-PT'} ballColor={"#FFA02C"} />
            <h1 className='font-bold text-6xl font-merrie'>Mencetak Generasi Pemimpin & Inovator Berwawasan Global</h1>
            <p className='text-2xl text-black/60'>Universitas Nusantara memadukan keunggulan akademik, riset mutakhir berstandar internasional, dan ekosistem digital terintegrasi untuk membentuk masa depan peradaban bangsa.</p>
            <div className='flex flex-row gap-10 font-bold text-lg cursor-pointer'>
              <button className='bg-primary-2 w-fit flex flex-row p-5 rounded-lg gap-3 drop-shadow-lg/30 hover:drop-shadow-xl hover:scale-110 transition-all duration-250'><img src={MasukLogo} />Masuk SIAKAD PORTAL<img src={arrow} /></button>
              <button className='bg-sidebar text-white w-fit flex flex-row p-5 rounded-lg gap-3 drop-shadow-lg/30 hover:drop-shadow-xl hover:scale-110 transition-all duration-250'><img src={person} />Daftar Mahasiswa Baru (PMB)</button>
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
          <div>
            <img src={gambar} className='mx-auto w-full rounded-2xl h-200 object-cover object-left' />
          </div>
        </section>
      </div>

      <StatisticHome />
    </div>
  )
}
