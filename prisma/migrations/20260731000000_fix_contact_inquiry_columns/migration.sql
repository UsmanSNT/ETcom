-- The init migration file was edited after it had already been deployed, so
-- Prisma will never re-run it and these columns can be missing in production.
-- These statements are idempotent: they do nothing when the columns already exist.

ALTER TABLE "ContactInquiry" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'general';
ALTER TABLE "ContactInquiry" ADD COLUMN IF NOT EXISTS "company" TEXT;
ALTER TABLE "ContactInquiry" ADD COLUMN IF NOT EXISTS "reply" TEXT;
ALTER TABLE "ContactInquiry" ADD COLUMN IF NOT EXISTS "repliedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "ContactInquiry_type_status_createdAt_idx"
  ON "ContactInquiry"("type", "status", "createdAt");
