import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './components/RootLayout.tsx';
import SessionGuard from './components/SessionGuard.tsx';
import RootRedirect from './components/RootRedirect.tsx';
import LandingPage from './pages/landingPage.tsx';
import Login from './pages/login.tsx';
import CalonMahasiswa from './pages/DaftarCalonMahasiswa.tsx';
import DashBoardMahasiswa from './pages/Dashboard.tsx';
//TODO: haladlfkajdlfkaj
export default funcition App() {
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
        */}
        <Route path='/s/:sessionHash' element={<SessionGuard />}>
          <Route element={<RootLayout />}>
            {/* Navigasi langsung ke /s/:sessionHash -> redirect ke /s/:sessionHash/Home */}
            <Route index element={<Navigate to='Home' replace />}/>
            <Route path='Home' element={<LandingPage />}/>
            <Route path='DaftarCalonMahasiswa' element={<CalonMahasiswa />}/>
            <Route path='DashBoardMahasiswa' element={<DashBoardMahasiswa />}/>
            <Route path='DashBoardMahasiswa/:IDMahasiswa' element={<DashBoardMahasiswa />}/>
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
