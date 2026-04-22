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
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = auth.slice(7);
  try {
    const store = (await readJson(USERS_FILE)) ?? { users: [] };
    const user = store.users.find(u => u.token === token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    res.json({ id: user.id, favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
