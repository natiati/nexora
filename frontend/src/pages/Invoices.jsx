import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [payAmount, setPayAmount] = useState({});

  const load = () => api.get('/invoices').then((res) => setInvoices(res.data));

  useEffect(() => { load(); }, []);

  const registerPayment = async (invoiceId) => {
    const amount = Number(payAmount[invoiceId]);
    if (!amount || amount <= 0) return;
    await api.post(`/invoices/${invoiceId}/payments`, {
      companyId: 'seed-company-id',
      amount,
      paymentMethod: 'cash',
      userId: JSON.parse(localStorage.getItem('user')).id,
    });
    setPayAmount({ ...payAmount, [invoiceId]: '' });
    load();
  };

  const statusStyle = {
    paid: 'bg-emerald-50 text-emerald-700',
    partial: 'bg-amber-50 text-amber-700',
    issued: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Facturas</h1>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-slate-100 text-slate-500">
              <th className="p-3 font-medium">Factura</th><th className="p-3 font-medium">Cliente</th>
              <th className="p-3 font-medium">Total</th><th className="p-3 font-medium">Pagado</th>
              <th className="p-3 font-medium">Estado</th><th className="p-3 font-medium">Pago</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-3 text-slate-800">{inv.invoiceNumber}</td>
                <td className="p-3 text-slate-500">{inv.customer.name}</td>
                <td className="p-3 text-slate-800">${Number(inv.total).toLocaleString()}</td>
                <td className="p-3 text-slate-500">${Number(inv.paidAmount).toLocaleString()}</td>
                <td className="p-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${statusStyle[inv.status] || statusStyle.issued}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="p-3">
                  {inv.status !== 'paid' && (
                    <div className="flex gap-1">
                      <input type="number" placeholder="Monto" value={payAmount[inv.id] || ''}
                        onChange={(e) => setPayAmount({ ...payAmount, [inv.id]: e.target.value })}
                        className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-xs" />
                      <button onClick={() => registerPayment(inv.id)} className="text-teal-700 text-xs font-medium">Pagar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}