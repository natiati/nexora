import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Purchases() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState('');

  const loadOrders = () => api.get('/purchase-orders').then((res) => setOrders(res.data));

  useEffect(() => {
    api.get('/suppliers').then((res) => setSuppliers(res.data));
    api.get('/products').then((res) => setProducts(res.data));
    loadOrders();
  }, []);

  const addItem = () => {
    const product = products.find((p) => p.id === selectedProduct);
    if (!product || quantity <= 0 || !unitCost) return;
    setItems([...items, { productId: product.id, name: product.name, quantity: Number(quantity), unitCost: Number(unitCost) }]);
    setSelectedProduct(''); setQuantity(1); setUnitCost('');
  };

  const createOrder = async () => {
    await api.post('/purchase-orders', {
      companyId: 'seed-company-id',
      warehouseId: '40d50e26-5d70-4888-a62e-7841f162411c',
      supplierId,
      orderNumber: `PO-${Date.now()}`,
      orderDate: new Date().toISOString(),
      items: items.map(({ productId, quantity, unitCost }) => ({ productId, quantity, unitCost })),
      userId: JSON.parse(localStorage.getItem('user')).id,
    });
    setItems([]); setSupplierId(''); loadOrders();
  };

  const receiveOrder = async (id) => {
    await api.post(`/purchase-orders/${id}/receive`, {
      userId: JSON.parse(localStorage.getItem('user')).id,
    });
    loadOrders();
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Compras</h1>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <label className="block text-xs font-medium text-slate-500 mb-1">Proveedor</label>
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Selecciona un proveedor</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <label className="block text-xs font-medium text-slate-500 mb-1">Agregar producto</label>
          <div className="flex gap-2 mb-3">
            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-2 py-2 text-sm">
              <option value="">Producto</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" min="1" placeholder="Cant." value={quantity}
              onChange={(e) => setQuantity(e.target.value)} className="w-16 border border-slate-200 rounded-lg px-2 py-2 text-sm" />
            <input type="number" placeholder="Costo" value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)} className="w-20 border border-slate-200 rounded-lg px-2 py-2 text-sm" />
            <button onClick={addItem} className="bg-slate-900 text-white px-3 rounded-lg text-sm">+</button>
          </div>
          {items.map((it, i) => (
            <div key={i} className="text-sm text-slate-700 flex justify-between">
              <span>{it.quantity} × {it.name}</span><span>${(it.quantity * it.unitCost).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={createOrder} disabled={!supplierId || items.length === 0}
        className="mb-8 bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40">
        Crear orden de compra
      </button>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-slate-100 text-slate-500">
              <th className="p-3 font-medium">Orden</th><th className="p-3 font-medium">Proveedor</th>
              <th className="p-3 font-medium">Total</th><th className="p-3 font-medium">Estado</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-3 text-slate-800">{o.orderNumber}</td>
                <td className="p-3 text-slate-500">{o.supplier.name}</td>
                <td className="p-3 text-slate-800">${Number(o.total).toLocaleString()}</td>
                <td className="p-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${o.status === 'received' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {o.status === 'received' ? 'Recibida' : 'Pendiente'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {o.status !== 'received' && (
                    <button onClick={() => receiveOrder(o.id)} className="text-teal-700 text-xs font-medium">Recibir</button>
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