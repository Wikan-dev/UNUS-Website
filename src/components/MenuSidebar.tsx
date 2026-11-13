import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../helper/auth';
import { useSessionPath } from '../helper/useSessionPath';

function HomeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
    </svg>
  );
}

function CalonMahasiswaIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' />
    </svg>
  );
}

function DashboardIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z' />
    </svg>
  );
}

function LogoutIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
    </svg>
  );
}

interface MenuItem {
  name: string;
  /** Path relatif dari session base (tanpa leading slash session) */
  relativePath: string;
  exact?: boolean;
  matchPrefix?: boolean;
  icon: (props: { className?: string }) => React.JSX.Element;
}

const mainMenus: MenuItem[] = [
  {
    name: 'Home',
    relativePath: 'Home',
    exact: true,
    icon: HomeIcon,
  },
  {
    name: 'Calon Mahasiswa',
    relativePath: 'DaftarCalonMahasiswa',
    exact: true,
    icon: CalonMahasiswaIcon,
  },
  {
    name: 'Dashboard Mahasiswa',
    relativePath: 'DashBoardMahasiswa',
    matchPrefix: true,
    icon: DashboardIcon,
  },
];

export default function MenuSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const basePath = useSessionPath();

  const isItemActive = (item: MenuItem): boolean => {
    const fullPath = `${basePath}/${item.relativePath}`;
    if (item.exact) {
      return location.pathname === fullPath;
    }
    if (item.matchPrefix) {
      return location.pathname === fullPath || location.pathname.startsWith(`${fullPath}/`);
    }
    return location.pathname === fullPath;
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/Login');
  };

  return (
    <nav className='flex flex-col gap-1.5'>
      <div className='px-3 mb-1'>
        <span className='text-[11px] font-semibold tracking-wider uppercase text-placeholder/70'>
          Menu Navigasi
        </span>
      </div>

      {mainMenus.map((item) => {
        const active = isItemActive(item);
        const Icon = item.icon;
        const fullPath = `${basePath}/${item.relativePath}`;

        return (
          <Link
            key={item.relativePath}
            to={fullPath}
            className={`group flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 border-l-4 ${
              active
                ? 'bg-role-sidebar text-white font-semibold border-role-text shadow-md'
                : 'border-transparent text-placeholder hover:text-white hover:bg-white/5'
            }`}
          >
            <div className='flex items-center gap-3.5'>
              <Icon
                className={`w-5 h-5 transition-colors ${
                  active ? 'text-role-text' : 'text-placeholder group-hover:text-white'
                }`}
              />
              <span className={`text-sm tracking-wide ${active ? 'text-white font-semibold' : ''}`}>
                {item.name}
              </span>
            </div>

            {active && (
              <span className='flex items-center gap-1.5 text-[11px] font-medium text-role-text bg-white/10 px-2 py-0.5 rounded-full'>
                <span className='w-1.5 h-1.5 rounded-full bg-role-text animate-pulse' />
                Aktif
              </span>
            )}
          </Link>
        );
      })}

      {/* Akun / Sistem */}
      <div className='mt-6 pt-5 border-t border-white/10'>
        <div className='px-3 mb-2'>
          <span className='text-[11px] font-semibold tracking-wider uppercase text-placeholder/70'>
            Sistem & Akun
          </span>
        </div>

        {user ? (
          <button
            type='button'
            onClick={handleLogout}
            className='w-full group flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 border-l-4 border-transparent text-placeholder hover:text-red-300 hover:bg-red-500/10'
          >
            <div className='flex items-center gap-3.5'>
              <LogoutIcon className='w-5 h-5 text-placeholder group-hover:text-red-300 transition-colors' />
              <span className='text-sm tracking-wide'>Keluar (Logout)</span>
            </div>
          </button>
        ) : (
          <Link
            to='/Login'
            className={`group flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 border-l-4 ${
              location.pathname === '/Login'
                ? 'bg-role-sidebar text-white font-semibold border-role-text shadow-md'
                : 'border-transparent text-placeholder hover:text-white hover:bg-white/5'
            }`}
          >
            <div className='flex items-center gap-3.5'>
              <LogoutIcon
                className={`w-5 h-5 transition-colors ${
                  location.pathname === '/Login' ? 'text-role-text' : 'text-placeholder group-hover:text-white'
                }`}
              />
              <span className='text-sm tracking-wide'>Masuk (Login)</span>
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}
