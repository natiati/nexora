import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { dashboardApi } from '../api/resources';
import ChartCard from '../components/charts/ChartCard';
import GroupedColumnChart from '../components/charts/GroupedColumnChart';
import HorizontalBars from '../components/charts/HorizontalBars';
import ErrorMessage from '../components/ErrorMessage';
import PageHeader from '../components/PageHeader';
import { downloadCsv } from '../utils/csv';
import { money, monthLabel, quantity } from '../utils/format';

const PERIODS = [3, 6, 12];

// Colores validados contra daltonismo y contraste sobre fondo blanco
const SERIES = [
  { name: 'Facturado', color: '#0d9488' },
  { name: 'Cobrado', color: '#eb6834' },
];

export default function Dashboard() {
  const [months, setMonths] = useState(6);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    dashboardApi.get(months)
      .then((data) => { if (active) setSummary(data); })
      .catch((err) => { if (active) setError(getErrorMessage(err)); });

    return () => { active = false; };
  }, [months]);

  const cards = summary ? [
    { label: 'Ventas facturadas', value: money(summary.salesTotal), color: 'text-slate-900', to: '/invoices' },
    { label: 'Cuentas por cobrar', value: money(summary.receivable), color: 'text-red-600', to: '/invoices' },
    { label: 'Stock crítico', value: summary.lowStockCount, color: 'text-amber-600', to: '/stock' },
    { label: 'Cotizaciones pendientes', value: summary.pendingOrders, color: 'text-slate-900', to: '/sales' },
    { label: 'Compras por recibir', value: summary.openPurchases, color: 'text-slate-900', to: '/purchases' },
  ] : [];

  const monthlyRows = summary?.monthly.map((row) => ({
    key: row.month,
    label: monthLabel(row.month),
    title: monthLabel(row.month, true),
    values: [row.invoiced, row.collected],
  })) ?? [];

  const hasMonthlyData = summary?.monthly.some((row) => row.invoiced > 0 || row.collected > 0);

  const exportMonthly = () => downloadCsv(
    `nexora-ventas-${months}-meses.csv`,
    ['Mes', 'Facturado', 'Cobrado'],
    summary.monthly.map((row) => [row.month, row.invoiced, row.collected])
  );

  const exportCustomers = () => downloadCsv(
    `nexora-clientes-${months}-meses.csv`,
    ['Cliente', 'Facturas', 'Facturado', 'Saldo'],
    summary.topCustomers.map((row) => [row.name, row.invoices, row.invoiced, row.balance])
  );

  return (
    <div className="p-4 sm:p-8">
      <PageHeader title="Dashboard" subtitle="Lo que necesita atención hoy y cómo van las ventas">
        <label htmlFor="period" className="sr-only">Periodo de los reportes</label>
        <select id="period" className="ui-input !w-auto" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
          {PERIODS.map((period) => <option key={period} value={period}>Últimos {period} meses</option>)}
        </select>
      </PageHeader>

      <ErrorMessage message={error} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-6">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="ui-card p-4 hover:border-teal-700 transition-colors">
            <div className="text-xs text-slate-500 mb-1.5">{c.label}</div>
            <div className={`text-2xl font-semibold ${c.color}`}>{c.value}</div>
          </Link>
        ))}
      </div>

      {summary && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mb-6">
          <ChartCard
            className="xl:col-span-2"
            title="Facturado y cobrado por mes"
            subtitle={`Últimos ${months} meses, sin facturas anuladas`}
            legend={SERIES}
            onExport={exportMonthly}
            table={(
              <table className="ui-table">
                <thead><tr><th>Mes</th><th>Facturado</th><th>Cobrado</th></tr></thead>
                <tbody>
                  {summary.monthly.map((row) => (
                    <tr key={row.month}>
                      <td className="capitalize">{monthLabel(row.month, true)}</td>
                      <td>{money(row.invoiced)}</td>
                      <td>{money(row.collected)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          >
            {hasMonthlyData
              ? <GroupedColumnChart rows={monthlyRows} series={SERIES} formatValue={money} />
              : <p className="text-sm text-slate-400 py-16 text-center">Sin ventas en este periodo.</p>}
          </ChartCard>

          <ChartCard
            title="Cartera por antigüedad"
            subtitle="Saldo de las facturas abiertas, según su vencimiento"
            table={(
              <table className="ui-table">
                <thead><tr><th>Estado</th><th>Saldo</th></tr></thead>
                <tbody>
                  {summary.aging.map((row) => <tr key={row.id}><td>{row.name}</td><td>{money(row.total)}</td></tr>)}
                </tbody>
              </table>
            )}
          >
            <HorizontalBars
              rows={summary.aging.map((row) => ({ id: row.id, name: row.name, value: row.total }))}
              color={SERIES[0].color}
              formatValue={money}
              emptyText="No hay saldos pendientes."
            />
          </ChartCard>

          <ChartCard
            title="Productos más vendidos"
            subtitle={`Por valor, últimos ${months} meses`}
            table={(
              <table className="ui-table">
                <thead><tr><th>Producto</th><th>Cantidad</th><th>Total</th></tr></thead>
                <tbody>
                  {summary.topProducts.map((row) => (
                    <tr key={row.id}><td>{row.name}</td><td>{quantity(row.quantity)}</td><td>{money(row.total)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          >
            <HorizontalBars
              rows={summary.topProducts.map((row) => ({
                id: row.id,
                name: row.name,
                detail: `${quantity(row.quantity)} vendidos`,
                value: row.total,
              }))}
              color={SERIES[0].color}
              formatValue={money}
              emptyText="Sin ventas en este periodo."
            />
          </ChartCard>

          <ChartCard
            className="xl:col-span-2"
            title="Mejores clientes"
            subtitle={`Por valor facturado, últimos ${months} meses`}
            onExport={exportCustomers}
            table={summary.topCustomers.length === 0
              ? <p className="text-sm text-slate-400 py-8 text-center">Sin facturas en este periodo.</p>
              : (
                <table className="ui-table">
                  <thead><tr><th>Cliente</th><th>Facturas</th><th>Facturado</th><th>Saldo</th></tr></thead>
                  <tbody>
                    {summary.topCustomers.map((row) => (
                      <tr key={row.id}>
                        <td className="!text-slate-800">{row.name}</td>
                        <td>{row.invoices}</td>
                        <td>{money(row.invoiced)}</td>
                        <td>{money(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          />
        </div>
      )}

      <div className="ui-card p-5">
        <div className="text-sm font-semibold text-slate-900 mb-3">Productos con stock bajo</div>
        {!summary || summary.lowStock.length === 0 ? (
          <p className="text-sm text-slate-400">{summary ? 'Sin alertas de stock por ahora.' : 'Cargando…'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr><th>SKU</th><th>Producto</th><th>Mínimo</th><th className="text-right">Existencias</th></tr>
              </thead>
              <tbody>
                {summary.lowStock.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono text-xs">{p.sku}</td>
                    <td className="!text-slate-800">{p.name}</td>
                    <td>{quantity(p.minStock)} {p.unit}</td>
                    <td className="text-right">
                      <span className="bg-amber-50 text-amber-700 text-xs px-3 py-1 rounded-full">{quantity(p.quantity)} {p.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
