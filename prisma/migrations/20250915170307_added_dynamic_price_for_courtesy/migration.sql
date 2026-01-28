-- AlterTable
ALTER TABLE "courtesy_invitations" ADD COLUMN     "priceTierId" TEXT;

-- AddForeignKey
ALTER TABLE "courtesy_invitations" ADD CONSTRAINT "courtesy_invitations_priceTierId_fkey" FOREIGN KEY ("priceTierId") REFERENCES "price_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
