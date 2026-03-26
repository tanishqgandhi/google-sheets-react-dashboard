export const parseNumber = (value) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
};

export const DEMO_ROWS = [
  {
    Name: 'Rahul',
    Department: 'Engineering',
    Sales: 120,
    Revenue: 50000,
    Date: '2026-03-25',
    Region: 'North',
  },
  {
    Name: 'Priya',
    Department: 'HR',
    Sales: 80,
    Revenue: 30000,
    Date: '2026-03-25',
    Region: 'South',
  },
  {
    Name: 'Aman',
    Department: 'Sales',
    Sales: 150,
    Revenue: 70000,
    Date: '2026-03-25',
    Region: 'West',
  },
  {
    Name: 'Neha',
    Department: 'Marketing',
    Sales: 90,
    Revenue: 40000,
    Date: '2026-03-25',
    Region: 'East',
  },
];

export const normalizeRow = (row, index) => ({
  id: `${row.Name || 'employee'}-${index}`,
  name: row.Name || 'Unknown',
  department: row.Department || 'Unassigned',
  sales: parseNumber(row.Sales),
  revenue: parseNumber(row.Revenue),
  date: row.Date || '',
  region: row.Region || 'Unknown',
});

export const normalizeRows = (rows) =>
  Array.isArray(rows) ? rows.map(normalizeRow) : [];

export const calculateMetrics = (rows) => {
  const totalEmployees = rows.length;
  const totalSales = rows.reduce((sum, row) => sum + row.sales, 0);
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
  const averageRevenue = totalEmployees > 0 ? totalRevenue / totalEmployees : 0;

  return {
    totalEmployees,
    totalSales,
    totalRevenue,
    averageRevenue,
  };
};

export const getRevenueByDepartment = (rows) => {
  const grouped = rows.reduce((accumulator, row) => {
    accumulator[row.department] =
      (accumulator[row.department] || 0) + row.revenue;
    return accumulator;
  }, {});

  return Object.entries(grouped).map(([name, value]) => ({ name, value }));
};

export const getRevenueByDate = (rows) => {
  const grouped = rows.reduce((accumulator, row) => {
    accumulator[row.date] = (accumulator[row.date] || 0) + row.revenue;
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((first, second) => first.date.localeCompare(second.date));
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const formatNumber = (value) =>
  new Intl.NumberFormat('en-IN').format(value);

export const formatTimestamp = (value) => {
  if (!value) return 'Never';

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(value);
};
