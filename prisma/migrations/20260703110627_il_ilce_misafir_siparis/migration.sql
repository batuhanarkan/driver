/*
  Warnings:

  - You are about to drop the `City` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PasswordResetToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CityToService` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `musteriAd` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `musteriEmail` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `musteriTelefon` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_cityId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "_CityToService" DROP CONSTRAINT "_CityToService_A_fkey";

-- DropForeignKey
ALTER TABLE "_CityToService" DROP CONSTRAINT "_CityToService_B_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "musteriAd" TEXT NOT NULL,
ADD COLUMN     "musteriEmail" TEXT NOT NULL,
ADD COLUMN     "musteriTelefon" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- DropTable
DROP TABLE "City";

-- DropTable
DROP TABLE "Location";

-- DropTable
DROP TABLE "PasswordResetToken";

-- DropTable
DROP TABLE "_CityToService";

-- DropEnum
DROP TYPE "LocationType";

-- CreateTable
CREATE TABLE "Province" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plaka" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "provinceId" TEXT NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Province_slug_key" ON "Province"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Province_plaka_key" ON "Province"("plaka");

-- CreateIndex
CREATE UNIQUE INDEX "District_provinceId_ad_key" ON "District"("provinceId", "ad");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE CASCADE ON UPDATE CASCADE;
