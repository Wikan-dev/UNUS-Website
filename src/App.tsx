import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingPage.tsx';
import Login from './pages/login.tsx';
import CalonMahasiswa from './pages/DaftarCalonMahasiswa.tsx';
import DashBoardMahasiswa from './pages/Dashboard.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />}/>
        <Route path='/Login' element={<Login />}/>
        <Route path='/DaftarCalonMahasiswa' element={<CalonMahasiswa />}/>
        <Route path='/DashBoardMahasiswa/:IDMahasiswa' element={<DashBoardMahasiswa />}/>
      </Routes>
    </BrowserRouter>
  )
}
