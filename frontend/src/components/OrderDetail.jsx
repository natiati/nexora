import { date, money, quantity } from '../utils/format';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

// Detalle de una orden de venta o de compra con sus líneas
export default function OrderDetail({ order, partyName, isSale, onClose }) {
  return (
    <Modal title={`Orden ${order.orderNumber}`} onClose={onClose} wide>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600 mb-4">
        <span><b className="font-medium text-slate-800">{isSale ? 'Cliente' : 'Proveedor'}:</b> {partyName}</span>
        <span><b className="font-medium text-slate-800">Fecha:</b> {date(order.orderDate)}</span>
        {isSale && order.validUntil && <span><b className="font-medium text-slate-800">Válida hasta:</b> {date(order.validUntil)}</span>}
        {!isSale && order.expectedDate && <span><b className="font-medium text-slate-800">Llegada esperada:</b> {date(order.expectedDate)}</span>}
        <StatusBadge status={order.status} />
      </div>

      <div className="overflow-x-auto">
        <table className="ui-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>{isSale ? 'Entregado' : 'Recibido'}</th>
              <th>{isSale ? 'Precio' : 'Costo'}</th>
              {isSale && <th>Desc.</th>}
              <th>IVA</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="!text-slate-800">{item.product?.name ?? '—'}</td>
                <td>{quantity(item.quantity)}</td>
                <td>{quantity(isSale ? item.deliveredQuantity : item.receivedQuantity)}</td>
                <td>{money(isSale ? item.unitPrice : item.unitCost)}</td>
                {isSale && <td>{Number(item.discountRate)}%</td>}
                <td>{Number(item.taxRate)}%</td>
                <td className="text-right !text-slate-800">{money(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="text-sm space-y-1 max-w-xs ml-auto mt-4">
        <div className="flex justify-between text-slate-500"><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
        {isSale && <div className="flex justify-between text-slate-500"><dt>Descuento</dt><dd>-{money(order.discountAmount)}</dd></div>}
        <div className="flex justify-between text-slate-500"><dt>IVA</dt><dd>{money(order.taxAmount)}</dd></div>
        <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-100 pt-1"><dt>Total</dt><dd>{money(order.total)}</dd></div>
      </dl>

      {order.notes && <p className="text-sm text-slate-500 mt-4 whitespace-pre-wrap">{order.notes}</p>}
    </Modal>
  );
}
