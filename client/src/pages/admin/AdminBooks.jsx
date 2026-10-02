import { useEffect, useState, useCallback } from 'react';
import AdminAPI from '../../api/adminAxios';
import ConfirmModal from '../../components/admin/ConfirmModal';
import toast from 'react-hot-toast';

const cardBg = { background: 'rgba(20,5,5,0.8)', border: '1px solid rgba(212,175,55,0.15)' };

const AdminBooks = () => {
  const [tab, setTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [visFilter, setVisFilter] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [previewBook, setPreviewBook] = useState(null);
  const [previewEntries, setPreviewEntries] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (visFilter) params.append('visibility', visFilter);
      const { data } = await AdminAPI.get(`/content/books?${params}`);
      setBooks(data.books);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load books'); }
    finally { setLoading(false); }
  }, [page, search, visFilter]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      const { data } = await AdminAPI.get(`/content/entries?${params}`);
      setEntries(data.entries);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load entries'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => {
    if (tab === 'books') fetchBooks();
    else fetchEntries();
  }, [tab, fetchBooks, fetchEntries]);

  const openBookPreview = async (book) => {
    setPreviewBook(book);
    setPreviewLoading(true);
    try {
      const { data } = await AdminAPI.get(`/content/books/${book._id}/entries`);
      setPreviewEntries(data.entries);
    } catch { setPreviewEntries([]); }
    finally { setPreviewLoading(false); }
  };

  const handleDeleteBook = (book) => setConfirm({
    type: 'book', id: book._id,
    title: 'Delete Book',
    message: `Delete "${book.title}" by ${book.owner?.name}? This permanently deletes the book and all its entries.`,
    confirmText: 'Delete Book',
  });

  const handleDeleteEntry = (entry) => setConfirm({
    type: 'entry', id: entry._id,
    title: 'Delete Entry',
    message: `Delete entry "${entry.title}" by ${entry.owner?.name}?`,
    confirmText: 'Delete Entry',
  });

  const executeConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.type === 'book') {
        await AdminAPI.delete(`/content/books/${confirm.id}`);
        toast.success('Book deleted');
        setPreviewBook(null);
      } else {
        await AdminAPI.delete(`/content/entries/${confirm.id}`);
        toast.success('Entry deleted');
      }
      setConfirm(null);
      if (tab === 'books') fetchBooks(); else fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
      setConfirm(null);
    }
  };

  const Pagination = () => pages > 1 ? (
    <div className="flex items-center justify-center gap-2 pt-1">
      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
        className="px-3 py-1 rounded text-sm cursor-pointer disabled:opacity-40"
        style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}>‹</button>
      <span className="text-sm" style={{ color: '#8d6e63' }}>{page} / {pages}</span>
      <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
        className="px-3 py-1 rounded text-sm cursor-pointer disabled:opacity-40"
        style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}>›</button>
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#d4af37', fontFamily: 'serif' }}>Content Moderation</h1>
        <p className="text-sm mt-0.5" style={{ color: '#8d6e63' }}>{total} items</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {['books', 'entries'].map((t) => (
          <button key={t} onClick={() => { setTab(t); setPage(1); setSearch(''); }}
            className="px-4 py-2 rounded-lg text-sm font-medium capitalize cursor-pointer transition-all"
            style={{
              background: tab === t ? 'rgba(212,175,55,0.15)' : 'transparent',
              border: `1px solid ${tab === t ? '#d4af37' : 'rgba(212,175,55,0.2)'}`,
              color: tab === t ? '#d4af37' : '#8d6e63',
            }}>
            {t === 'books' ? '📚' : '🖼️'} {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input type="text" placeholder={`Search ${tab}...`} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'rgba(20,5,5,0.8)', border: '1px solid rgba(212,175,55,0.2)', color: '#fdfbf7' }} />
        {tab === 'books' && (
          <select value={visFilter} onChange={(e) => { setVisFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg text-sm cursor-pointer outline-none sm:w-40"
            style={{ background: 'rgba(20,5,5,0.9)', border: '1px solid rgba(212,175,55,0.2)', color: '#c9a87c' }}>
            <option value="">All Visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        )}
      </div>

      {/* Loading / empty */}
      {loading ? (
        <div className="flex items-center justify-center py-20 rounded-xl" style={cardBg}>
          <div className="text-center"><div className="text-3xl animate-pulse mb-2">ॐ</div><p style={{ color: '#8d6e63', fontSize: '0.875rem' }}>Loading...</p></div>
        </div>
      ) : (tab === 'books' ? books : entries).length === 0 ? (
        <div className="flex items-center justify-center py-20 rounded-xl" style={cardBg}>
          <p style={{ color: '#5d4037' }}>No {tab} found</p>
        </div>
      ) : tab === 'books' ? (
        <>
          {/* Desktop table — books */}
          <div className="hidden md:block rounded-xl overflow-hidden" style={cardBg}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['Book', 'Owner', 'Visibility', 'Entries', 'Created', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8d6e63', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b._id} style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.03)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '11px 14px' }}>
                        <p className="font-medium text-sm" style={{ color: '#fdfbf7' }}>{b.title}</p>
                        {b.description && <p className="text-xs mt-0.5 max-w-xs truncate" style={{ color: '#6d4c41' }}>{b.description}</p>}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <p className="text-sm" style={{ color: '#fdfbf7' }}>{b.owner?.name}</p>
                        <p className="text-xs" style={{ color: '#6d4c41' }}>{b.owner?.email}</p>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: b.isPublic ? 'rgba(96,165,250,0.15)' : 'rgba(141,110,99,0.15)', color: b.isPublic ? '#60a5fa' : '#8d6e63' }}>
                          {b.isPublic ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.85rem', color: '#c9a87c' }}>{b.entryCount}</td>
                      <td style={{ padding: '11px 14px', fontSize: '0.85rem', color: '#c9a87c' }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <div className="flex gap-2">
                          <button onClick={() => openBookPreview(b)} className="text-xs px-2.5 py-1 rounded cursor-pointer whitespace-nowrap"
                            style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.25)' }}>Preview</button>
                          <button onClick={() => handleDeleteBook(b)} className="text-xs px-2.5 py-1 rounded cursor-pointer whitespace-nowrap"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards — books */}
          <div className="md:hidden space-y-3">
            {books.map((b) => (
              <div key={b._id} className="rounded-xl p-4 space-y-3" style={cardBg}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm" style={{ color: '#fdfbf7' }}>{b.title}</p>
                    <p className="text-xs" style={{ color: '#6d4c41' }}>{b.owner?.name} · {b.owner?.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: b.isPublic ? 'rgba(96,165,250,0.15)' : 'rgba(141,110,99,0.15)', color: b.isPublic ? '#60a5fa' : '#8d6e63' }}>
                    {b.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="flex gap-4 text-xs" style={{ color: '#8d6e63' }}>
                  <span>🖼️ {b.entryCount} entries</span>
                  <span>📅 {new Date(b.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openBookPreview(b)} className="flex-1 text-xs py-1.5 rounded cursor-pointer text-center"
                    style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.25)' }}>Preview</button>
                  <button onClick={() => handleDeleteBook(b)} className="flex-1 text-xs py-1.5 rounded cursor-pointer text-center"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
          <Pagination />
        </>
      ) : (
        <>
          {/* Desktop table — entries */}
          <div className="hidden md:block rounded-xl overflow-hidden" style={cardBg}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['Entry', 'Owner', 'Book', 'Media', 'Created', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8d6e63', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e._id} style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}
                      onMouseOver={(ev) => ev.currentTarget.style.background = 'rgba(212,175,55,0.03)'}
                      onMouseOut={(ev) => ev.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '11px 14px' }}>
                        <div className="flex items-center gap-3">
                          {e.imageUrl && <img src={e.imageUrl} alt={e.title} className="w-10 h-10 rounded object-cover flex-shrink-0" style={{ border: '1px solid rgba(212,175,55,0.2)' }} />}
                          <p className="font-medium text-sm" style={{ color: '#fdfbf7' }}>{e.title}</p>
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <p className="text-sm" style={{ color: '#fdfbf7' }}>{e.owner?.name}</p>
                        <p className="text-xs" style={{ color: '#6d4c41' }}>{e.owner?.email}</p>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.85rem', color: '#c9a87c' }}>{e.book?.title || '—'}</td>
                      <td style={{ padding: '11px 14px' }}>
                        {e.videoUrl ? (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>📹 Video</span>
                        ) : <span className="text-xs" style={{ color: '#5d4037' }}>Image</span>}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.85rem', color: '#c9a87c' }}>{new Date(e.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <button onClick={() => handleDeleteEntry(e)} className="text-xs px-2.5 py-1 rounded cursor-pointer whitespace-nowrap"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards — entries */}
          <div className="md:hidden space-y-3">
            {entries.map((e) => (
              <div key={e._id} className="rounded-xl overflow-hidden" style={cardBg}>
                {e.imageUrl && <img src={e.imageUrl} alt={e.title} className="w-full h-36 object-cover" />}
                <div className="p-4 space-y-2">
                  <p className="font-medium text-sm" style={{ color: '#fdfbf7' }}>{e.title}</p>
                  <p className="text-xs" style={{ color: '#6d4c41' }}>{e.owner?.name} · {e.book?.title || 'Unknown book'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: '#8d6e63' }}>{new Date(e.createdAt).toLocaleDateString('en-IN')}</span>
                    <button onClick={() => handleDeleteEntry(e)} className="text-xs px-3 py-1 rounded cursor-pointer"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination />
        </>
      )}

      {/* Book preview modal */}
      {previewBook && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            style={{ background: '#140505', border: '1px solid rgba(212,175,55,0.25)' }}>
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
              <div className="min-w-0">
                <h3 className="font-bold text-sm truncate" style={{ color: '#d4af37', fontFamily: 'serif' }}>{previewBook.title}</h3>
                <p className="text-xs" style={{ color: '#8d6e63' }}>by {previewBook.owner?.name} · {previewEntries.length} entries</p>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-2">
                <button onClick={() => handleDeleteBook(previewBook)} className="text-xs px-2.5 py-1.5 rounded cursor-pointer"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>Delete</button>
                <button onClick={() => setPreviewBook(null)} className="text-xs px-2.5 py-1.5 rounded cursor-pointer"
                  style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.25)' }}>✕</button>
              </div>
            </div>
            <div className="overflow-y-auto p-4">
              {previewLoading ? (
                <div className="text-center py-8"><div className="text-3xl animate-pulse">ॐ</div></div>
              ) : previewEntries.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: '#5d4037' }}>No entries in this book</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {previewEntries.map((e) => (
                    <div key={e._id} className="rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}>
                      {e.imageUrl && <img src={e.imageUrl} alt={e.title} className="w-full h-24 object-cover" />}
                      <div className="p-2">
                        <p className="text-xs font-medium truncate" style={{ color: '#fdfbf7' }}>{e.title}</p>
                        <button onClick={() => handleDeleteEntry(e)} className="text-xs mt-1 cursor-pointer" style={{ color: '#ef4444' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmText={confirm?.confirmText}
        danger={true}
        onConfirm={executeConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default AdminBooks;
