-- AlterTable
ALTER TABLE "extracted_values" ADD COLUMN "documentId" TEXT;

-- AddForeignKey
ALTER TABLE "extracted_values" ADD CONSTRAINT "extracted_values_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: link existing extracted_values to their correct documents
-- by matching pageId through document_pages
UPDATE "extracted_values" ev
SET "documentId" = dp."documentId"
FROM "document_pages" dp
WHERE ev."pageId" = dp."pageId"
  AND ev."documentId" IS NULL;
