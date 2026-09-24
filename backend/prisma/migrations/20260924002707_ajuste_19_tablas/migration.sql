/*
  Warnings:

  - You are about to drop the column `parent_id` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `customer_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `purchase_orders` table. All the data in the column will be lost.
  - You are about to drop the column `warehouse_id` on the `purchase_orders` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `sales_orders` table. All the data in the column will be lost.
  - You are about to drop the column `warehouse_id` on the `sales_orders` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `stock_levels` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `user_company_roles` table. All the data in the column will be lost.
  - You are about to drop the `customer_contacts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoice_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_prices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `category_id` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "customer_contacts" DROP CONSTRAINT "customer_contacts_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "customer_interactions" DROP CONSTRAINT "customer_interactions_company_id_fkey";

-- DropForeignKey
ALTER TABLE "customer_interactions" DROP CONSTRAINT "customer_interactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_company_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_created_by_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_company_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_created_by_fkey";

-- DropForeignKey
ALTER TABLE "product_prices" DROP CONSTRAINT "product_prices_company_id_fkey";

-- DropForeignKey
ALTER TABLE "product_prices" DROP CONSTRAINT "product_prices_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "product_prices" DROP CONSTRAINT "product_prices_product_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_company_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_order_items" DROP CONSTRAINT "purchase_order_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_company_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_created_by_fkey";

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_warehouse_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_fkey";

-- DropForeignKey
ALTER TABLE "sales_order_items" DROP CONSTRAINT "sales_order_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "sales_orders" DROP CONSTRAINT "sales_orders_company_id_fkey";

-- DropForeignKey
ALTER TABLE "sales_orders" DROP CONSTRAINT "sales_orders_created_by_fkey";

-- DropForeignKey
ALTER TABLE "sales_orders" DROP CONSTRAINT "sales_orders_warehouse_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_levels" DROP CONSTRAINT "stock_levels_company_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_levels" DROP CONSTRAINT "stock_levels_product_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_company_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_created_by_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_product_id_fkey";

-- DropForeignKey
ALTER TABLE "units" DROP CONSTRAINT "units_company_id_fkey";

-- DropForeignKey
ALTER TABLE "user_company_roles" DROP CONSTRAINT "user_company_roles_company_id_fkey";

-- DropIndex
DROP INDEX "invoices_company_id_invoice_number_key";

-- DropIndex
DROP INDEX "products_company_id_sku_key";

-- DropIndex
DROP INDEX "purchase_orders_company_id_order_number_key";

-- DropIndex
DROP INDEX "sales_orders_company_id_order_number_key";

-- DropIndex
DROP INDEX "stock_levels_product_id_warehouse_id_key";

-- DropIndex
DROP INDEX "user_company_roles_user_id_company_id_key";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "parent_id";

-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "currency" SET DATA TYPE VARCHAR(3);

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "company_id",
DROP COLUMN "customer_id";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "company_id";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "company_id",
ALTER COLUMN "category_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "purchase_orders" DROP COLUMN "company_id",
DROP COLUMN "warehouse_id";

-- AlterTable
ALTER TABLE "sales_orders" DROP COLUMN "company_id",
DROP COLUMN "warehouse_id";

-- AlterTable
ALTER TABLE "stock_levels" DROP COLUMN "company_id";

-- AlterTable
ALTER TABLE "stock_movements" DROP COLUMN "company_id";

-- AlterTable
ALTER TABLE "units" DROP COLUMN "company_id";

-- AlterTable
ALTER TABLE "user_company_roles" DROP COLUMN "company_id";

-- DropTable
DROP TABLE "customer_contacts";

-- DropTable
DROP TABLE "invoice_items";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "product_prices";

-- DropTable
DROP TABLE "role_permissions";

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
