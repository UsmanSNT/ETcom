ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Product_isPublished_isFeatured_order_idx"
ON "Product"("isPublished", "isFeatured", "order");
