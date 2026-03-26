import StatusBadge from './StatusBadge';

function DashboardHeader({
  isConnected,
  isRefreshing,
  lastUpdated,
  onRefresh,
  formattedLastUpdated,
}) {
  return (
    <header className="hero-card">
      <div>
        <p className="eyebrow">Live Google Sheets Dashboard</p>
        <h1>Sales and revenue overview powered by OpenSheet API</h1>
        <p className="hero-text">
          This React dashboard reads directly from Google Sheets with no custom
          backend. Update the sheet and the UI refreshes automatically every 10
          seconds.
        </p>
      </div>

      <div className="hero-actions">
        <StatusBadge isConnected={isConnected} />
        <button className="refresh-button" onClick={onRefresh} disabled={isRefreshing}>
          {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
        </button>
        <p className="timestamp">
          Last updated: <strong>{formattedLastUpdated(lastUpdated)}</strong>
        </p>
      </div>
    </header>
  );
}

export default DashboardHeader;
