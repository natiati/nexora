-- Corrección 1: Alinea el default de invoice.status con el servicio (siempre crea 'issued')
ALTER TABLE "invoices" ALTER COLUMN "status" SET DEFAULT 'issued';

-- Corrección 2: Alinea el default de purchase_orders.status con el servicio (siempre crea 'ordered')
ALTER TABLE "purchase_orders" ALTER COLUMN "status" SET DEFAULT 'ordered';

-- Corrección 3: Agrega restricción única en stock_levels para (product_id, warehouse_id)
-- Garantiza integridad a nivel de base de datos; el advisory lock sigue para serializar operaciones
CREATE UNIQUE INDEX IF NOT EXISTS "stock_levels_product_id_warehouse_id_key"
  ON "stock_levels"("product_id", "warehouse_id");
