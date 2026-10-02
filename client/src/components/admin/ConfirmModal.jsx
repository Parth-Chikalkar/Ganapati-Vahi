const ConfirmModal = ({ isOpen, title, message, confirmText = 'Delete', onConfirm, onCancel, danger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="rounded-lg shadow-2xl max-w-md w-full p-6"
        style={{ background: '#1e0a0a', border: '1px solid #d4af37' }}
      >
        {/* Warning icon */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: danger ? 'rgba(220,38,38,0.2)' : 'rgba(212,175,55,0.2)', color: danger ? '#ef4444' : '#d4af37' }}
          >
            {danger ? '⚠' : '?'}
          </div>
          <h3 className="text-lg font-semibold" style={{ color: '#fdfbf7', fontFamily: 'serif' }}>
            {title}
          </h3>
        </div>

        <p className="text-sm mb-6" style={{ color: '#c9a87c', lineHeight: 1.6 }}>
          {message}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{ background: 'transparent', border: '1px solid #5d4037', color: '#c9a87c' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(93,64,55,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: danger ? 'rgba(220,38,38,0.8)' : 'rgba(212,175,55,0.8)',
              border: `1px solid ${danger ? '#ef4444' : '#d4af37'}`,
              color: '#fff'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
