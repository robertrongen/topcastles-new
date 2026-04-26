const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

export function adminAuth(req, res, next) {
  if (!ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = auth.slice(7);
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}
