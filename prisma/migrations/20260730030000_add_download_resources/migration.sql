CREATE TABLE "DownloadResource" (
  "id" TEXT NOT NULL,
  "titleKo" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "data" BYTEA NOT NULL,
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DownloadResource_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DownloadResource_isPublished_order_publishedAt_idx"
ON "DownloadResource"("isPublished", "order", "publishedAt");
