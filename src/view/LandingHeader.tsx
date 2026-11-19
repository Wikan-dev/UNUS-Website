import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../helper/auth'
import { useSessionPath } from '../helper/useSessionPath'

const menuItems = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Layanan', href: '#layanan' },
  { label: 'Program Studi', href: '#program-studi' },
  { label: 'Akademik', href: '#akademik' },
  { label: 'Penelitian', href: '#penelitian' },
  { label: 'Tentang Kami', href: '#tentang' },
  { label: 'Berita', href: '#berita' },
  { label: 'Kontak', href: '#kontak' },
]

function ProfileAvatar({ email }: { email?: string }) {
  return <div className='w-10 h-10 rounded-full bg-sidebar flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer' title={email}><svg className='w-6 h-6 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.8}><path strokeLinecap='round' strokeLinejoin='round' d='M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' /></svg></div>
}

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const user = getCurrentUser()
  const basePath = useSessionPath()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const authButtons = user ? (
    <button onClick={() => navigate(`${basePath}/HomePage`)} className='flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white/40 transition-all duration-200 cursor-pointer'>
      <ProfileAvatar email={user.email} />
      <span className='text-sm font-semibold text-gray-800 max-w-32 truncate'>{user.email}</span>
    </button>
  ) : (
    <>
      <button onClick={() => navigate('/Login')} className='px-5 py-2.5 text-sm font-semibold text-sidebar bg-white/50 backdrop-blur-sm border border-sidebar/20 rounded-xl hover:bg-white/80 hover:border-sidebar/40 transition-all duration-200 cursor-pointer'>Masuk Portal</button>
      <button onClick={() => navigate('/Login')} className='px-5 py-2.5 text-sm font-semibold text-white bg-sidebar rounded-xl shadow-md shadow-sidebar/30 hover:shadow-lg hover:shadow-sidebar/40 hover:scale-105 transition-all duration-200 cursor-pointer'>Daftar PMB</button>
    </>
  )

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${scrolled ? 'bg-white/60 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/40' : 'bg-background-home/80 backdrop-blur-md border-b border-white/20'}`}>
      <div className='max-w-7xl mx-auto px-6 lg:px-10'>
        <div className='flex items-center justify-between h-18'>
          <a href='#beranda' onClick={closeMenu} className='flex items-center gap-3 group ml-14'>
            <div className='w-10 h-10 rounded-xl bg-sidebar flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform'>UN</div>
            <div className='hidden sm:block'>
              <h1 className='font-bold text-lg leading-tight tracking-tight text-gray-900'>UNIVERSITAS NUSANTARA</h1>
              <p className='text-[10px] text-gray-500 tracking-widest uppercase'>Akreditasi Unggul</p>
            </div>
          </a>

          <nav className='hidden lg:flex items-center gap-1'>
            {menuItems.map((item) => (
              <a key={item.label} href={item.href} className='px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-white/50 hover:text-sidebar transition-all duration-200'>{item.label}</a>
            ))}
          </nav>

          <div className='hidden lg:flex items-center gap-3'>{authButtons}</div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className='lg:hidden p-2 rounded-xl hover:bg-white/40 transition cursor-pointer' aria-label='Toggle menu'>
            <svg className='w-6 h-6 text-gray-800' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              {mobileMenuOpen ? <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /> : <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className='lg:hidden pb-4 border-t border-white/30 mt-1'>
            <nav className='flex flex-col gap-1 pt-3'>
              {menuItems.map((item) => (
                <a key={item.label} href={item.href} onClick={closeMenu} className='px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-white/50 transition-all'>{item.label}</a>
              ))}
              <div className='flex gap-2 mt-3 px-4' onClick={closeMenu}>{authButtons}</div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
