-- AlterTable: Remove stockOnHand and reorderLevel from Product (anti-theft focus: catalog only).
-- SQLite 3.35+ supports DROP COLUMN.
PRAGMA foreign_keys=off;

CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Product" ("id", "name", "category", "unit", "price", "status", "createdAt", "updatedAt")
SELECT "id", "name", "category", "unit", "price", "status", "createdAt", "updatedAt" FROM "Product";

DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";

PRAGMA foreign_keys=on;
