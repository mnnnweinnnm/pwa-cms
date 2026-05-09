const express = require('express');
const { authenticate, createSession, destroySession, parseCookies, getRequestUser, publicUser } = require('../lib/auth-store');

const router = express.Router();

router.get('/me', (req, res) => {
  const user = getRequestUser(req);
  if (!user) return res.status(401).json({ error: '請先登入' });
  res.json(publicUser(user));
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = authenticate(username, password);
  if (!user) return res.status(401).json({ error: '帳號或密碼錯誤' });
  const token = createSession(user.id);
  res.cookie('pwa_cms_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json(publicUser(user));
});

router.post('/logout', (req, res) => {
  const token = parseCookies(req.headers.cookie || '').pwa_cms_session;
  destroySession(token);
  res.clearCookie('pwa_cms_session');
  res.json({ ok: true });
});

module.exports = router;
