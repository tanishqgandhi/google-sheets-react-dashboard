function KpiCard({ title, value, subtitle }) {
  return (
    <article className="card kpi-card">
      <p className="card-label">{title}</p>
      <h2>{value}</h2>
      <p className="card-subtitle">{subtitle}</p>
    </article>
  );
}

export default KpiCard;
