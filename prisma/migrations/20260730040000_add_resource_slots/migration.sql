ALTER TABLE "DownloadResource" ADD COLUMN "slot" TEXT;
CREATE UNIQUE INDEX "DownloadResource_slot_key" ON "DownloadResource"("slot");
