import { formatCurrency, formatNumber } from '../utils/dashboard';

function DataTable({ rows }) {
  return (
    <section className="card table-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Sheet Records</p>
          <h2>Employee performance table</h2>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Region</th>
              <th>Sales</th>
              <th>Revenue</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.department}</td>
                <td>{row.region}</td>
                <td>{formatNumber(row.sales)}</td>
                <td>{formatCurrency(row.revenue)}</td>
                <td>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DataTable;
