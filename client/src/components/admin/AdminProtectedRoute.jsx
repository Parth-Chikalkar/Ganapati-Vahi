import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminProtectedRoute = ({ children, superAdminOnly = false }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#1a0a0a' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">ॐ</div>
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
