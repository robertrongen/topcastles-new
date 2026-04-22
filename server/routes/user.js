import { Router } from 'express';
import { randomUUID, randomBytes } from 'crypto';
import path from 'path';
import { readJson, writeJson } from '../lib/json-store.js';

const router = Router();
const USERS_FILE = path.join(process.cwd(), 'data/users.json');

function generateId() {
  return randomUUID();
}

function generateToken() {
  return randomBytes(32).toString('hex');
}

async function getStoreAndUser(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return { store: null, user: null };
  const token = auth.slice(7);
  const store = (await readJson(USERS_FILE)) ?? { users: [] };
  const user = store.users.find(u => u.token === token) ?? null;
  return { store, user };
}

async function getUserFromToken(req) {
  const { user } = await getStoreAndUser(req);
  return user;
}

function validateFavorite(input) {
  const name = typeof input.name === 'string' ? input.name.trim() : null;
  if (!name) throw new Error('name is required');
  if (name.length > 100) throw new Error('name exceeds 100 characters');

  const raw = Array.isArray(input.castleIds) ? input.castleIds : [];
  if (!raw.every(id => typeof id === 'string')) throw new Error('castleIds must be strings');
  const castleIds = [...new Set(raw)];

  return { name, castleIds };
}

// POST /api/user/register
router.post('/register', async (req, res) => {
  try {
    const store = (await readJson(USERS_FILE)) ?? { users: [] };
    const user = { id: generateId(), token: generateToken(), favorites: [] };
    store.users.push(user);
    await writeJson(USERS_FILE, store);
    res.json({ token: user.token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET /api/user/me
router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = auth.slice(7);
  try {
    const store = (await readJson(USERS_FILE)) ?? { users: [] };
    const user = store.users.find(u => u.token === token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    res.json({ id: user.id, favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/user/favorites
router.get('/favorites', async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/user/favorites
router.post('/favorites', async (req, res) => {
  try {
    const { store, user } = await getStoreAndUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    let cleaned;
    try {
      cleaned = validateFavorite(req.body);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    const set = { id: randomUUID(), name: cleaned.name, castleIds: cleaned.castleIds };
    user.favorites.push(set);
    await writeJson(USERS_FILE, store);
    res.status(201).json(set);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/user/favorites/:id
router.put('/favorites/:id', async (req, res) => {
  try {
    const { store, user } = await getStoreAndUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const set = user.favorites.find(f => f.id === req.params.id);
    if (!set) return res.status(404).json({ error: 'Not found' });

    let cleaned;
    try {
      cleaned = validateFavorite(req.body);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    set.name = cleaned.name;
    set.castleIds = cleaned.castleIds;
    await writeJson(USERS_FILE, store);
    res.json(set);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/user/favorites/:id
router.delete('/favorites/:id', async (req, res) => {
  try {
    const { store, user } = await getStoreAndUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const index = user.favorites.findIndex(f => f.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    user.favorites.splice(index, 1);

    await writeJson(USERS_FILE, store);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
