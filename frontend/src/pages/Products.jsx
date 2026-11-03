import { categoriesApi, productsApi, unitsApi } from '../api/resources';
import CrudPage from '../components/CrudPage';
import { productColumns } from '../components/productColumns';
import { useOptions } from '../hooks/useList';

export default function Products() {
  const categories = useOptions(categoriesApi);
  const units = useOptions(unitsApi);

  const fields = [
    { name: 'sku', label: 'SKU', required: true, maxLength: 60 },
    { name: 'barcode', label: 'Código de barras', maxLength: 50 },
    { name: 'name', label: 'Nombre', required: true, maxLength: 200, full: true },
    { name: 'categoryId', label: 'Categoría', type: 'select', required: true, options: categories.map((c) => ({ value: c.id, label: c.name })) },
    { name: 'unitId', label: 'Unidad', type: 'select', required: true, options: units.map((u) => ({ value: u.id, label: `${u.name} (${u.abbreviation})` })) },
    { name: 'costPrice', label: 'Costo', type: 'number', required: true },
    { name: 'salePrice', label: 'Precio de venta', type: 'number', required: true },
    { name: 'minStock', label: 'Stock mínimo', type: 'number', required: true, defaultValue: 0 },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    { name: 'trackStock', label: 'Controla inventario (desmarcar para servicios)', type: 'checkbox', defaultValue: true, full: true },
    { name: 'isActive', label: 'Activo', type: 'checkbox', editOnly: true },
  ];

  return (
    <CrudPage
      title="Productos"
      subtitle="Catálogo de lo que compras y vendes"
      api={productsApi}
      columns={productColumns}
      fields={fields}
      createLabel="Nuevo producto"
      searchPlaceholder="Buscar por nombre, SKU o código de barras"
    />
  );
}
