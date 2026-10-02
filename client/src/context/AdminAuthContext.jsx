import { createContext, useContext, useState, useEffect } from 'react';
import AdminAPI from '../api/adminAxios';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);

  // Load admin profile on mount if token exists
  useEffect(() => {
    const loadAdmin = async () => {
      if (adminToken) {
        try {
          const { data } = await AdminAPI.get('/auth/me');
          setAdmin(data);
        } catch (error) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setAdminToken(null);
          setAdmin(null);
        }
      }
      setLoading(false);
    };
    loadAdmin();
  }, [adminToken]);

  const adminLogin = async (email, password) => {
    const { data } = await AdminAPI.post('/auth/login', { email, password });
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminUser', JSON.stringify(data));
    setAdminToken(data.token);
    setAdmin(data);
    return data;
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, adminToken, loading, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext;
