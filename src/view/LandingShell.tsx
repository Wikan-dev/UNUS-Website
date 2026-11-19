import type { ReactNode } from 'react'
import LandingHeader from './LandingHeader.tsx'

/** Layout bersama untuk semua halaman landing: header sticky + spacer + konten */
export default function LandingShell({ children }: { children: ReactNode }) {
  return <div><LandingHeader /><div className='h-18' /><div className='px-10 py-10'>{children}</div></div>
}
