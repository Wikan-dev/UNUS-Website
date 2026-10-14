import fotoBG from '../assets/png/image-20261013-195851.png';
import mainlogo from '../assets/svg/Universitas Nusantara Academic Seal.svg'
import MainLogin from '../view/MainLogin.tsx';

export default function Login() {
  return (
    <div className='grid grid-cols-2'>
      <div className='flex flex-col'>
        <div className='relative'>
          <div className='flex flex-row absolute z-10 items-center'>
            <img src={mainlogo} className='m-10 z-10 bg-black/30 rounded-4xl p-5 w-25' />
            <div className='flex flex-col'>
              <h1 className='text-white font-merrie font-bold text-3xl'>UNIVERAITAS NUSANTARA</h1>
              <p className='font-bold text-text-1 tracking-widest'>SISTEM INFORMASI AKADEMIK TERPADU (SIAKAD)</p>
            </div>
          </div>
        </div>

        <div className='ml-10 z-10 relative h-screen gap-5 flex flex-col justify-center w-fit'>
          <h1 className='text-text-1 bg-white/30 w-fit px-5 rounded-2xl text-md font-bold drop-shadow-lg'>Tahun Akademik 2024/2025 • Semester Genap</h1>
          <h1 className='text-5xl w-[60%] text-white font-bold'>Gerbang Akademik Unggul & Berkelanjutan</h1>
          <p className='w-1/2 text-white font-inter text-lg'>Pusat layanan akademik digital terintegrasi untuk civitas academica: pengelolaan rencana studi, kurikulum berbasis OBE, riwayat evaluasi, dan akselerasi riset ilmiah kampus.</p>
        </div>

        <div className=''>
          <h1 className=''>AKREDITASI & STANDAR MUTU INTERNASIONAL</h1>
        </div>
        <img src={fotoBG} className='absolute object-cover w-1/2 h-screen brightness-45' />
      </div>

      <div>
        <MainLogin /> 
      </div>
    </div>
  )
}
