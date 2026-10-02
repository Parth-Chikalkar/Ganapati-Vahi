import { useEffect, useState, useCallback } from 'react';
import AdminAPI from '../../api/adminAxios';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import toast from 'react-hot-toast';

const cardBg = { background: 'rgba(20,5,5,0.8)', border: '1px solid rgba(212,175,55,0.15)' };

const AdminAdmins = () => {
  const { admin: currentAdmin } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await AdminAPI.get('/admins');
      setAdmins(data);
    } catch { toast.error('Failed to load admins'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('All fields are required'); return; }
    setCreating(true);
    try {
      await AdminAPI.post('/admins', form);
      toast.success('Admin created');
      setForm({ name: '', email: '', password: '' });
      setShowCreate(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally { setCreating(false); }
  };

  const handleStatusToggle = (admin) => {
    const newStatus = admin.status === 'active' ? 'suspended' : 'active';
    setConfirm({
      type: 'status', adminId: admin._id, newStatus,
      title: newStatus === 'suspended' ? 'Suspend Admin' : 'Unsuspend Admin',
      message: `${newStatus === 'suspended' ? 'Suspend' : 'Restore'} ${admin.name} (${admin.email})?`,
      confirmText: newStatus === 'suspended' ? 'Suspend' : 'Unsuspend',
      danger: newStatus === 'suspended',
    });
  };

  const handleDelete = (admin) => setConfirm({
    type: 'delete', adminId: admin._id,
    title: 'Delete Admin',
    message: `Permanently delete the admin account for ${admin.name} (${admin.email})?`,
    confirmText: 'Delete Admin', danger: true,
  });

  const executeConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.type === 'status') {
        await AdminAPI.patch(`/admins/${confirm.adminId}/status`, { status: confirm.newStatus });
        toast.success('Admin status updated');
      } else {
        await AdminAPI.delete(`/admins/${confirm.adminId}`);
        toast.success('Admin deleted');
      }
      setConfirm(null);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
      setConfirm(null);
    }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '6px',
    border: '1px solid rgba(212,175,55,0.25)', background: 'rgba(255,255,255,0.05)',
    color: '#fdfbf7', fontSize: '0.875rem', outline: 'none',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#d4af37', fontFamily: 'serif' }}>Admin Management</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8d6e63' }}>{admins.length} administrators</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg, #800000, #4a0000)', border: '1px solid #d4af37', color: '#d4af37' }}>
          + Create Admin
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(20,5,5,0.9)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <h3 className="font-semibold mb-4 text-sm" style={{ color: '#d4af37', fontFamily: 'serif' }}>Create New Admin</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#8d6e63' }}>Full Name</label>
                <input type="text" placeholder="Admin Name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} required />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#8d6e63' }}>Email</label>
                <input type="email" placeholder="admin@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} required />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#8d6e63' }}>Password</label>
                <input type="password" placeholder="Min 8 characters" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} required />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="px-5 py-2 rounded text-sm font-medium cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#800000,#4a0000)', border: '1px solid #d4af37', color: '#d4af37' }}>
                {creating ? 'Creating...' : 'Create Admin'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2 rounded text-sm cursor-pointer"
                style={{ background: 'transparent', border: '1px solid rgba(93,64,55,0.5)', color: '#8d6e63' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16 rounded-xl" style={cardBg}>
          <div className="text-center"><div className="text-3xl animate-pulse mb-2">ॐ</div><p style={{ color: '#8d6e63', fontSize: '0.875rem' }}>Loading...</p></div>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl overflow-hidden" style={cardBg}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['Admin', 'Role', 'Status', 'Created By', 'Joined', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8d6e63', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a._id} style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.03)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 14px' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37' }}>{a.name[0]?.toUpperCase()}</div>
                          <div>
                            <p className="text-sm" style={{ color: '#fdfbf7' }}>{a.name}{a._id === currentAdmin?._id && <span className="ml-1 text-xs" style={{ color: '#8d6e63' }}>(you)</span>}</p>
                            <p className="text-xs" style={{ color: '#6d4c41' }}>{a.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="text-xs px-2 py-0.5 rounded font-medium"
                          style={{ background: a.role === 'superadmin' ? 'rgba(212,175,55,0.15)' : 'rgba(128,0,0,0.2)', color: a.role === 'superadmin' ? '#d4af37' : '#ff9933' }}>
                          {a.role === 'superadmin' ? '👑 Super Admin' : '🛡 Admin'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="text-xs px-2.5 py-1 rounded-full capitalize font-medium"
                          style={{ background: a.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', color: a.status === 'active' ? '#22c55e' : '#f59e0b' }}>{a.status}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#8d6e63' }}>{a.createdBy ? 'Super Admin' : 'System'}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#c9a87c' }}>{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '12px 14px' }}>
                        {a.role !== 'superadmin' && a._id !== currentAdmin?._id ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleStatusToggle(a)} className="text-xs px-2.5 py-1 rounded cursor-pointer whitespace-nowrap"
                              style={{ background: a.status === 'active' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', color: a.status === 'active' ? '#f59e0b' : '#22c55e', border: `1px solid ${a.status === 'active' ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)'}` }}>
                              {a.status === 'active' ? 'Suspend' : 'Unsuspend'}
                            </button>
                            <button onClick={() => handleDelete(a)} className="text-xs px-2.5 py-1 rounded cursor-pointer whitespace-nowrap"
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>Delete</button>
                          </div>
                        ) : <span className="text-xs" style={{ color: '#5d4037' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {admins.map((a) => (
              <div key={a._id} className="rounded-xl p-4 space-y-3" style={cardBg}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37' }}>{a.name[0]?.toUpperCase()}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#fdfbf7' }}>{a.name}{a._id === currentAdmin?._id && <span className="ml-1 text-xs" style={{ color: '#8d6e63' }}>(you)</span>}</p>
                      <p className="text-xs truncate" style={{ color: '#6d4c41' }}>{a.email}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full capitalize font-medium flex-shrink-0"
                    style={{ background: a.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', color: a.status === 'active' ? '#22c55e' : '#f59e0b' }}>{a.status}</span>
                </div>
                <div>
                  <span className="text-xs px-2 py-0.5 rounded font-medium"
                    style={{ background: a.role === 'superadmin' ? 'rgba(212,175,55,0.15)' : 'rgba(128,0,0,0.2)', color: a.role === 'superadmin' ? '#d4af37' : '#ff9933' }}>
                    {a.role === 'superadmin' ? '👑 Super Admin' : '🛡 Admin'}
                  </span>
                </div>
                {a.role !== 'superadmin' && a._id !== currentAdmin?._id && (
                  <div className="flex gap-2">
                    <button onClick={() => handleStatusToggle(a)} className="flex-1 text-xs py-1.5 rounded cursor-pointer text-center"
                      style={{ background: a.status === 'active' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', color: a.status === 'active' ? '#f59e0b' : '#22c55e', border: `1px solid ${a.status === 'active' ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)'}` }}>
                      {a.status === 'active' ? 'Suspend' : 'Unsuspend'}
                    </button>
                    <button onClick={() => handleDelete(a)} className="flex-1 text-xs py-1.5 rounded cursor-pointer text-center"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmText={confirm?.confirmText}
        danger={confirm?.danger}
        onConfirm={executeConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default AdminAdmins;
