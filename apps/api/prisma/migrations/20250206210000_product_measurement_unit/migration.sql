-- AlterTable: Rename Product.unit to measurementUnit (construction measurement units).
-- SQLite 3.25+ supports RENAME COLUMN.
ALTER TABLE "Product" RENAME COLUMN "unit" TO "measurementUnit";
