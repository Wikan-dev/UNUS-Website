import type { ReactNode } from 'react'
import LandingHeader from './LandingHeader.tsx'

/** Layout bersama untuk halaman landing: header sticky + spacer + konten max-w-7xl terpusat */
export default function LandingShell({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-screen flex flex-col bg-slate-50/60'>
      <LandingHeader />
      <div className='h-18' />
      <main className='flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-16 lg:space-y-24'>
        {children}
      </main>
    </div>
  )
}
