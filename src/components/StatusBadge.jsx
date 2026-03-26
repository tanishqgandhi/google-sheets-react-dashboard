function StatusBadge({ isConnected }) {
  return (
    <span className={`status-badge ${isConnected ? 'online' : 'offline'}`}>
      <span className="status-dot" />
      {isConnected ? 'API Connected' : 'API Disconnected'}
    </span>
  );
}

export default StatusBadge;
