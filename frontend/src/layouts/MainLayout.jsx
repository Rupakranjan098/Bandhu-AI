import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';

const MainLayout = () => {
  const location = useLocation();
  const hideRightPanelPaths = ['/notes', '/settings', '/calendar'];
  const shouldHideRightPanel = hideRightPanelPaths.includes(location.pathname);

  return (
    <div className="flex w-full h-screen overflow-hidden text-white font-sans bg-bg-dark">
      <Sidebar />
      <Outlet />
      {!shouldHideRightPanel && <RightPanel />}
    </div>
  );
};

export default MainLayout;
