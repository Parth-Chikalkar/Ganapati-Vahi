import { useEffect, useState, useCallback } from 'react';
import AdminAPI from '../../api/adminAxios';
import ConfirmModal from '../../components/admin/ConfirmModal';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../../context/AdminAuthContext';

const statusColors = {
  active: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  suspended: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  blocked: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
};

const StatusBadge = ({ status }) => (
  <span
    className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
    style={{
      background: statusColors[status]?.bg || statusColors.active.bg,
      color: statusColors[status]?.color || statusColors.active.color,
    }}
  >
    {status}
  </span>
);

const ActionButtons = ({ user, admin, onStatusChange, onDelete }) => (
  <div className="flex items-center gap-1.5 flex-wrap">
    {user.status !== 'suspended' && (
      <button
        onClick={() => onStatusChange(user, 'suspended')}
        className="text-xs px-2 py-1 rounded cursor-pointer transition-all whitespace-nowrap"
        style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
      >
        Suspend
      </button>
    )}
    {user.status !== 'blocked' && (
      <button
        onClick={() => onStatusChange(user, 'blocked')}
        className="text-xs px-2 py-1 rounded cursor-pointer transition-all whitespace-nowrap"
        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
      >
        Block
      </button>
    )}
    {user.status !== 'active' && (
      <button
        onClick={() => onStatusChange(user, 'active')}
        className="text-xs px-2 py-1 rounded cursor-pointer transition-all whitespace-nowrap"
        style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
      >
        Unblock
      </button>
    )}
    {admin?.role === 'superadmin' && (
      <button
        onClick={() => onDelete(user)}
        className="text-xs px-2 py-1 rounded cursor-pointer transition-all whitespace-nowrap"
        style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        Delete
      </button>
    )}
  </div>
);

const AdminUsers = () => {
  const { admin } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirm, setConfirm] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await AdminAPI.get(`/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleStatusChange = (user, newStatus) => {
    const labels = { suspended: 'suspend', blocked: 'block', active: 'unblock/activate' };
    setConfirm({
      type: 'status',
      title: `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} User`,
      message: `Are you sure you want to ${labels[newStatus]} ${user.name} (${user.email})?`,
      userId: user._id,
      newStatus,
      confirmText: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
      danger: newStatus !== 'active',
    });
  };

  const handleDelete = (user) => {
    setConfirm({
      type: 'delete',
      title: 'Delete User',
      message: `This will permanently delete ${user.name} (${user.email}) and ALL their books and entries. This cannot be undone.`,
      userId: user._id,
      confirmText: 'Delete Permanently',
      danger: true,
    });
  };

  const executeConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.type === 'status') {
        await AdminAPI.patch(`/users/${confirm.userId}/status`, { status: confirm.newStatus });
        toast.success('User status updated');
      } else {
        await AdminAPI.delete(`/users/${confirm.userId}`);
        toast.success('User deleted');
      }
      setConfirm(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
      setConfirm(null);
    }
  };

  const cardBg = { background: 'rgba(20,5,5,0.8)', border: '1px solid rgba(212,175,55,0.15)' };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#d4af37', fontFamily: 'serif' }}>
          User Management
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#8d6e63' }}>{total} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'rgba(20,5,5,0.8)', border: '1px solid rgba(212,175,55,0.2)', color: '#fdfbf7' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg text-sm cursor-pointer outline-none sm:w-40"
          style={{ background: 'rgba(20,5,5,0.9)', border: '1px solid rgba(212,175,55,0.2)', color: '#c9a87c' }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-center rounded-xl" style={cardBg}>
          <div>
            <div className="text-3xl animate-pulse mb-2">ॐ</div>
            <p style={{ color: '#8d6e63', fontSize: '0.875rem' }}>Loading users...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="flex items-center justify-center py-20 rounded-xl" style={cardBg}>
          <p style={{ color: '#5d4037' }}>No users found</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl overflow-hidden" style={cardBg}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['User', 'Books', 'Joined', 'Last Active', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{
                        padding: '10px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8d6e63',
                        borderBottom: '1px solid rgba(212,175,55,0.15)',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}
                      style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.03)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <p className="font-medium text-sm" style={{ color: '#fdfbf7' }}>{u.name}</p>
                        <p className="text-xs" style={{ color: '#6d4c41' }}>{u.email}</p>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#c9a87c' }}>{u.bookCount}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#c9a87c' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#c9a87c' }}>
                        {u.lastActivity ? new Date(u.lastActivity).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td style={{ padding: '12px 14px' }}><StatusBadge status={u.status} /></td>
                      <td style={{ padding: '12px 14px' }}>
                        <ActionButtons user={u} admin={admin} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {users.map((u) => (
              <div key={u._id} className="rounded-xl p-4 space-y-3" style={cardBg}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: '#fdfbf7' }}>{u.name}</p>
                    <p className="text-xs truncate" style={{ color: '#6d4c41' }}>{u.email}</p>
                  </div>
                  <StatusBadge status={u.status} />
                </div>
                <div className="flex gap-4 text-xs" style={{ color: '#8d6e63' }}>
                  <span>📚 {u.bookCount} books</span>
                  <span>📅 {new Date(u.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <ActionButtons user={u} admin={admin} onStatusChange={handleStatusChange} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1 rounded text-sm cursor-pointer disabled:opacity-40"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}>
            ‹
          </button>
          <span className="text-sm" style={{ color: '#8d6e63' }}>{page} / {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
            className="px-3 py-1 rounded text-sm cursor-pointer disabled:opacity-40"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}>
            ›
          </button>
        </div>
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

export default AdminUsers;
