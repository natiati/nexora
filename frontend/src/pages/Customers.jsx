import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const load = () => api.get('/customers').then((res) => setCustomers(res.data));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/customers', { ...form, companyId: 'seed-company-id' });
    setForm({ name: '', email: '', phone: '' });
    load();
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Clientes</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 flex gap-2 mb-6">
        <input placeholder="Nombre" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-teal-700" />
        <input placeholder="Correo" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-teal-700" />
        <input placeholder="Teléfono" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-teal-700" />
        <button className="bg-teal-700 text-white px-4 rounded-lg text-sm font-medium">Nuevo cliente</button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-slate-100 text-slate-500">
              <th className="p-3 font-medium">Nombre</th>
              <th className="p-3 font-medium">Correo</th>
              <th className="p-3 font-medium">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-3 text-slate-800">{c.name}</td>
                <td className="p-3 text-slate-500">{c.email}</td>
                <td className="p-3 text-slate-500">{c.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}