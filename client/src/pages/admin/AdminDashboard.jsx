import { useEffect, useState } from 'react';
import AdminAPI from '../../api/adminAxios';
import StatCard from '../../components/admin/StatCard';
import toast from 'react-hot-toast';

// Pure CSS bar chart — no library needed
const BarChart = ({ data, label, color = '#d4af37' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-28 flex items-center justify-center text-xs" style={{ color: '#5d4037' }}>
        No data
      </div>
    );
  }
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#8d6e63' }}>
        {label}
      </p>
      <div className="flex items-end gap-1 h-24 sm:h-28">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{
                height: `${(d.count / max) * 100}%`,
                minHeight: d.count > 0 ? '4px' : '1px',
                background: d.count > 0 ? color : 'rgba(212,175,55,0.08)',
              }}
            />
            {/* Tooltip */}
            <div
              className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none"
              style={{ background: 'rgba(0,0,0,0.85)', color: '#d4af37' }}
            >
              {d._id}: {d.count}
            </div>
            <span style={{ color: '#5d4037', fontSize: '0.55rem' }} className="truncate w-full text-center">
              {d._id?.slice(5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionLabel = ({ children }) => (
  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#5d4037' }}>{children}</p>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await AdminAPI.get('/stats');
        setStats(data);
      } catch {
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl animate-pulse mb-3">ॐ</div>
          <p style={{ color: '#8d6e63' }}>Loading statistics...</p>
        </div>
      </div>
    );
  }

  const ov = stats?.overview || {};
  const ch = stats?.charts || {};

  const cardStyle = {
    background: 'rgba(20,5,5,0.8)',
    border: '1px solid rgba(212,175,55,0.15)',
    borderRadius: '10px',
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#d4af37', fontFamily: 'serif' }}>
          Dashboard Overview
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#8d6e63' }}>
          Platform statistics — Bappaachi Vahi
        </p>
      </div>

      {/* Users */}
      <div>
        <SectionLabel>Users</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Users" value={ov.totalUsers} icon="👥" color="#d4af37" />
          <StatCard label="Active" value={ov.activeUsers} icon="✅" color="#22c55e" />
          <StatCard label="Suspended" value={ov.suspendedUsers} icon="⏸️" color="#f59e0b" />
          <StatCard label="Blocked" value={ov.blockedUsers} icon="🚫" color="#ef4444" />
        </div>
      </div>

      {/* Content */}
      <div>
        <SectionLabel>Content</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Books" value={ov.totalBooks} icon="📚" color="#d4af37" />
          <StatCard label="Public Books" value={ov.publicBooks} icon="🌐" color="#60a5fa" />
          <StatCard label="Private Books" value={ov.privateBooks} icon="🔒" color="#8d6e63" />
          <StatCard label="Total Entries" value={ov.totalEntries} icon="🖼️" color="#c084fc" />
        </div>
      </div>

      {/* Moderation */}
      <div>
        <SectionLabel>Moderation</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Media (Videos)" value={ov.totalMedia} icon="🎬" color="#f97316" />
          <StatCard
            label="Pending Reports"
            value={ov.pendingReports}
            icon="🚩"
            color={ov.pendingReports > 0 ? '#ef4444' : '#22c55e'}
            subLabel={ov.pendingReports > 0 ? 'Needs attention' : 'All clear'}
          />
        </div>
      </div>

      {/* Charts — 2-col on md+, single col on mobile */}
      <div>
        <SectionLabel>7-Day Trends</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div style={{ ...cardStyle, padding: '16px' }}>
            <BarChart data={ch.newUsers} label="New Users" color="#d4af37" />
          </div>
          <div style={{ ...cardStyle, padding: '16px' }}>
            <BarChart data={ch.newBooks} label="New Books" color="#60a5fa" />
          </div>
          <div style={{ ...cardStyle, padding: '16px' }}>
            <BarChart data={ch.newEntries} label="New Entries" color="#c084fc" />
          </div>
          <div style={{ ...cardStyle, padding: '16px' }}>
            <BarChart data={ch.reports} label="Reports Filed" color="#ef4444" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
