import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './components/RootLayout.tsx';
import SessionGuard from './components/SessionGuard.tsx';
import RoleGuard from './components/RoleGuard.tsx';
import RootRedirect from './components/RootRedirect.tsx';
import LandingPage from './pages/landingPage.tsx';
import Login from './pages/login.tsx';
import CalonMahasiswa from './pages/DaftarCalonMahasiswa.tsx';
import DashBoardMahasiswa from './pages/Dashboard.tsx';
import HomePage from './pages/HomePage.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Login — tanpa sidebar, tanpa session guard */}
        <Route path='/Login' element={<Login />}/>

        {/* Root "/" -> redirect otomatis berdasarkan status login */}
        <Route path='/' element={<RootRedirect />}/>

        {/* 
          Semua route yang dilindungi ada di bawah /s/:sessionHash/...
          SessionGuard memverifikasi hash valid sebelum mengizinkan akses.
          RoleGuard mengecek apakah role user diizinkan untuk halaman tersebut.
        */}
        <Route path='/s/:sessionHash' element={<SessionGuard />}>
          <Route element={<RootLayout />}>
            {/* Navigasi langsung ke /s/:sessionHash -> redirect ke halaman default */}
            <Route index element={<Navigate to='HomePage' replace />}/>

            <Route path='Home' element={
              <RoleGuard page='Home'>
                <LandingPage />
              </RoleGuard>
            }/>

            <Route path='HomePage' element={
              <RoleGuard page='HomePage'>
                <HomePage />
              </RoleGuard>
            }/>

            <Route path='DaftarCalonMahasiswa' element={
              <RoleGuard page='DaftarCalonMahasiswa'>
                <CalonMahasiswa />
              </RoleGuard>
            }/>

            <Route path='DashBoardMahasiswa' element={
              <RoleGuard page='DashBoardMahasiswa'>
                <DashBoardMahasiswa />
              </RoleGuard>
            }/>

            <Route path='DashBoardMahasiswa/:IDMahasiswa' element={
              <RoleGuard page='DashBoardMahasiswa'>
                <DashBoardMahasiswa />
              </RoleGuard>
            }/>
          </Route>
        </Route>

        {/* Akses /s tanpa parameter -> redirect */}
        <Route path='/s' element={<RootRedirect />}/>

        {/* Catch-all: route tidak dikenal -> redirect */}
        <Route path='*' element={<RootRedirect />}/>
      </Routes>
    </BrowserRouter>
  );
}
