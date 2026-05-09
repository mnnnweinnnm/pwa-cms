const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const BOOTSTRAP_FILE = path.join(DATA_DIR, 'bootstrap-admin.txt');
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function writeJson(file, value) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const actual = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function loadUsers() {
  return readJson(USERS_FILE, []);
}

function saveUsers(users) {
  writeJson(USERS_FILE, users);
}

function createBootstrapPassword() {
  return process.env.ADMIN_BOOTSTRAP_PASSWORD || process.env.PWA_ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');
}

function ensureDefaultAdmin() {
  const users = loadUsers();
  if (users.length) return users;
  const password = createBootstrapPassword();
  const admin = {
    id: uuidv4(),
    username: process.env.ADMIN_BOOTSTRAP_USER || 'admin',
    displayName: 'Admin',
    role: 'admin',
    active: true,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveUsers([admin]);
  fs.writeFileSync(BOOTSTRAP_FILE, `Initial PWA CMS admin\nusername=${admin.username}\npassword=${password}\ncreatedAt=${admin.createdAt}\n`);
  return [admin];
}

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

function loadSessions() {
  const sessions = readJson(SESSIONS_FILE, []);
  const now = Date.now();
  const valid = sessions.filter(s => new Date(s.expiresAt).getTime() > now);
  if (valid.length !== sessions.length) writeJson(SESSIONS_FILE, valid);
  return valid;
}

function saveSessions(sessions) {
  writeJson(SESSIONS_FILE, sessions);
}

function createSession(userId) {
  const sessions = loadSessions();
  const token = crypto.randomBytes(32).toString('base64url');
  sessions.push({ token, userId, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString() });
  saveSessions(sessions);
  return token;
}

function destroySession(token) {
  if (!token) return;
  saveSessions(loadSessions().filter(s => s.token !== token));
}

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map(v => v.trim()).filter(Boolean).map(v => {
    const i = v.indexOf('=');
    return [decodeURIComponent(v.slice(0, i)), decodeURIComponent(v.slice(i + 1))];
  }));
}

function getRequestUser(req) {
  ensureDefaultAdmin();
  const token = parseCookies(req.headers.cookie || '').pwa_cms_session;
  if (!token) return null;
  const session = loadSessions().find(s => s.token === token);
  if (!session) return null;
  const user = loadUsers().find(u => u.id === session.userId && u.active !== false);
  return user || null;
}

function requireAuth(req, res, next) {
  const user = getRequestUser(req);
  if (!user) {
    if (req.path.startsWith('/api/')) return res.status(401).json({ error: '請先登入' });
    return res.redirect('/login');
  }
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: '需要管理員權限' });
  next();
}

function authenticate(username, password) {
  ensureDefaultAdmin();
  const user = loadUsers().find(u => u.username === username && u.active !== false);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return user;
}

module.exports = {
  ensureDefaultAdmin,
  loadUsers,
  saveUsers,
  publicUser,
  hashPassword,
  verifyPassword,
  authenticate,
  createSession,
  destroySession,
  parseCookies,
  getRequestUser,
  requireAuth,
  requireAdmin,
};
