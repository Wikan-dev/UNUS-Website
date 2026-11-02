import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './components/RootLayout.tsx';
import LandingPage from './pages/landingPage.tsx';
import Login from './pages/login.tsx';
import CalonMahasiswa from './pages/DaftarCalonMahasiswa.tsx';
import DashBoardMahasiswa from './pages/Dashboard.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/Login' element={<Login />}/>
        <Route element={<RootLayout />}>
          <Route path='/' element={<LandingPage />}/>
          <Route path='/DaftarCalonMahasiswa' element={<CalonMahasiswa />}/>
          <Route path='/DashBoardMahasiswa' element={<DashBoardMahasiswa />}/>
          <Route path='/DashBoardMahasiswa/:IDMahasiswa' element={<DashBoardMahasiswa />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
