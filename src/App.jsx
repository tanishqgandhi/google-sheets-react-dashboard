import { useEffect, useState } from 'react';
import DashboardCharts from './components/DashboardCharts';
import DashboardHeader from './components/DashboardHeader';
import DataTable from './components/DataTable';
import InfoPanel from './components/InfoPanel';
import KpiCard from './components/KpiCard';
import { API_URL, FALLBACK_API_URL, REFRESH_INTERVAL_MS } from './config/api';
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
      const endpoints = [API_URL, FALLBACK_API_URL];
      let lastFailure = '';

      for (const endpoint of endpoints) {
        try {
          // The app reads data directly from OpenSheet.
          // OpenSheet reads the public Google Sheet and returns JSON.
          const response = await fetch(endpoint);

          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }

          const json = await response.json();
          const normalized = normalizeRows(json);

          setRows(normalized);
          setError('');
          setIsConnected(true);
          setLastUpdated(new Date());
          setActiveApiUrl(endpoint);
          setUsingDemoData(false);
          return;
        } catch (endpointError) {
          lastFailure = `${endpoint} -> ${endpointError.message}`;
        }
      }

      throw new Error(lastFailure);
    } catch (fetchError) {
      // Temporary fallback so the dashboard still demonstrates the full UI
      // until the Google Sheet becomes readable through OpenSheet.
      setRows(normalizeRows(DEMO_ROWS));
      setError(
        'Live Google Sheet data is not reachable yet, so demo data is being shown. Make sure the first row has headers, the sheet has data rows, and sharing is set to "Anyone with the link can view".'
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
            <p>Primary API: {API_URL}</p>
            <p>Fallback API: {FALLBACK_API_URL}</p>
            <p>
              In Google Sheets, add headers in row 1 like Name, Department,
              Sales, Revenue, Date, Region and then add data rows under them.
            </p>
          </section>
        ) : usingDemoData ? (
          <>
            <section className="state-card">
              <p className="eyebrow">Demo Mode</p>
              <h2>Showing sample dashboard data</h2>
              <p>{error}</p>
              <p>Primary API: {API_URL}</p>
              <p>Fallback API: {FALLBACK_API_URL}</p>
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
