import { Link } from 'react-router-dom';
import logo from '../assets/svg/Container(7).svg';
import sidebarLogo from '../assets/svg/Button.svg';
import arrow from '../assets/svg/arrow.svg';
import MenuSidebar from './MenuSidebar';
import { getCurrentUser } from '../helper/auth';
import { useSessionPath } from '../helper/useSessionPath';
import { getPermissions } from '../helper/rbac';

export default function Sidebar({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const user = getCurrentUser();
  const basePath = useSessionPath();
  const perms = getPermissions(user?.role);

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div className='fixed inset-0 bg-black/40 z-30' onClick={onToggle} />
      )}

      {/* Tombol buka — fixed, muncul saat sidebar tertutup */}
      {!isOpen && (
        <button
          type='button'
          onClick={onToggle}
          className='fixed top-4 left-4 z-50 w-11 h-11 rounded-xl bg-sidebar text-white shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center'
          title='Buka Sidebar'
        >
          <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
            <path strokeLinecap='round' strokeLinejoin='round' d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5' />
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-80 bg-sidebar px-6 py-6 flex flex-col justify-between shadow-2xl overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand */}
          <div className='flex justify-between items-center'>
            <Link to={`${basePath}/Home`} className='flex gap-3.5 items-center group'>
              <img src={logo} className='bg-white w-12 h-12 p-2 rounded-xl group-hover:scale-105 transition-transform' alt='UNUS Logo' />
              <div>
                <h1 className='text-white font-bold font-merrie text-2xl tracking-wide group-hover:text-role-text transition-colors'>UNUS</h1>
                <p className='font-bold text-placeholder text-xs tracking-widest'>SIAKAD PORTAL</p>
              </div>
            </Link>
            <button
              type='button'
              className='p-1.5 rounded-lg hover:bg-white/10 transition opacity-80 hover:opacity-100'
              title='Tutup Sidebar'
              onClick={onToggle}
            >
              <img src={sidebarLogo} className='w-6' alt='Toggle' />
            </button>
          </div>

          {/* Role Card */}
          <div className='bg-role-sidebar px-4 py-3 rounded-xl mt-8 flex justify-between items-center border border-white/5'>
            <div>
              <h2 className='text-role-text text-xs font-semibold tracking-wider uppercase'>ROLE AKTIF</h2>
              <p className='text-white text-base font-medium mt-0.5'>{perms.label}</p>
              <p className='text-placeholder text-xs mt-0.5'>{user?.email || '-'}</p>
            </div>
            <img src={arrow} className='w-3.5 h-3.5 opacity-70' alt='' />
          </div>

          {/* Menu */}
          <div className='mt-8'>
            <MenuSidebar />
          </div>
        </div>

        {/* Footer */}
        <div className='pt-6 border-t border-white/10 flex items-center justify-between text-xs text-placeholder'>
          <span>UNUS Portal SIAKAD</span>
          <span className='inline-flex items-center gap-1.5 text-emerald-400'>
            <span className='w-2 h-2 rounded-full bg-emerald-400' />
            Online
          </span>
        </div>
      </aside>
    </>
  );
}
