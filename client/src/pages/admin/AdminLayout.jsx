import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #0d0202 0%, #140505 100%)' }}
    >
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-60">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
          style={{
            background: 'rgba(13,2,2,0.95)',
            borderBottom: '1px solid rgba(212,175,55,0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md cursor-pointer"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}
          >
            ☰
          </button>

          <div className="flex items-center gap-2 lg:ml-0 ml-2">
            <span className="text-xl">ॐ</span>
            <span className="text-sm font-medium" style={{ color: '#8d6e63', fontFamily: 'serif' }}>
              Bappaachi Vahi Admin
            </span>
          </div>

          <div className="text-xs" style={{ color: '#5d4037' }}>
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
