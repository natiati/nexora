import { getProductStatus } from '../utils/productStatus';
import Logo from './Logo';
import { navGroups } from './navigation';
import { productColumns } from './productColumns';

// Los mismos productos de los datos de demostración (prisma/seed.js) en las dos capas del comparador
const PRODUCTS = [
  { id: 1, sku: 'CEM-001', name: 'Cemento gris 50kg', category: { name: 'Materiales de obra' }, unit: { abbreviation: 'bto' }, costPrice: 28000, salePrice: 35000, minStock: 20, stock: 105, reserved: 0, warehouse: 'Principal', supplier: 'Cementos del Tolima', location: 'A-01', date: '14/08', notes: 'pedir mas?', trackStock: true, isActive: true },
  { id: 2, sku: 'VAR-3-8', name: 'Varilla 3/8"', category: { name: 'Acero' }, unit: { abbreviation: 'und' }, costPrice: 15000, salePrice: 19500, minStock: 30, stock: 45, reserved: 0, warehouse: 'Principal', supplier: 'Cementos del Tolima', location: 'B-04', date: '14/08', notes: '', trackStock: true, isActive: true },
  { id: 3, sku: 'PIN-BLA', name: 'Pintura blanca 1gal', category: { name: 'Pinturas' }, unit: { abbreviation: 'gal' }, costPrice: 42000, salePrice: 58000, minStock: 10, stock: 25, reserved: 4, warehouse: 'Principal', supplier: 'Cementos del Tolima', location: 'C-01', date: '13/08', notes: 'apartada!!', trackStock: true, isActive: true },
  { id: 4, sku: 'LAD-COM', name: 'Ladrillo común (millar)', category: { name: 'Materiales de obra' }, unit: { abbreviation: 'mil' }, costPrice: 380000, salePrice: 450000, minStock: 5, stock: 5, reserved: 0, warehouse: 'Principal', supplier: 'Cementos del Tolima', location: 'B-05', date: '12/08', notes: 'revisar', trackStock: true, isActive: true },
  { id: 5, sku: 'TUB-PVC2', name: 'Tubo PVC 2"', category: { name: 'Tubería' }, unit: { abbreviation: 'und' }, costPrice: 12000, salePrice: 16500, minStock: 15, stock: 0, reserved: 0, warehouse: '??', supplier: 'Distribuidora Acero', location: 'D-09', date: '10/08', notes: 'pedido en curso', trackStock: true, isActive: true },
  { id: 6, sku: 'SRV-ENT', name: 'Servicio de entrega en obra', category: { name: 'Servicios' }, unit: { abbreviation: 'und' }, costPrice: 0, salePrice: 80000, minStock: 0, stock: 0, reserved: 0, warehouse: '-', supplier: '-', location: '-', date: '', notes: 'no es producto', trackStock: false, isActive: true },
];

const SHEET_COLUMNS = [
  ['ID', 40], ['NOMBRE_PROD', 170], ['SKU_REF', 72], ['CAT', 44], ['ALMACEN', 72], ['STK_DISP', 68], ['STK_RES', 62],
  ['STK_MIN', 62], ['PRECIO_U', 72], ['PRECIO_TOT', 84], ['PROVEEDOR', 136], ['UBIC', 48], ['ESTADO', 72], ['FECHA_MOV', 80], ['OBS', 110],
];

// Celdas de ancho fijo: las columnas quedan alineadas, como en una hoja de cálculo real
function SheetCells({ cells }) {
  return cells.map(({ value, className }, index) => (
    <div key={SHEET_COLUMNS[index][0]} className={className} style={{ flex: 'none', width: SHEET_COLUMNS[index][1], minWidth: 0, overflow: 'hidden' }}>
      {value}
    </div>
  ));
}

// "Antes": la misma información en una hoja de cálculo de 15 columnas
export function SpreadsheetPreview() {
  return (
    <div className="sheet" aria-hidden="true">
      <div className="sheet-head">
        <SheetCells cells={SHEET_COLUMNS.map(([header]) => ({ value: header }))} />
      </div>
      {PRODUCTS.map((product, index) => {
        const status = getProductStatus(product);
        const cells = [
          String(index + 1).padStart(3, '0'),
          product.name,
          product.sku,
          product.category.name.slice(0, 3).toUpperCase(),
          product.warehouse,
          { value: product.stock, className: status.sheetClass },
          product.reserved,
          product.minStock,
          product.salePrice,
          product.stock * product.salePrice,
          product.supplier,
          product.location,
          { value: status.sheetLabel, className: status.sheetClass },
          product.date,
          product.notes,
        ];

        return (
          <div key={product.id} className="sheet-row">
            <SheetCells cells={cells.map((cell) => (typeof cell === 'object' ? cell : { value: cell }))} />
          </div>
        );
      })}
    </div>
  );
}

// "Después": la pantalla real de Productos, armada con el menú, las columnas y los estilos de la aplicación
export function NexoraPreview() {
  return (
    <div className="flex h-full bg-slate-100 text-slate-900 text-left pointer-events-none" style={{ zoom: 0.8 }} aria-hidden="true">
      <div className="hidden md:block w-56 h-full bg-slate-900 shrink-0 py-5 px-3 overflow-hidden">
        <div className="text-white text-lg px-2 mb-5"><Logo /></div>
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="text-[11px] uppercase tracking-wide text-slate-500 px-3 mb-1">{group.label}</div>
            {group.items.map((item) => (
              <div
                key={item.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-r-lg mb-0.5 text-sm border-l-4 ${
                  item.to === '/products' ? 'bg-teal-700/20 text-teal-300 border-teal-400' : 'text-slate-300 border-transparent'
                }`}
              >
                <span className="text-xs w-3 text-center">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center gap-3">
          <span className="text-sm font-semibold text-slate-900">Empresa Demo</span>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-sm text-slate-700 leading-tight">Admin Demo</div>
              <div className="text-xs text-slate-400 leading-tight">Administrador</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-teal-700 text-white text-xs font-medium flex items-center justify-center">A</div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="text-2xl font-semibold text-slate-900">Productos</div>
              <div className="text-sm text-slate-500 mt-1">Catálogo de lo que compras y vendes</div>
            </div>
            <div className="ui-btn shrink-0">+ Nuevo producto</div>
          </div>

          <div className="ui-card overflow-hidden">
            <table className="ui-table">
              <thead>
                <tr>{productColumns.map((column) => <th key={column.label}>{column.label}</th>)}</tr>
              </thead>
              <tbody>
                {PRODUCTS.map((product) => (
                  <tr key={product.id}>
                    {productColumns.map((column) => (
                      <td key={column.label} className={column.strong ? '!text-slate-900 font-medium' : ''}>
                        {column.render ? column.render(product) : product[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
