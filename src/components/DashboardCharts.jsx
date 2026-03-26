import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  formatCurrency,
  getRevenueByDate,
  getRevenueByDepartment,
} from '../utils/dashboard';

const PIE_COLORS = ['#0f766e', '#f97316', '#2563eb', '#be123c', '#7c3aed'];

function DashboardCharts({ rows }) {
  const revenueByDepartment = getRevenueByDepartment(rows);
  const revenueByDate = getRevenueByDate(rows);

  return (
    <section className="charts-grid">
      <article className="card chart-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Bar Chart</p>
            <h2>Sales by employee</h2>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#0f766e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="card chart-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Pie Chart</p>
            <h2>Revenue by department</h2>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={revenueByDepartment}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                innerRadius={60}
                paddingAngle={4}
              >
                {revenueByDepartment.map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="card chart-card wide-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Line Chart</p>
            <h2>Revenue over date</h2>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueByDate}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}

export default DashboardCharts;
