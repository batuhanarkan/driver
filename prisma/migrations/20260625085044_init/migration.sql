-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('CHAUFFEUR', 'TRANSFER', 'TOUR', 'GUIDE', 'GREETING');

-- CreateEnum
CREATE TYPE "VehicleClass" AS ENUM ('EKONOMI', 'BUSINESS', 'VAN', 'LUKS');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('BEKLEMEDE', 'ONAYLANDI', 'DEVAM_EDIYOR', 'TAMAMLANDI', 'IPTAL');

-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('ILETISIM', 'KURUMSAL', 'KARIYER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sifreHash" TEXT NOT NULL,
    "telefon" TEXT,
    "rol" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kategori" "ServiceCategory" NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "kapakGorsel" TEXT,
    "gorseller" TEXT[],
    "temelFiyat" INTEGER NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "sinif" "VehicleClass" NOT NULL,
    "kapasite" INTEGER NOT NULL,
    "gorsel" TEXT,
    "fiyat" INTEGER NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "siparisNo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "durum" "OrderStatus" NOT NULL DEFAULT 'BEKLEMEDE',
    "toplamTutar" INTEGER NOT NULL,
    "not" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "detay" JSONB NOT NULL,
    "birimFiyat" INTEGER NOT NULL,
    "adet" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "gorsel" TEXT,
    "indirimYuzde" INTEGER NOT NULL DEFAULT 0,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "tip" "LeadType" NOT NULL,
    "ad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefon" TEXT,
    "mesaj" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Order_siparisNo_key" ON "Order"("siparisNo");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
