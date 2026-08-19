import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Stock() {
  const [stock, setStock] = useState([]);
  useEffect(() => { api.get('/stock').then((res) => setStock(res.data)); }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Inventario</h1>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-slate-100 text-slate-500">
              <th className="p-3 font-medium">Producto</th><th className="p-3 font-medium">Almacén</th><th className="p-3 font-medium">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((s) => {
              const low = Number(s.quantity) <= Number(s.product.minStock);
              return (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-3 text-slate-800">{s.product.name}</td>
                  <td className="p-3 text-slate-500">{s.warehouse.name}</td>
                  <td className="p-3">
                    <span className={`text-xs px-3 py-1 rounded-full ${low ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {s.quantity}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
