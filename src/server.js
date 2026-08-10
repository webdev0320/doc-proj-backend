require('dotenv').config();
require('express-async-errors');

// Allow self-signed certificates for engine calls
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Safety fallback for demo
process.env.JWT_SECRET = process.env.JWT_SECRET || 'demo-safety-secret-123';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { logger } = require('./utils/logger');
const { authMiddleware } = require('./middleware/auth');
const { initSftpPoller } = require('./services/sftpPoller');

const authRouter = require('./routes/auth');
const uploadRouter = require('./routes/upload');
const blobsRouter = require('./routes/blobs');
const pagesRouter = require('./routes/pages');
const documentsRouter = require('./routes/documents');
const exportRouter = require('./routes/export');
const adminRouter = require('./routes/admin');
const demoRouter = require('./routes/demo');
const storageProxyRouter = require('./routes/storageProxy');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;
const path = require('path');

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://doc.streamline-global.com',
  'https://doc-backend.streamline-global.com',
  // Keep old Vercel domains in case they're still in use
  'https://doc-proj-backend.vercel.app',
  'https://mortgage-project-ivory.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server (no origin) and whitelisted origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// Explicitly handle preflight for all routes (needed on Vercel)
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(cookieParser());

// Serve static files from storage
app.use('/storage', express.static(path.join(__dirname, '../../storage')));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'idp-backend' }));

// Routes
app.use('/api/auth', authRouter);

// Protected Routes
app.use('/api/upload', authMiddleware, uploadRouter);

// Special case: Allow engine to POST pages and PATCH status without auth (internal callback)
app.use('/api/blobs', (req, res, next) => {
  const isEngineCallback = (req.method === 'POST' && req.path.endsWith('/pages')) || 
                           (req.method === 'PATCH' && /^\/[^\/]+$/.test(req.path));
  if (isEngineCallback) return next();
  return authMiddleware(req, res, next);
}, blobsRouter);

app.use('/api/pages', authMiddleware, pagesRouter);
app.use('/api/documents', authMiddleware, documentsRouter);
app.use('/api/export', authMiddleware, exportRouter);
app.use('/api/admin', adminRouter);
app.use('/api/demo', demoRouter);
app.use('/api/storage', storageProxyRouter);

// Manual trigger for Vercel Cron
app.get('/api/poll', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { pollSftp } = require('./services/sftpPoller');
  await pollSftp();
  res.json({ success: true, message: 'Poller triggered' });
});

// Global error handler
app.use(errorHandler);

// Initialize background services
initSftpPoller();

// Ensure the standard missing-document checklist questions exist in the DB.
// Retries periodically so they are stored as soon as the DB is reachable
// (e.g. after a Neon quota limit resets).
const DEFAULT_CHECKLIST_QUESTIONS = [
  'Is 1008 Underwriting Transmittal Summary part of the package?',
  'Is Application 1003 part of the package?',
  'Is Appraisal part of the package?',
  'Is Closing Disclosure part of the package?',
  'Is Deed part of the package?',
  'Is Final Title Policy part of the package?',
  'Is Flood Certificate part of the package?',
  'Is Legal Description part of the package?',
];

async function seedDefaultChecklistQuestions() {
  try {
    const { prisma } = require('./lib/prisma');
    let inserted = 0;
    for (const text of DEFAULT_CHECKLIST_QUESTIONS) {
      const existing = await prisma.checklistItem.findFirst({ where: { text } });
      if (!existing) {
        await prisma.checklistItem.create({ data: { text } });
        inserted++;
      }
    }
    if (inserted > 0) logger.info(`[ChecklistSeed] Inserted ${inserted} default checklist question(s).`);
  } catch (e) {
    logger.warn(`[ChecklistSeed] DB not ready (${e.message}). Will retry in 10 minutes.`);
  }
}

seedDefaultChecklistQuestions();
setInterval(seedDefaultChecklistQuestions, 10 * 60 * 1000);

app.listen(PORT, () => {
  logger.info(`🚀 IDP Backend running on http://localhost:${PORT}`);
});

module.exports = app;
