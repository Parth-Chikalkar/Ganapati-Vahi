import { useEffect, useState, useCallback } from 'react';
import Favicon from '../../assets/Favicon.png';
import AdminAPI from '../../api/adminAxios';
import toast from 'react-hot-toast';

const statusColors = {
  pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  reviewed: { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa' },
  resolved: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  dismissed: { bg: 'rgba(141,110,99,0.15)', color: '#8d6e63' },
};

const reasonLabels = {
  inappropriate_content: 'Inappropriate Content',
  spam: 'Spam',
  harassment: 'Harassment',
  misinformation: 'Misinformation',
  copyright: 'Copyright',
  other: 'Other',
};

const cardBg = { background: 'rgba(20,5,5,0.8)', border: '1px solid rgba(212,175,55,0.15)' };

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('targetType', typeFilter);
      const { data } = await AdminAPI.get(`/reports?${params}`);
      setReports(data.reports);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  }, [page, statusFilter, typeFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const submitReview = async (newStatus) => {
    if (!reviewModal) return;
    setReviewing(true);
    try {
      await AdminAPI.patch(`/reports/${reviewModal._id}`, { status: newStatus, reviewNote });
      toast.success(`Report marked as ${newStatus}`);
      setReviewModal(null);
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update report');
    } finally { setReviewing(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#d4af37', fontFamily: 'serif' }}>Reports</h1>
        <p className="text-sm mt-0.5" style={{ color: '#8d6e63' }}>{total} reports</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm cursor-pointer outline-none"
          style={{ background: 'rgba(20,5,5,0.9)', border: '1px solid rgba(212,175,55,0.2)', color: '#c9a87c', minWidth: '130px' }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm cursor-pointer outline-none"
          style={{ background: 'rgba(20,5,5,0.9)', border: '1px solid rgba(212,175,55,0.2)', color: '#c9a87c', minWidth: '120px' }}>
          <option value="">All Types</option>
          <option value="book">Book</option>
          <option value="entry">Entry</option>
          <option value="user">User</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 rounded-xl" style={cardBg}>
          <div className="text-center"><img src={Favicon} alt="Loading" className="w-9 h-9 rounded-full object-cover animate-pulse mx-auto mb-2 border border-amber-500/30" /><p style={{ color: '#8d6e63', fontSize: '0.875rem' }}>Loading...</p></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex items-center justify-center py-20 rounded-xl" style={cardBg}>
          <p style={{ color: '#5d4037' }}>No reports found</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl overflow-hidden" style={cardBg}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['Reporter', 'Type', 'Reason', 'Description', 'Status', 'Filed', 'Action'].map((h) => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8d6e63', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r._id} style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.03)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '11px 14px' }}>
                        <p className="text-sm" style={{ color: '#fdfbf7' }}>{r.reporter?.name || 'Unknown'}</p>
                        <p className="text-xs" style={{ color: '#6d4c41' }}>{r.reporter?.email}</p>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span className="text-xs px-2 py-0.5 rounded capitalize"
                          style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.2)' }}>{r.targetType}</span>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8rem', color: '#c9a87c' }}>{reasonLabels[r.reason] || r.reason}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <p className="text-xs max-w-xs truncate" style={{ color: '#8d6e63' }}>{r.description || '—'}</p>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span className="text-xs px-2.5 py-1 rounded-full capitalize font-medium"
                          style={{ background: statusColors[r.status]?.bg, color: statusColors[r.status]?.color }}>{r.status}</span>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8rem', color: '#c9a87c' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '11px 14px' }}>
                        {r.status === 'pending' ? (
                          <button onClick={() => { setReviewModal(r); setReviewNote(''); }}
                            className="text-xs px-2.5 py-1 rounded cursor-pointer whitespace-nowrap"
                            style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)' }}>
                            Review
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: '#5d4037' }}>{r.reviewedBy?.name || 'Admin'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {reports.map((r) => (
              <div key={r._id} className="rounded-xl p-4 space-y-3" style={cardBg}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#fdfbf7' }}>{r.reporter?.name || 'Unknown'}</p>
                    <p className="text-xs truncate" style={{ color: '#6d4c41' }}>{r.reporter?.email}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full capitalize font-medium flex-shrink-0"
                    style={{ background: statusColors[r.status]?.bg, color: statusColors[r.status]?.color }}>{r.status}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded capitalize"
                    style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.2)' }}>{r.targetType}</span>
                  <span style={{ color: '#c9a87c' }}>{reasonLabels[r.reason] || r.reason}</span>
                </div>
                {r.description && <p className="text-xs" style={{ color: '#8d6e63' }}>{r.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#5d4037' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                  {r.status === 'pending' && (
                    <button onClick={() => { setReviewModal(r); setReviewNote(''); }}
                      className="text-xs px-3 py-1.5 rounded cursor-pointer"
                      style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)' }}>
                      Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 rounded text-sm cursor-pointer disabled:opacity-40"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}>‹</button>
              <span className="text-sm" style={{ color: '#8d6e63' }}>{page} / {pages}</span>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                className="px-3 py-1 rounded text-sm cursor-pointer disabled:opacity-40"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}>›</button>
            </div>
          )}
        </>
      )}

      {/* Review modal — bottom sheet on mobile */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-t-2xl sm:rounded-xl w-full sm:max-w-md p-5" style={{ background: '#1a0808', border: '1px solid rgba(212,175,55,0.25)' }}>
            <h3 className="font-bold text-base mb-3" style={{ color: '#d4af37', fontFamily: 'serif' }}>Review Report</h3>
            <div className="mb-4 p-3 rounded-lg space-y-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.08)' }}>
              <p className="text-sm" style={{ color: '#c9a87c' }}><span style={{ color: '#8d6e63' }}>Reporter: </span>{reviewModal.reporter?.name}</p>
              <p className="text-sm" style={{ color: '#c9a87c' }}><span style={{ color: '#8d6e63' }}>Reason: </span>{reasonLabels[reviewModal.reason]}</p>
              {reviewModal.description && <p className="text-sm" style={{ color: '#c9a87c' }}><span style={{ color: '#8d6e63' }}>Note: </span>{reviewModal.description}</p>}
            </div>
            <label className="block text-sm mb-2" style={{ color: '#8d6e63' }}>Review Note (optional)</label>
            <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={2}
              placeholder="Add a note..." className="w-full px-3 py-2 rounded-lg text-sm resize-none outline-none mb-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)', color: '#fdfbf7' }} />
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button onClick={() => submitReview('resolved')} disabled={reviewing}
                className="py-2 rounded text-xs font-medium cursor-pointer"
                style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>✓ Resolve</button>
              <button onClick={() => submitReview('dismissed')} disabled={reviewing}
                className="py-2 rounded text-xs font-medium cursor-pointer"
                style={{ background: 'rgba(141,110,99,0.2)', color: '#8d6e63', border: '1px solid rgba(141,110,99,0.3)' }}>✗ Dismiss</button>
              <button onClick={() => submitReview('reviewed')} disabled={reviewing}
                className="py-2 rounded text-xs font-medium cursor-pointer"
                style={{ background: 'rgba(96,165,250,0.2)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>👁 Review</button>
            </div>
            <button onClick={() => setReviewModal(null)}
              className="w-full py-2 rounded text-sm cursor-pointer"
              style={{ background: 'transparent', border: '1px solid rgba(93,64,55,0.4)', color: '#5d4037' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
