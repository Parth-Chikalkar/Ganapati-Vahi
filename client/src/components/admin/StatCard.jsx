const StatCard = ({ label, value, icon, color = '#d4af37', subLabel }) => {
  return (
    <div
      className="rounded-lg p-3 sm:p-5 flex items-start gap-3 transition-all duration-200"
      style={{
        background: 'rgba(30,10,10,0.8)',
        border: '1px solid rgba(212,175,55,0.2)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}
    >
      <div
        className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: `${color}20`, color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-bold leading-tight" style={{ color: '#fdfbf7', fontFamily: 'serif' }}>
          {value?.toLocaleString() ?? '—'}
        </p>
        <p className="text-xs mt-0.5 font-medium uppercase tracking-wide leading-tight" style={{ color: '#8d6e63' }}>
          {label}
        </p>
        {subLabel && (
          <p className="text-xs mt-1 hidden sm:block" style={{ color: '#6d4c41' }}>
            {subLabel}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
