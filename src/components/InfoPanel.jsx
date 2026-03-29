import { API_URL, REFRESH_INTERVAL_MS } from '../config/api';

function InfoPanel({ usingDemoData }) {
  return (
    <section className="info-grid">
      <article className="card info-card">
        <p className="eyebrow">Architecture</p>
        <h2>Secure serverless access</h2>
        <p>
          React now reads data through a Netlify serverless function, so your
          private Google Sheet and service account credentials stay hidden from
          the browser.
        </p>
        {usingDemoData ? (
          <p>
            Demo mode is active because the secure function is not reachable or
            the Google Sheets credentials are not configured yet.
          </p>
        ) : null}
      </article>

      <article className="card info-card">
        <p className="eyebrow">API URL</p>
        <h2>Secure function endpoint</h2>
        <p className="api-url">{API_URL}</p>
        <p>Auto-refresh runs every {REFRESH_INTERVAL_MS / 1000} seconds.</p>
      </article>
    </section>
  );
}

export default InfoPanel;
