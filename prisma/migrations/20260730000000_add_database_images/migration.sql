CREATE TABLE "ImageAsset" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT,
    "promotionPostId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageAsset_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ImageAsset_productId_order_idx" ON "ImageAsset"("productId", "order");
CREATE INDEX "ImageAsset_promotionPostId_order_idx" ON "ImageAsset"("promotionPostId", "order");

ALTER TABLE "ImageAsset"
ADD CONSTRAINT "ImageAsset_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ImageAsset"
ADD CONSTRAINT "ImageAsset_promotionPostId_fkey"
FOREIGN KEY ("promotionPostId") REFERENCES "PromotionPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
