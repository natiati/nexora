import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ sku: '', name: '', costPrice: '', salePrice: '' });

  const load = () => api.get('/products').then((res) => setProducts(res.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/products', {
      ...form,
      companyId: 'seed-company-id',
      categoryId: '002bf9af-af73-47e6-99ae-51fce976e9f3',
      unitId: '9c9701ca-790a-4cdb-b917-94cde6d68c08',
      costPrice: Number(form.costPrice),
      salePrice: Number(form.salePrice),
    });
    setForm({ sku: '', name: '', costPrice: '', salePrice: '' });
    load();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Productos</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 flex gap-2 mb-6">
        <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-teal-700" />
        <input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-teal-700" />
        <input placeholder="Costo" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-teal-700" />
        <input placeholder="Precio" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-teal-700" />
        <button className="bg-teal-700 text-white px-4 rounded-lg text-sm font-medium">Nuevo</button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-slate-100 text-slate-500">
              <th className="p-3 font-medium">SKU</th><th className="p-3 font-medium">Nombre</th>
              <th className="p-3 font-medium">Costo</th><th className="p-3 font-medium">Precio</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-3 text-slate-500">{p.sku}</td>
                <td className="p-3 text-slate-800">{p.name}</td>
                <td className="p-3 text-slate-500">${Number(p.costPrice).toLocaleString()}</td>
                <td className="p-3 text-slate-800">${Number(p.salePrice).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
