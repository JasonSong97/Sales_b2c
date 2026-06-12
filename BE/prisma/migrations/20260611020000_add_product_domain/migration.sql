-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "productName" TEXT NOT NULL,
    "productPrice" INTEGER NOT NULL,
    "productCategoryId" UUID NOT NULL,
    "productStatusId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "categoryName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductStatus" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "statusName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMemoLog" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "memoType" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductMemoLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductUserPrivateMemoLog" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "memoCiphertext" TEXT NOT NULL,
    "memoKeyVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductUserPrivateMemoLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_userId_createdAt_idx" ON "Product"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Product_userId_productName_idx" ON "Product"("userId", "productName");

-- CreateIndex
CREATE INDEX "Product_userId_productCategoryId_idx" ON "Product"("userId", "productCategoryId");

-- CreateIndex
CREATE INDEX "Product_userId_productStatusId_idx" ON "Product"("userId", "productStatusId");

-- CreateIndex
CREATE INDEX "ProductCategory_userId_idx" ON "ProductCategory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_userId_categoryName_key" ON "ProductCategory"("userId", "categoryName");

-- CreateIndex
CREATE INDEX "ProductStatus_userId_idx" ON "ProductStatus"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductStatus_userId_statusName_key" ON "ProductStatus"("userId", "statusName");

-- CreateIndex
CREATE INDEX "ProductMemoLog_productId_createdAt_idx" ON "ProductMemoLog"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductMemoLog_userId_productId_idx" ON "ProductMemoLog"("userId", "productId");

-- CreateIndex
CREATE INDEX "ProductUserPrivateMemoLog_productId_createdAt_idx" ON "ProductUserPrivateMemoLog"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductUserPrivateMemoLog_userId_productId_idx" ON "ProductUserPrivateMemoLog"("userId", "productId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productStatusId_fkey" FOREIGN KEY ("productStatusId") REFERENCES "ProductStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductStatus" ADD CONSTRAINT "ProductStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMemoLog" ADD CONSTRAINT "ProductMemoLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMemoLog" ADD CONSTRAINT "ProductMemoLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUserPrivateMemoLog" ADD CONSTRAINT "ProductUserPrivateMemoLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUserPrivateMemoLog" ADD CONSTRAINT "ProductUserPrivateMemoLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
