import { Navigate } from 'react-router-dom';
import Favicon from '../../assets/Favicon.png';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminProtectedRoute = ({ children, superAdminOnly = false }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#1a0a0a' }}>
        <div className="text-center">
          <img src={Favicon} alt="Loading" className="w-14 h-14 rounded-full object-cover animate-pulse mx-auto mb-4 border border-amber-500/30" />
          <p style={{ color: '#d4af37', fontFamily: 'serif' }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  if (superAdminOnly && admin.role !== 'superadmin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
