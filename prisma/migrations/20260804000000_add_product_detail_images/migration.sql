ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "purchaseUrl" TEXT;
ALTER TABLE "ImageAsset" ADD COLUMN IF NOT EXISTS "detailProductId" TEXT;

CREATE INDEX IF NOT EXISTS "ImageAsset_detailProductId_order_idx"
ON "ImageAsset"("detailProductId", "order");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ImageAsset_detailProductId_fkey'
  ) THEN
    ALTER TABLE "ImageAsset"
    ADD CONSTRAINT "ImageAsset_detailProductId_fkey"
    FOREIGN KEY ("detailProductId") REFERENCES "Product"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
