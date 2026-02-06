-- AlterTable: add stock columns to Product (SQLite: no ALTER COLUMN, so we use table rename + recreate for new columns)
-- SQLite does not support adding columns with DEFAULT easily in older versions; 3.35+ supports it.
-- Prisma typically uses ALTER TABLE ADD COLUMN for SQLite when adding nullable or default columns.

ALTER TABLE "Product" ADD COLUMN "stockOnHand" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "reorderLevel" INTEGER NOT NULL DEFAULT 0;

-- CreateTable InventoryMovement
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "deltaQty" INTEGER NOT NULL,
    "reason" TEXT,
    "orderId" TEXT,
    "reconciliationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "InventoryMovement_productId_idx" ON "InventoryMovement"("productId");
CREATE INDEX "InventoryMovement_createdAt_idx" ON "InventoryMovement"("createdAt");
