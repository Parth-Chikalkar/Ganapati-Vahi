import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Favicon from '../../assets/Favicon.png';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminAPI from '../../api/adminAxios';

const navItems = [
  { to: '/admin', icon: '📊', label: 'Dashboard', exact: true },
  { to: '/admin/users', icon: '👥', label: 'Users' },
  { to: '/admin/books', icon: '📚', label: 'Books & Entries' },
  { to: '/admin/reports', icon: '🚩', label: 'Reports' },
  { to: '/admin/logs', icon: '📋', label: 'Activity Logs' },
];

const superAdminItems = [
  { to: '/admin/admins', icon: '🛡️', label: 'Admins' },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const [pendingReports, setPendingReports] = useState(0);

  useEffect(() => {
    AdminAPI.get('/reports?status=pending&limit=1')
      .then(({ data }) => setPendingReports(data.total || 0))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    adminLogout();
    navigate('/login');
  };

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    color: isActive ? '#d4af37' : '#c9a87c',
    background: isActive ? 'rgba(212,175,55,0.12)' : 'transparent',
    borderLeft: isActive ? '3px solid #d4af37' : '3px solid transparent',
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '240px',
          background: 'linear-gradient(180deg, #140505 0%, #1a0808 100%)',
          borderRight: '1px solid rgba(212,175,55,0.15)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
          <img src={Favicon} alt="Ganapati Vahi Logo" className="w-9 h-9 rounded-full object-cover border border-amber-500/30 shadow-sm" />
          <div>
            <p className="font-bold text-sm leading-tight" style={{ color: '#d4af37', fontFamily: 'serif' }}>
              Ganapati Vahi
            </p>
            <p className="text-xs" style={{ color: '#8d6e63' }}>Admin Panel</p>
          </div>
        </div>

        {/* Admin info */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'rgba(212,175,55,0.2)', color: '#d4af37' }}
            >
              {admin?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#fdfbf7' }}>{admin?.name}</p>
              <span
                className="text-xs px-1.5 py-0.5 rounded-sm uppercase tracking-wider"
                style={{
                  background: admin?.role === 'superadmin' ? 'rgba(212,175,55,0.2)' : 'rgba(128,0,0,0.3)',
                  color: admin?.role === 'superadmin' ? '#d4af37' : '#ff9933',
                  fontSize: '0.65rem',
                }}
              >
                {admin?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 mb-2 text-xs uppercase tracking-widest" style={{ color: '#5d4037' }}>
            Main
          </p>
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                style={linkStyle}
                onClick={onClose}
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.to === '/admin/reports' && pendingReports > 0 && (
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', minWidth: '18px', textAlign: 'center' }}
                  >
                    {pendingReports > 99 ? '99+' : pendingReports}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {admin?.role === 'superadmin' && (
            <>
              <p className="px-3 mt-5 mb-2 text-xs uppercase tracking-widest" style={{ color: '#5d4037' }}>
                Super Admin
              </p>
              <div className="space-y-0.5">
                {superAdminItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={linkStyle}
                    onClick={onClose}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{ background: 'transparent', border: '1px solid rgba(128,0,0,0.4)', color: '#ef4444' }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
