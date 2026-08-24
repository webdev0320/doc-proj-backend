const express = require('express');
const { prisma } = require('../lib/prisma');

const router = express.Router();

// GET /api/documents/:id/extracted-values — fetch extracted values for a document
router.get('/:id/extracted-values', async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      select: { id: true, blobId: true, documentType: true, name: true },
    });
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Get all pageIds belonging to this document
    const docPages = await prisma.documentPage.findMany({
      where: { documentId: req.params.id },
      select: { pageId: true },
    });
    const pageIds = docPages.map(dp => dp.pageId);

    // Fetch extracted values for those pages
    const extractedValues = await prisma.extractedValue.findMany({
      where: { pageId: { in: pageIds } },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      data: {
        documentId: document.id,
        documentName: document.documentType || document.name,
        extractedValues,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/documents/split — split pages into a new document
router.post('/split', async (req, res) => {
  const { blobId, pageIds, documentType, name } = req.body;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Remove these pages from any existing documents in this blob
    await tx.documentPage.deleteMany({
      where: {
        pageId: { in: pageIds },
        document: { blobId }
      }
    });

    // 2. Create the new document
    const doc = await tx.document.create({
      data: {
        blobId,
        userId: req.user.id,
        name: name || `Split Document`,
        documentType: documentType || 'Unknown',
        status: 'AI_CLASSIFIED',
      },
    });

    // 3. Attach pages to the new document
    await tx.documentPage.createMany({
      data: pageIds.map((pageId, idx) => ({
        documentId: doc.id,
        pageId,
        order: idx,
      })),
    });

    // 4. Update extractedValues documentName for affected pages
    await tx.extractedValue.updateMany({
      where: { pageId: { in: pageIds } },
      data: { documentName: documentType || 'Unknown' },
    });

    // 5. Cleanup: Delete documents that no longer have any pages
    const emptyDocs = await tx.document.findMany({
      where: {
        blobId,
        pages: { none: {} }
      }
    });

    if (emptyDocs.length > 0) {
      await tx.document.deleteMany({
        where: { id: { in: emptyDocs.map(d => d.id) } }
      });
    }

    await tx.auditLog.create({
      data: {
        blobId,
        documentId: doc.id,
        action: 'SPLIT',
        payload: JSON.stringify({ pageIds, documentType }),
      },
    });

    // Fetch all documents for this blob to keep frontend in sync
    const allDocs = await tx.document.findMany({
      where: { blobId },
      include: {
        pages: {
          include: { page: { include: { extractedValues: true } } },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' }
    });

    return { doc, allDocs };
  });

  res.status(201).json({ 
    success: true, 
    data: result.doc, 
    allDocuments: result.allDocs 
  });
});

// POST /api/documents/merge — merge two documents into one
router.post('/merge', async (req, res) => {
  const { sourceDocumentId, targetDocumentId, blobId } = req.body;

  await prisma.$transaction(async (tx) => {
    // Get source pages
    const sourcePages = await tx.documentPage.findMany({
      where: { documentId: sourceDocumentId },
      orderBy: { order: 'asc' },
    });

    // Get current max order in target
    const targetPages = await tx.documentPage.findMany({
      where: { documentId: targetDocumentId },
      orderBy: { order: 'asc' },
    });
    const maxOrder = targetPages.length ? targetPages[targetPages.length - 1].order : -1;

    // Get target document to know the new documentName
    const targetDoc = await tx.document.findUnique({ where: { id: targetDocumentId } });

    // Re-parent source pages to target
    for (let i = 0; i < sourcePages.length; i++) {
      await tx.documentPage.update({
        where: { id: sourcePages[i].id },
        data: { documentId: targetDocumentId, order: maxOrder + 1 + i },
      });
    }

    // Update extractedValues documentName for source pages
    const sourcePageIds = sourcePages.map(sp => sp.pageId);
    if (sourcePageIds.length > 0 && targetDoc) {
      await tx.extractedValue.updateMany({
        where: { pageId: { in: sourcePageIds } },
        data: { documentName: targetDoc.documentType || targetDoc.name },
      });
    }

    // Delete the now-empty source document
    await tx.document.delete({ where: { id: sourceDocumentId } });

    await tx.auditLog.create({
      data: {
        blobId,
        documentId: targetDocumentId,
        action: 'MERGE',
        payload: JSON.stringify({ sourceDocumentId, targetDocumentId }),
      },
    });
  });

  const merged = await prisma.document.findUnique({
    where: { id: targetDocumentId },
    include: {
      pages: {
        include: { page: { include: { extractedValues: true } } },
        orderBy: { order: 'asc' },
      },
    },
  });

  res.json({ success: true, data: merged });
});

// PATCH /api/documents/:id/verify — mark document as human verified
router.patch('/:id/verify', async (req, res) => {
  const { documentType, name, blobId, extractedData } = req.body;
  const doc = await prisma.$transaction(async (tx) => {
    const updated = await tx.document.update({
      where: { id: req.params.id },
      data: {
        status: 'HUMAN_VERIFIED',
        ...(documentType && { documentType }),
        ...(name && { name }),
      },
      include: {
        pages: {
          include: { page: { include: { extractedValues: true } } },
          orderBy: { order: 'asc' },
        },
      },
    });

    // Update extracted values if provided
    if (extractedData && Object.keys(extractedData).length > 0) {
      const firstPage = updated.pages[0];
      if (firstPage) {
        const pageId = firstPage.pageId;
        const pageRecord = await tx.page.findUnique({ where: { id: pageId } });

        // Delete existing and re-insert
        await tx.extractedValue.deleteMany({ where: { pageId } });
        await tx.extractedValue.createMany({
          data: Object.entries(extractedData).map(([fieldName, extractedValue]) => ({
            blobId: updated.blobId,
            pageId,
            documentName: documentType || updated.documentType || 'UNCLASSIFIED',
            fieldName,
            extractedValue: extractedValue != null ? String(extractedValue) : '',
          })),
        });
      }
    }

    // Recording corrections for the feedback loop
    if (documentType) {
      for (const dp of updated.pages) {
        if (dp.page.aiLabel !== documentType) {
          await tx.classificationCorrection.create({
            data: {
              blobId: updated.blobId,
              originalAiLabel: dp.page.aiLabel || 'UNKNOWN',
              finalHumanLabel: documentType,
              pageThumbnailPath: dp.page.s3Path
            }
          });
        }
      }
    }

    await tx.auditLog.create({
      data: {
        blobId: blobId || updated.blobId,
        documentId: updated.id,
        action: 'VERIFY',
        payload: JSON.stringify({ documentType, name }),
      },
    });

    // 4. Auto-complete blob if all docs are verified
    const allDocs = await tx.document.findMany({
      where: { blobId: updated.blobId }
    });
    
    const allVerified = allDocs.every(d => d.status === 'HUMAN_VERIFIED');
    if (allVerified) {
      await tx.blob.update({
        where: { id: updated.blobId },
        data: { status: 'COMPLETED', completedAt: new Date() }
      });
    }

    return updated;
  });

  res.json({ success: true, data: doc });
});

// PATCH /api/documents/:id/checklists
router.patch('/:id/checklists', async (req, res) => {
  const { checklists } = req.body;
  const doc = await prisma.document.update({
    where: { id: req.params.id },
    data: { checklists }
  });
  res.json({ success: true, data: doc });
});

// PATCH /api/documents/:id/checklist-answers — save Yes/No answers for the missing document checklist
router.patch('/:id/checklist-answers', async (req, res) => {
  const { answers } = req.body;
  const doc = await prisma.document.update({
    where: { id: req.params.id },
    data: { checklists: Array.isArray(answers) ? answers : [] }
  });
  res.json({ success: true, data: doc });
});

// GET /api/documents/:id/checklist-results — results (answer/comment/flag) for a document's checklist
router.get('/:id/checklist-results', async (req, res) => {
  const results = await prisma.documentChecklistResult.findMany({
    where: { documentId: req.params.id },
    include: { checklistItem: true },
    orderBy: { checklistItem: { createdAt: 'asc' } }
  });
  res.json({ success: true, data: results });
});

// PATCH /api/documents/:id/checklist-results — upsert results for a document's checklist
router.patch('/:id/checklist-results', async (req, res) => {
  const { results } = req.body;
  if (!Array.isArray(results)) {
    return res.status(400).json({ success: false, error: 'results must be an array' });
  }
  await prisma.$transaction(
    results.map((r) =>
      prisma.documentChecklistResult.upsert({
        where: {
          documentId_checklistItemId: {
            documentId: req.params.id,
            checklistItemId: r.checklistItemId,
          },
        },
        create: {
          documentId: req.params.id,
          checklistItemId: r.checklistItemId,
          answer: r.answer || null,
          comment: r.comment || null,
          flagged: !!r.flagged,
        },
        update: {
          answer: r.answer || null,
          comment: r.comment || null,
          flagged: !!r.flagged,
        },
      })
    )
  );
  const updated = await prisma.documentChecklistResult.findMany({
    where: { documentId: req.params.id },
    include: { checklistItem: true },
    orderBy: { checklistItem: { createdAt: 'asc' } }
  });
  res.json({ success: true, data: updated });
});

// PATCH /api/documents/:id/rename
router.patch('/:id/rename', async (req, res) => {
  const { name, documentType, blobId } = req.body;
  const doc = await prisma.$transaction(async (tx) => {
    const updated = await tx.document.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(documentType && { documentType }),
      },
    });

    // Update extractedValues documentName if documentType changed
    if (documentType) {
      const docPages = await tx.documentPage.findMany({
        where: { documentId: req.params.id },
      });
      const pageIds = docPages.map(dp => dp.pageId);
      if (pageIds.length > 0) {
        await tx.extractedValue.updateMany({
          where: { pageId: { in: pageIds } },
          data: { documentName: documentType },
        });
      }
    }

    await tx.auditLog.create({
      data: {
        blobId: blobId || updated.blobId,
        documentId: updated.id,
        action: 'RENAME',
        payload: JSON.stringify({ name, documentType }),
      },
    });

    return updated;
  });

  res.json({ success: true, data: doc });
});

module.exports = router;

