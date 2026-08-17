import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Stock() {
  const [stock, setStock] = useState([]);

  useEffect(() => { api.get('/stock').then((res) => setStock(res.data)); }, []);

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Stock</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Producto</th><th className="p-2">Almacén</th><th className="p-2">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((s) => (
            <tr key={s.id} className="border-b">
              <td className="p-2">{s.product.name}</td>
              <td className="p-2">{s.warehouse.name}</td>
              <td className="p-2">{s.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
