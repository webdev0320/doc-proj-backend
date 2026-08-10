-- CreateTable
CREATE TABLE "document_checklist_results" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "checklistItemId" TEXT NOT NULL,
    "answer" TEXT,
    "comment" TEXT,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_checklist_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_checklist_results_documentId_checklistItemId_key" ON "document_checklist_results"("documentId", "checklistItemId");

-- AddForeignKey
ALTER TABLE "document_checklist_results" ADD CONSTRAINT "document_checklist_results_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_checklist_results" ADD CONSTRAINT "document_checklist_results_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "checklist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
