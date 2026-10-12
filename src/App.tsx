import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingPage.tsx';
import Login from './pages/login.tsx';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />}/>
        <Route path='/Login' element={<Login />}/>
      </Routes>
    </BrowserRouter>
  )
}
