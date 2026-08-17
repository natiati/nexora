import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    sku: '',
    name: '',
    costPrice: '',
    salePrice: ''
  });

  const load = () =>
    api.get('/products').then((res) => setProducts(res.data));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // companyId, categoryId, unitId:
    // los del seed, por ahora quemados aquí
    await api.post('/products', {
      ...form,
      companyId: 'seed-company-id',
      categoryId: '002bf9af-af73-47e6-99ae-51fce976e9f3',
      unitId: '9c9701ca-790a-4cdb-b917-94cde6d68c08',
      costPrice: Number(form.costPrice),
      salePrice: Number(form.salePrice),
    });

    setForm({
      sku: '',
      name: '',
      costPrice: '',
      salePrice: ''
    });

    load();
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">
        Productos
      </h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          placeholder="SKU"
          value={form.sku}
          onChange={(e) =>
            setForm({ ...form, sku: e.target.value })
          }
          className="border p-2 rounded"
        />

        <input
          placeholder="Nombre"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="border p-2 rounded"
        />

        <input
          placeholder="Costo"
          value={form.costPrice}
          onChange={(e) =>
            setForm({ ...form, costPrice: e.target.value })
          }
          className="border p-2 rounded w-24"
        />

        <input
          placeholder="Precio"
          value={form.salePrice}
          onChange={(e) =>
            setForm({ ...form, salePrice: e.target.value })
          }
          className="border p-2 rounded w-24"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded"
        >
          Crear
        </button>
      </form>

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">SKU</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Costo</th>
            <th className="p-2">Precio</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.sku}</td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.costPrice}</td>
              <td className="p-2">{p.salePrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
