/*
  Warnings:

  - A unique constraint covering the columns `[id,productId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Transaction_id_productId_key" ON "Transaction"("id", "productId");
