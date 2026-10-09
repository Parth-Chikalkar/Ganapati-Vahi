import { useEffect, useState, useCallback } from 'react';
import Favicon from '../../assets/Favicon.png';
import AdminAPI from '../../api/adminAxios';
import toast from 'react-hot-toast';

const actionLabels = {
  admin_created: 'Created Admin',
  admin_suspended: 'Suspended Admin',
  admin_unsuspended: 'Unsuspended Admin',
  admin_deleted: 'Deleted Admin',
  user_suspended: 'Suspended User',
  user_blocked: 'Blocked User',
  user_unblocked: 'Unblocked User',
  user_deleted: 'Deleted User',
  book_deleted: 'Deleted Book',
  entry_deleted: 'Deleted Entry',
  report_reviewed: 'Reviewed Report',
  report_resolved: 'Resolved Report',
  report_dismissed: 'Dismissed Report',
};

const actionColors = {
  admin_created: '#d4af37',
  admin_suspended: '#f59e0b',
  admin_unsuspended: '#22c55e',
  admin_deleted: '#ef4444',
  user_suspended: '#f59e0b',
  user_blocked: '#ef4444',
  user_unblocked: '#22c55e',
  user_deleted: '#dc2626',
  book_deleted: '#ef4444',
  entry_deleted: '#ef4444',
  report_reviewed: '#60a5fa',
  report_resolved: '#22c55e',
  report_dismissed: '#8d6e63',
};

const cardBg = { background: 'rgba(20,5,5,0.8)', border: '1px solid rgba(212,175,55,0.15)' };

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 25 });
      if (actionFilter) params.append('action', actionFilter);
      const { data } = await AdminAPI.get(`/logs?${params}`);
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load activity logs'); }
    finally { setLoading(false); }
  }, [page, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const ActionBadge = ({ action }) => (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap"
      style={{
        background: `${actionColors[action] || '#8d6e63'}18`,
        color: actionColors[action] || '#8d6e63',
      }}
    >
      {actionLabels[action] || action}
    </span>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#d4af37', fontFamily: 'serif' }}>
            Activity Logs
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#8d6e63' }}>{total} total entries</p>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg text-sm cursor-pointer outline-none w-full sm:w-auto"
          style={{ background: 'rgba(20,5,5,0.9)', border: '1px solid rgba(212,175,55,0.2)', color: '#c9a87c' }}
        >
          <option value="">All Actions</option>
          {Object.entries(actionLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Loading / empty */}
      {loading ? (
        <div className="flex items-center justify-center py-20 rounded-xl" style={cardBg}>
          <div className="text-center">
            <img src={Favicon} alt="Loading" className="w-9 h-9 rounded-full object-cover animate-pulse mx-auto mb-2 border border-amber-500/30" />
            <p style={{ color: '#8d6e63', fontSize: '0.875rem' }}>Loading logs...</p>
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex items-center justify-center py-20 rounded-xl" style={cardBg}>
          <p style={{ color: '#5d4037' }}>No activity logs found</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl overflow-hidden" style={cardBg}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['Admin', 'Action', 'Target', 'Reason', 'Timestamp'].map((h) => (
                      <th key={h} style={{
                        padding: '10px 14px', textAlign: 'left', fontSize: '0.7rem',
                        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                        color: '#8d6e63', borderBottom: '1px solid rgba(212,175,55,0.15)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}
                      style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.03)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '11px 14px' }}>
                        <p className="text-sm" style={{ color: '#fdfbf7' }}>{log.admin?.name || 'System'}</p>
                        <p className="text-xs" style={{ color: '#6d4c41' }}>{log.admin?.role}</p>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <ActionBadge action={log.action} />
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <p className="text-xs" style={{ color: '#c9a87c' }}>
                          <span style={{ color: '#6d4c41' }}>{log.targetType}: </span>
                          {log.targetLabel || log.targetId?.toString()?.slice(-8)}
                        </p>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <p className="text-xs max-w-xs truncate" style={{ color: '#6d4c41' }}>
                          {log.reason || '—'}
                        </p>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <p className="text-xs whitespace-nowrap" style={{ color: '#8d6e63' }}>
                          {new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs" style={{ color: '#5d4037' }}>
                          {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile timeline cards */}
          <div className="md:hidden space-y-2">
            {logs.map((log) => (
              <div key={log._id} className="rounded-xl p-3 flex gap-3" style={cardBg}>
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-1 flex-shrink-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: actionColors[log.action] || '#8d6e63' }}
                  />
                  <div className="w-px flex-1 mt-1" style={{ background: 'rgba(212,175,55,0.1)' }} />
                </div>

                <div className="flex-1 min-w-0 space-y-1.5 pb-1">
                  <div className="flex items-start justify-between gap-2">
                    <ActionBadge action={log.action} />
                    <span className="text-xs flex-shrink-0" style={{ color: '#5d4037' }}>
                      {new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs" style={{ color: '#8d6e63' }}>
                    <span>👤 {log.admin?.name || 'System'}</span>
                    <span style={{ color: '#c9a87c' }}>
                      {log.targetType}: {log.targetLabel || log.targetId?.toString()?.slice(-8)}
                    </span>
                  </div>
                  {log.reason && (
                    <p className="text-xs truncate" style={{ color: '#6d4c41' }}>{log.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded text-sm cursor-pointer disabled:opacity-40"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}
              >‹</button>
              <span className="text-sm" style={{ color: '#8d6e63' }}>{page} / {pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1 rounded text-sm cursor-pointer disabled:opacity-40"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}
              >›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminLogs;
