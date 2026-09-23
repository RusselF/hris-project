/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `leave_types` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "leave_types_name_key" ON "leave_types"("name");
