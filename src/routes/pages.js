const express = require('express');
const { prisma } = require('../lib/prisma');

const router = express.Router();

// PATCH /api/pages/:id — update ai_label, rotation, isFlagged
router.patch('/:id', async (req, res) => {
  const { aiLabel, rotation, isFlagged } = req.body;
  const page = await prisma.page.update({
    where: { id: req.params.id },
    data: {
      ...(aiLabel !== undefined && { aiLabel }),
      ...(rotation !== undefined && { rotation }),
      ...(isFlagged !== undefined && { isFlagged }),
    },
  });
  res.json({ success: true, data: page });
});

// DELETE /api/pages/:id — remove a page
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) return res.status(404).json({ error: 'Page not found' });

    const blobId = page.blobId;

    await prisma.page.delete({ where: { id } });

    // Update blob page count
    const count = await prisma.page.count({ where: { blobId } });
    await prisma.blob.update({
      where: { id: blobId },
      data: { pageCount: count }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
