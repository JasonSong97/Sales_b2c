-- CreateTable
CREATE TABLE "DealProduct" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealProduct_pkey" PRIMARY KEY ("id")
);

-- Backfill existing one-product deal rows into the join table before dropping Deal.productId.
INSERT INTO "DealProduct" ("id", "userId", "dealId", "productId", "createdAt", "updatedAt")
SELECT
    (
        SUBSTRING(MD5("id"::text || "productId"::text) FROM 1 FOR 8) || '-' ||
        SUBSTRING(MD5("id"::text || "productId"::text) FROM 9 FOR 4) || '-' ||
        SUBSTRING(MD5("id"::text || "productId"::text) FROM 13 FOR 4) || '-' ||
        SUBSTRING(MD5("id"::text || "productId"::text) FROM 17 FOR 4) || '-' ||
        SUBSTRING(MD5("id"::text || "productId"::text) FROM 21 FOR 12)
    )::uuid,
    "userId",
    "id",
    "productId",
    "createdAt",
    "updatedAt"
FROM "Deal";

-- CreateIndex
CREATE UNIQUE INDEX "DealProduct_dealId_productId_key" ON "DealProduct"("dealId", "productId");

-- CreateIndex
CREATE INDEX "DealProduct_userId_dealId_idx" ON "DealProduct"("userId", "dealId");

-- CreateIndex
CREATE INDEX "DealProduct_userId_productId_idx" ON "DealProduct"("userId", "productId");

-- CreateIndex
CREATE INDEX "DealProduct_productId_idx" ON "DealProduct"("productId");

-- AddForeignKey
ALTER TABLE "DealProduct" ADD CONSTRAINT "DealProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealProduct" ADD CONSTRAINT "DealProduct_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealProduct" ADD CONSTRAINT "DealProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_productId_fkey";

-- DropIndex
DROP INDEX "Deal_productId_idx";

-- AlterTable
ALTER TABLE "Deal" DROP COLUMN "productId";
