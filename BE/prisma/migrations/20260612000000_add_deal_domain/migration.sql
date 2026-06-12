-- CreateTable
CREATE TABLE "Deal" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dealName" TEXT NOT NULL,
    "dealCost" INTEGER NOT NULL,
    "companyId" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "dealStatus" TEXT NOT NULL,
    "expectedEndDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealFollowingActionLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "followingAction" TEXT NOT NULL,
    "checkComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealFollowingActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealMemoLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "memoType" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealMemoLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Deal_userId_createdAt_idx" ON "Deal"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Deal_userId_dealName_idx" ON "Deal"("userId", "dealName");

-- CreateIndex
CREATE INDEX "Deal_userId_dealStatus_idx" ON "Deal"("userId", "dealStatus");

-- CreateIndex
CREATE INDEX "Deal_userId_expectedEndDate_idx" ON "Deal"("userId", "expectedEndDate");

-- CreateIndex
CREATE INDEX "Deal_userId_dealCost_idx" ON "Deal"("userId", "dealCost");

-- CreateIndex
CREATE INDEX "Deal_companyId_idx" ON "Deal"("companyId");

-- CreateIndex
CREATE INDEX "Deal_contactId_idx" ON "Deal"("contactId");

-- CreateIndex
CREATE INDEX "Deal_productId_idx" ON "Deal"("productId");

-- CreateIndex
CREATE INDEX "DealFollowingActionLog_dealId_createdAt_idx" ON "DealFollowingActionLog"("dealId", "createdAt");

-- CreateIndex
CREATE INDEX "DealFollowingActionLog_userId_dealId_idx" ON "DealFollowingActionLog"("userId", "dealId");

-- CreateIndex
CREATE INDEX "DealFollowingActionLog_userId_checkComplete_idx" ON "DealFollowingActionLog"("userId", "checkComplete");

-- CreateIndex
CREATE INDEX "DealMemoLog_dealId_createdAt_idx" ON "DealMemoLog"("dealId", "createdAt");

-- CreateIndex
CREATE INDEX "DealMemoLog_userId_dealId_idx" ON "DealMemoLog"("userId", "dealId");

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealFollowingActionLog" ADD CONSTRAINT "DealFollowingActionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealFollowingActionLog" ADD CONSTRAINT "DealFollowingActionLog_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealMemoLog" ADD CONSTRAINT "DealMemoLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealMemoLog" ADD CONSTRAINT "DealMemoLog_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
