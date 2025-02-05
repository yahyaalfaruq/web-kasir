/*
  Warnings:

  - You are about to drop the column `quantity` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "quantity",
DROP COLUMN "total";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "quantity" DROP DEFAULT;
