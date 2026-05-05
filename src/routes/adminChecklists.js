const express = require('express');
const { prisma } = require('../lib/prisma');

const router = express.Router();

// GET /api/admin/checklists — list all generic checklist items
router.get('/', async (req, res) => {
  const items = await prisma.checklist.findMany({
    orderBy: { createdAt: 'asc' }
  });
  res.json({ success: true, data: items });
});

// POST /api/admin/checklists — add a new item
router.post('/', async (req, res) => {
  const { item } = req.body;
  const newItem = await prisma.checklist.create({
    data: { item }
  });
  res.json({ success: true, data: newItem });
});

// PATCH /api/admin/checklists/:id — update an item
router.patch('/:id', async (req, res) => {
  const { item } = req.body;
  const updated = await prisma.checklist.update({
    where: { id: req.params.id },
    data: { item }
  });
  res.json({ success: true, data: updated });
});

// DELETE /api/admin/checklists/:id — delete an item
router.delete('/:id', async (req, res) => {
  await prisma.checklist.delete({
    where: { id: req.params.id }
  });
  res.json({ success: true });
});

module.exports = router;
