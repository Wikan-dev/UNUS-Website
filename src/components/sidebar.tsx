import { Link } from 'react-router-dom';
import logo from '../assets/svg/Container(7).svg';
import sidebarLogo from '../assets/svg/Button.svg';
import arrow from '../assets/svg/arrow.svg';
import MenuSidebar from './MenuSidebar';
import { getCurrentUser } from '../helper/auth';
import { useSessionPath } from '../helper/useSessionPath';

export default function Sidebar() {
  const user = getCurrentUser();
  const basePath = useSessionPath();

  return (
    <aside className='w-80 min-h-screen bg-sidebar px-6 py-6 flex flex-col justify-between shrink-0 shadow-2xl sticky top-0 h-screen overflow-y-auto'>
      <div>
        {/* Brand / Logo */}
        <div className='flex justify-between items-center'>
          <Link to={`${basePath}/Home`} className='flex flex-row gap-3.5 items-center group cursor-pointer'>
            <img
              src={logo}
              className='bg-white w-12 h-12 p-2 rounded-xl group-hover:scale-105 transition-transform'
              alt='UNUS Logo'
            />
            <div>
              <h1 className='text-white font-bold font-merrie text-2xl tracking-wide group-hover:text-role-text transition-colors'>
                UNUS
              </h1>
              <p className='font-bold text-placeholder text-xs tracking-widest'>
                SIAKAD PORTAL
              </p>
            </div>
          </Link>
          <button
            type='button'
            className='p-1.5 rounded-lg hover:bg-white/5 transition opacity-80 hover:opacity-100'
            title='Toggle Sidebar'
          >
            <img src={sidebarLogo} className='w-6' alt='Toggle' />
          </button>
        </div>

        {/* Role Aktif Card */}
        <div className='bg-role-sidebar px-4 py-3 rounded-xl mt-8 flex flex-row justify-between items-center border border-white/5'>
          <div>
            <h2 className='text-role-text text-xs font-semibold tracking-wider uppercase'>ROLE AKTIF</h2>
            <p className='text-white text-base font-medium mt-0.5'>
              {user?.email ? user.email.split('@')[0] : 'Mahasiswa aktif'}
            </p>
          </div>
          <img src={arrow} className='w-3.5 h-3.5 opacity-70' alt='Role dropdown' />
        </div>

        {/* Navigation Menus */}
        <div className='mt-8'>
          <MenuSidebar />
        </div>
      </div>

      {/* Footer Info */}
      <div className='pt-6 border-t border-white/10 flex items-center justify-between text-xs text-placeholder'>
        <span>UNUS Portal SIAKAD</span>
        <span className='inline-flex items-center gap-1.5 text-emerald-400'>
          <span className='w-2 h-2 rounded-full bg-emerald-400'></span>
          Online
        </span>
      </div>
    </aside>
  );
}
