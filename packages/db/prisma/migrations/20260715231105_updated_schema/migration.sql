/*
  Warnings:

  - You are about to alter the column `value` on the `AnomalyAlert` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,4)`.
  - You are about to alter the column `mean` on the `AnomalyAlert` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,4)`.
  - You are about to alter the column `stddev` on the `AnomalyAlert` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,4)`.
  - You are about to alter the column `value` on the `Metric` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,4)`.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teamId,slug]` on the table `Dashboard` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AnomalyAlert" ALTER COLUMN "value" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "mean" SET DATA TYPE DECIMAL(20,4),
ALTER COLUMN "stddev" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "Dashboard" ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Metric" ALTER COLUMN "value" SET DEFAULT 0.0,
ALTER COLUMN "value" SET DATA TYPE DECIMAL(20,4);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- CreateIndex
CREATE UNIQUE INDEX "Dashboard_teamId_slug_key" ON "Dashboard"("teamId", "slug");
