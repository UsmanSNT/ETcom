-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "titleKo" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionKo" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "categoryKo" TEXT,
    "categoryEn" TEXT,
    "price" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PromotionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionPost" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "titleKo" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "contentKo" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInquiry" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "reply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageVisit" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'ko',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "Product_isPublished_order_idx" ON "Product"("isPublished", "order");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionCategory_slug_key" ON "PromotionCategory"("slug");

-- CreateIndex
CREATE INDEX "PromotionPost_categoryId_isPublished_publishedAt_idx" ON "PromotionPost"("categoryId", "isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "ContactInquiry_type_status_createdAt_idx" ON "ContactInquiry"("type", "status", "createdAt");

-- CreateIndex
CREATE INDEX "PageVisit_path_createdAt_idx" ON "PageVisit"("path", "createdAt");

-- AddForeignKey
ALTER TABLE "PromotionPost" ADD CONSTRAINT "PromotionPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PromotionCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
