import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/user.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, '../new_app/dist/new_app/browser');
const DEFAULT_CASTLE_IMAGE_PATH =
  process.platform === 'win32'
    ? '\\\\DS224plus\\docker\\topcastles\\images\\castles'
    : path.join(__dirname, '..', 'castle-images');
const CASTLE_IMAGE_ROOT = path.resolve(
  process.env.CASTLE_IMAGE_PATH || DEFAULT_CASTLE_IMAGE_PATH
);

const app = express();

app.use(compression());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/user', userRoutes);

app.get('/castle-images/*', (req, res) => {
  const fileName = req.params[0];
  if (!fileName || fileName.includes('\0')) {
    return res.sendStatus(404);
  }

  const imagePath = path.resolve(CASTLE_IMAGE_ROOT, fileName);
  if (imagePath !== CASTLE_IMAGE_ROOT && !imagePath.startsWith(CASTLE_IMAGE_ROOT + path.sep)) {
    return res.sendStatus(404);
  }

  res.set('Cache-Control', 'public, max-age=86400');
  res.sendFile(imagePath, err => {
    if (err && !res.headersSent) {
      res.sendStatus(404);
    }
  });
});

app.use(express.static(DIST));

// SPA fallback — must be last; unknown /api/* routes return 404 JSON
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TopCastles server listening on port ${PORT}`);
  console.log(`Castle images served from ${CASTLE_IMAGE_ROOT}`);
});
