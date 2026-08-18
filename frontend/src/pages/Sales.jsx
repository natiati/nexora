import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Sales() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    api.get('/customers').then((res) => setCustomers(res.data));
    api.get('/products').then((res) => setProducts(res.data));
  }, []);

  const addItem = () => {
    const product = products.find((p) => p.id === selectedProduct);
    if (!product || quantity <= 0) return;
    setItems([...items, {
      productId: product.id,
      name: product.name,
      quantity: Number(quantity),
      unitPrice: Number(product.salePrice),
    }]);
    setSelectedProduct('');
    setQuantity(1);
  };

  const total = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

  const handleConfirm = async () => {
    const { data: order } = await api.post('/sales-orders', {
      companyId: 'seed-company-id',
      warehouseId: '40d50e26-5d70-4888-a62e-7841f162411c',
      customerId,
      orderNumber: `SO-${Date.now()}`,
      orderDate: new Date().toISOString(),
      items: items.map(({ productId, quantity, unitPrice }) => ({ productId, quantity, unitPrice })),
      userId: JSON.parse(localStorage.getItem('user')).id,
    });

    await api.post(`/sales-orders/${order.id}/confirm`, {
      userId: JSON.parse(localStorage.getItem('user')).id,
    });

    setConfirmedOrder(order.orderNumber);
    setItems([]);
    setCustomerId('');
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Nueva orden de venta</h1>

      {confirmedOrder && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">
          Orden {confirmedOrder} confirmada y stock actualizado.
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Izquierda: cliente */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <label className="block text-xs font-medium text-slate-500 mb-1">Cliente</label>
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700">
            <option value="">Selecciona un cliente</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Derecha: items */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <label className="block text-xs font-medium text-slate-500 mb-1">Agregar producto</label>
          <div className="flex gap-2 mb-4">
            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="">Producto</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)}
              className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            <button onClick={addItem} className="bg-slate-900 text-white px-3 rounded-lg text-sm">Agregar</button>
          </div>

          <div className="space-y-1 mb-4">
            {items.map((it, i) => (
              <div key={i} className="flex justify-between text-sm text-slate-700">
                <span>{it.quantity} × {it.name}</span>
                <span>${(it.quantity * it.unitPrice).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-slate-100 pt-3">
            <span className="text-sm font-medium text-slate-500">Total</span>
            <span className="text-lg font-semibold text-slate-900">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <button onClick={handleConfirm} disabled={!customerId || items.length === 0}
        className="mt-6 bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40">
        Confirmar orden
      </button>
    </div>
  );
}