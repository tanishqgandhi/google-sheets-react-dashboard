import { useEffect, useState } from 'react';
import DashboardCharts from './components/DashboardCharts';
import DashboardHeader from './components/DashboardHeader';
import DataTable from './components/DataTable';
import InfoPanel from './components/InfoPanel';
import KpiCard from './components/KpiCard';
import { API_URL, REFRESH_INTERVAL_MS } from './config/api';
import {
  calculateMetrics,
  DEMO_ROWS,
  formatCurrency,
  formatNumber,
  formatTimestamp,
  normalizeRows,
} from './utils/dashboard';

function App() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeApiUrl, setActiveApiUrl] = useState(API_URL);
  const [usingDemoData, setUsingDemoData] = useState(false);

  const fetchDashboardData = async ({ showLoader = false } = {}) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      // Secure version:
      // The browser calls our own serverless endpoint.
      // That serverless function reads the private Google Sheet.
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const json = await response.json();
      const normalized = normalizeRows(json);

      setRows(normalized);
      setError('');
      setIsConnected(true);
      setLastUpdated(new Date());
      setActiveApiUrl(API_URL);
      setUsingDemoData(false);
    } catch (fetchError) {
      // Temporary fallback so the dashboard still demonstrates the full UI
      // until the secure Google Sheets function becomes reachable.
      setRows(normalizeRows(DEMO_ROWS));
      setError(
        'Secure Google Sheet data is not reachable yet, so demo data is being shown. Configure the Netlify environment variables and share the private sheet with your Google service account email.'
      );
      setIsConnected(false);
      setLastUpdated(new Date());
      setActiveApiUrl('Demo fallback data');
      setUsingDemoData(true);
      console.error(fetchError);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData({ showLoader: true });

    // Re-fetch every 10 seconds so the dashboard stays in sync with Google Sheets.
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, REFRESH_INTERVAL_MS);

    // Cleanup the interval when the component unmounts.
    return () => clearInterval(intervalId);
  }, []);

  const metrics = calculateMetrics(rows);

  return (
    <div className="app-shell">
      <div className="background-orb background-orb-one" />
      <div className="background-orb background-orb-two" />

      <main className="container">
        <DashboardHeader
          isConnected={isConnected}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          onRefresh={() => fetchDashboardData()}
          formattedLastUpdated={formatTimestamp}
        />

        <InfoPanel usingDemoData={usingDemoData} />

        {loading ? (
          <section className="state-card">
            <p className="eyebrow">Loading</p>
            <h2>Fetching live data from Google Sheets...</h2>
            <p>Please wait while the dashboard connects to OpenSheet API.</p>
          </section>
        ) : error && !usingDemoData ? (
          <section className="state-card error-state">
            <p className="eyebrow">Error</p>
            <h2>Connection failed</h2>
            <p>{error}</p>
            <p>Secure API: {API_URL}</p>
            <p>
              Set Netlify environment variables for the service account and
              spreadsheet details, then redeploy the site.
            </p>
          </section>
        ) : usingDemoData ? (
          <>
            <section className="state-card">
              <p className="eyebrow">Demo Mode</p>
              <h2>Showing sample dashboard data</h2>
              <p>{error}</p>
              <p>Secure API: {API_URL}</p>
            </section>

            <section className="kpi-grid">
              <KpiCard
                title="Total Employees"
                value={formatNumber(metrics.totalEmployees)}
                subtitle="Number of rows in the sheet"
              />
              <KpiCard
                title="Total Sales"
                value={formatNumber(metrics.totalSales)}
                subtitle="Sum of the Sales column"
              />
              <KpiCard
                title="Total Revenue"
                value={formatCurrency(metrics.totalRevenue)}
                subtitle="Sum of the Revenue column"
              />
              <KpiCard
                title="Average Revenue"
                value={formatCurrency(metrics.averageRevenue)}
                subtitle="Revenue divided by total employees"
              />
            </section>

            <DashboardCharts rows={rows} />
            <DataTable rows={rows} />
          </>
        ) : rows.length === 0 ? (
          <section className="state-card">
            <p className="eyebrow">Empty State</p>
            <h2>No rows found in the Google Sheet</h2>
            <p>
              Make sure the first row contains headers and the sheet has at
              least one data row.
            </p>
            <p>Recommended headers: Name, Department, Sales, Revenue, Date, Region</p>
            <p>Connected API: {activeApiUrl}</p>
          </section>
        ) : (
          <>
            <section className="kpi-grid">
              <KpiCard
                title="Total Employees"
                value={formatNumber(metrics.totalEmployees)}
                subtitle="Number of rows in the sheet"
              />
              <KpiCard
                title="Total Sales"
                value={formatNumber(metrics.totalSales)}
                subtitle="Sum of the Sales column"
              />
              <KpiCard
                title="Total Revenue"
                value={formatCurrency(metrics.totalRevenue)}
                subtitle="Sum of the Revenue column"
              />
              <KpiCard
                title="Average Revenue"
                value={formatCurrency(metrics.averageRevenue)}
                subtitle="Revenue divided by total employees"
              />
            </section>

            <DashboardCharts rows={rows} />
            <DataTable rows={rows} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
