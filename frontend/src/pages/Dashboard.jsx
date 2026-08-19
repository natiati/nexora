import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Dashboard() {
  const [kpis, setKpis] = useState({ ventas: 0, stockCritico: 0, ordenesPendientes: 0, porCobrar: 0 });
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/invoices'),
      api.get('/stock'),
      api.get('/sales-orders'),
    ]).then(([invoicesRes, stockRes, ordersRes]) => {
      const invoices = invoicesRes.data;
      const stock = stockRes.data;
      const orders = ordersRes.data;

      const ventas = invoices.reduce((sum, i) => sum + Number(i.total), 0);
      const porCobrar = invoices.reduce((sum, i) => sum + (Number(i.total) - Number(i.paidAmount)), 0);
      const ordenesPendientes = orders.filter((o) => o.status === 'quote').length;
      const critico = stock.filter((s) => Number(s.quantity) <= Number(s.product.minStock));

      setKpis({ ventas, stockCritico: critico.length, ordenesPendientes, porCobrar });
      setLowStock(critico.slice(0, 5));
    });
  }, []);

  const cards = [
    { label: 'Ventas totales', value: `$${kpis.ventas.toLocaleString()}`, color: 'text-slate-900' },
    { label: 'Stock crítico', value: kpis.stockCritico, color: 'text-amber-600' },
    { label: 'Órdenes pendientes', value: kpis.ordenesPendientes, color: 'text-slate-900' },
    { label: 'Cuentas por cobrar', value: `$${kpis.porCobrar.toLocaleString()}`, color: 'text-red-600' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-1.5">{c.label}</div>
            <div className={`text-2xl font-semibold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="text-sm font-semibold text-slate-900 mb-3">Productos con stock bajo</div>
        {lowStock.length === 0 ? (
          <p className="text-sm text-slate-400">Sin alertas de stock por ahora.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {lowStock.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 text-slate-700">{s.product.name}</td>
                  <td className="py-2 text-slate-500">{s.warehouse.name}</td>
                  <td className="py-2 text-right">
                    <span className="bg-amber-50 text-amber-700 text-xs px-3 py-1 rounded-full">{s.quantity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}