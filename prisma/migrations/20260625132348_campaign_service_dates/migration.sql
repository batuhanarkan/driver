-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "baslangic" TIMESTAMP(3),
ADD COLUMN     "bitis" TIMESTAMP(3),
ADD COLUMN     "serviceId" TEXT;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
