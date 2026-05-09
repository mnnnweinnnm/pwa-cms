const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { loadUsers, saveUsers, publicUser, hashPassword, requireAdmin } = require('../lib/auth-store');

const router = express.Router();
router.use(requireAdmin);

router.get('/', (req, res) => {
  res.json(loadUsers().map(publicUser));
});

router.post('/', (req, res) => {
  const { username, password, displayName, role = 'user', active = true } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username/password required' });
  if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username)) return res.status(400).json({ error: '帳號只能 3-32 字，英數、底線、點、橫線' });
  if (String(password).length < 8) return res.status(400).json({ error: '密碼至少 8 位' });
  if (!['admin', 'user'].includes(role)) return res.status(400).json({ error: 'role must be admin or user' });
  const users = loadUsers();
  if (users.some(u => u.username === username)) return res.status(409).json({ error: '帳號已存在' });
  const user = {
    id: uuidv4(),
    username,
    displayName: displayName || username,
    role,
    active: active !== false,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  res.status(201).json(publicUser(user));
});

router.patch('/:id', (req, res) => {
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const next = { ...users[idx] };
  if (req.body.displayName !== undefined) next.displayName = req.body.displayName;
  if (req.body.role !== undefined) {
    if (!['admin', 'user'].includes(req.body.role)) return res.status(400).json({ error: 'role must be admin or user' });
    next.role = req.body.role;
  }
  if (req.body.active !== undefined) next.active = !!req.body.active;
  if (req.body.password) {
    if (String(req.body.password).length < 8) return res.status(400).json({ error: '密碼至少 8 位' });
    next.passwordHash = hashPassword(req.body.password);
  }
  next.updatedAt = new Date().toISOString();
  users[idx] = next;
  saveUsers(users);
  res.json(publicUser(next));
});

router.delete('/:id', (req, res) => {
  if (req.user.id === req.params.id) return res.status(400).json({ error: '不能刪除自己' });
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = users.splice(idx, 1);
  saveUsers(users);
  res.json({ ok: true, id: removed.id });
});

module.exports = router;
