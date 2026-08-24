-- CreateTable
CREATE TABLE "extracted_values" (
    "id" TEXT NOT NULL,
    "blobId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "extractedValue" TEXT NOT NULL,
    "qaValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extracted_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "extracted_values_pageId_fieldName_key" ON "extracted_values"("pageId", "fieldName");

-- AddForeignKey
ALTER TABLE "extracted_values" ADD CONSTRAINT "extracted_values_blobId_fkey" FOREIGN KEY ("blobId") REFERENCES "blobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_values" ADD CONSTRAINT "extracted_values_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: Remove extractedData column from pages
ALTER TABLE "pages" DROP COLUMN "extractedData";
