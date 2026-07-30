ALTER TABLE "Product"
ADD COLUMN "slug" TEXT,
ADD COLUMN "canonicalUrl" TEXT,
ADD COLUMN "ogTitle" TEXT,
ADD COLUMN "ogDescription" TEXT,
ADD COLUMN "noIndex" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "PromotionPost"
ADD COLUMN "slug" TEXT,
ADD COLUMN "canonicalUrl" TEXT,
ADD COLUMN "ogTitle" TEXT,
ADD COLUMN "ogDescription" TEXT,
ADD COLUMN "noIndex" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX "PromotionPost_slug_key" ON "PromotionPost"("slug");
