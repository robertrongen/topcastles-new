// Load local .env file for development (if NODE_ENV is not production)
// Use an absolute path anchored to this file so .env is found regardless of CWD.
if (process.env.NODE_ENV !== 'production') {
  const { fileURLToPath } = await import('url');
  const { dirname, join } = await import('path');
  const { config } = await import('dotenv');
  const envPath = join(dirname(fileURLToPath(import.meta.url)), '../.env');
  const result = config({ path: envPath });
  if (result.error) {
    console.warn('[dotenv] failed to load .env:', result.error.message);
  } else {
    console.log('[dotenv] loaded from', envPath, '| ADMIN_TOKEN set:', !!process.env.ADMIN_TOKEN);
  }
}

import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { accessSync, constants, existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import adminEditorialRoutes from './routes/admin-editorial.js';
import editorialRoutes from './routes/editorial.js';
import { createTopCastlesMcpServer } from './lib/topcastles-mcp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, '../new_app/dist/new_app/browser');
const API_CASTLES_PATHS = [
  path.join(DIST, 'api/castles.json'),
  path.join(__dirname, '../new_app/public/api/castles.json'),
  path.join(__dirname, '../new_app/src/assets/data/castles_enriched.json'),
];
const DEFAULT_CASTLE_IMAGE_PATH =
  process.platform === 'win32'
    ? '\\\\DS224plus\\docker\\topcastles\\images\\castles'
    : path.join(__dirname, '..', 'castle-images');
const CASTLE_IMAGE_ROOT = path.resolve(
  process.env.CASTLE_IMAGE_PATH || DEFAULT_CASTLE_IMAGE_PATH
);

function containsImageFile(directory) {
  const stack = [directory];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
        continue;
      }
      if (entry.isFile() && /\.(jpe?g|png|webp|gif)$/i.test(entry.name)) {
        return true;
      }
    }
  }

  return false;
}

function checkCastleImageMount(imageRoot) {
  const status = {
    path: imageRoot,
    available: false,
    status: 'warning',
    message: '',
  };

  try {
    if (!existsSync(imageRoot)) {
      status.message = 'image mount path does not exist';
      return status;
    }

    if (!statSync(imageRoot).isDirectory()) {
      status.message = 'image mount path is not a directory';
      return status;
    }

    accessSync(imageRoot, constants.R_OK | constants.X_OK);

    if (!containsImageFile(imageRoot)) {
      status.message = 'image mount is readable but no image files were found';
      return status;
    }

    status.available = true;
    status.status = 'ok';
    status.message = 'image mount is available';
    return status;
  } catch (error) {
    status.message = `image mount is not usable: ${error.message}`;
    return status;
  }
}

const CASTLE_IMAGE_MOUNT_STATUS = checkCastleImageMount(CASTLE_IMAGE_ROOT);

const app = express();

app.use(compression());
// Admin routes are mounted before the global body parser so the route-level
// express.json({ limit: '10mb' }) on POST /upload-enriched controls its own limit.
app.use('/api/admin/editorial', adminEditorialRoutes);
app.use('/api/admin', adminRoutes);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    imageMount: CASTLE_IMAGE_MOUNT_STATUS,
  });
});

app.use('/api/user', userRoutes);
app.use('/api/editorial', editorialRoutes);

app.post('/mcp', async (req, res) => {
  const dataPath = API_CASTLES_PATHS.find(existsSync);

  if (!dataPath) {
    return res.status(500).json({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Castle dataset not found' },
      id: null,
    });
  }

  const server = createTopCastlesMcpServer(JSON.parse(readFileSync(dataPath, 'utf8')));
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);

    res.on('close', () => {
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

app.all('/mcp', (_req, res) => {
  res.status(405).json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed' },
    id: null,
  });
});

const IMAGE_CACHE_MAX_AGE = process.env.NODE_ENV === 'production' ? '1d' : 0;

app.use('/castle-images', express.static(CASTLE_IMAGE_ROOT, {
  fallthrough: true,
  maxAge: IMAGE_CACHE_MAX_AGE,
}));

app.use('/castle-images', (req, res) => {
  console.warn(`[image] 404 — ${req.path}`);
  res.sendStatus(404);
});

app.use(express.static(DIST));

// SPA fallback — must be last; unknown /api/* routes return 404 JSON
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(DIST, 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`TopCastles server listening on port ${PORT}`);

  if (!process.env.ADMIN_TOKEN) {
    console.warn('[admin-auth] WARNING: ADMIN_TOKEN is not configured. Admin routes will return 401 until runtime env is set.');
  }

  console.log(`/castle-images mounted from ${CASTLE_IMAGE_ROOT}`);
  const imageMessage = `[image-mount] ${CASTLE_IMAGE_MOUNT_STATUS.status}: ${CASTLE_IMAGE_MOUNT_STATUS.message} (${CASTLE_IMAGE_MOUNT_STATUS.path})`;
  if (CASTLE_IMAGE_MOUNT_STATUS.available) {
    console.log(imageMessage);
  } else {
    console.warn(imageMessage);
  }

  const USERS_FILE = process.env.USERS_FILE || path.join(__dirname, '../data/users.json');
  const usersExist = existsSync(USERS_FILE);
  const dataMessage = usersExist
    ? `[data-mount] ok: users.json present (${USERS_FILE})`
    : `[data-mount] notice: users.json not yet created — will be written on first registration (${USERS_FILE})`;
  console.log(dataMessage);
});

server.on('error', (error) => {
  if (error && error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. If another TopCastles server is running, stop it first or set PORT to a free port.`);
  } else {
    console.error('Server error during startup:', error);
  }
  process.exit(1);
});
