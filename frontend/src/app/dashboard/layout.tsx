import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-foreground flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Content Viewport */}
        <main className="flex-1 p-6 md:p-8 bg-[#0a0a0c] overflow-y-auto max-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
