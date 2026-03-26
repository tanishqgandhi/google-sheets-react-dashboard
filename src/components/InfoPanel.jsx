import { API_URL, FALLBACK_API_URL, REFRESH_INTERVAL_MS } from '../config/api';

function InfoPanel({ usingDemoData }) {
  return (
    <section className="info-grid">
      <article className="card info-card">
        <p className="eyebrow">Architecture</p>
        <h2>No backend server</h2>
        <p>
          Google Sheets stores the data, OpenSheet API exposes it as JSON, and
          React renders the live dashboard in the browser.
        </p>
        {usingDemoData ? (
          <p>
            Demo mode is active because the Google Sheet is not readable yet.
            The dashboard will switch to live sheet data automatically once the
            API starts responding.
          </p>
        ) : null}
      </article>

      <article className="card info-card">
        <p className="eyebrow">API URL</p>
        <h2>OpenSheet endpoint</h2>
        <p className="api-url">{API_URL}</p>
        <p className="api-url">Fallback: {FALLBACK_API_URL}</p>
        <p>Auto-refresh runs every {REFRESH_INTERVAL_MS / 1000} seconds.</p>
      </article>
    </section>
  );
}

export default InfoPanel;
