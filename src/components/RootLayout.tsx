import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar.tsx';

export default function RootLayout() {
  return (
    <div className='flex min-h-screen bg-gray-50 text-gray-900'>
      <Sidebar />
      <main className='flex-1 overflow-x-auto min-w-0'>
        <Outlet />
      </main>
    </div>
  );
}
