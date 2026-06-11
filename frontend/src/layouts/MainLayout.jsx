import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';

const MainLayout = () => {
  return (
    <div className="flex w-full h-screen overflow-hidden text-white font-sans bg-bg-dark">
      <Sidebar />
      <Outlet />
      <RightPanel />
    </div>
  );
};

export default MainLayout;
