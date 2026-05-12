/**
 * 統計數據 API
 * POST /api/stats/event     — 記錄事件（PUBLIC，下載頁打回來的）
 * GET  /api/stats            — 查詢統計（需登入）
 * GET  /api/stats/range      — 可用日期範圍
 */
const express = require('express');
const router = express.Router();
const { recordEvent, queryStats, getDateRange } = require('../services/stats-service');
const { getRequestUser } = require('../lib/auth-store');

// Allow cross-origin from any PWA download page
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// PUBLIC — 下載頁埋的 JS 打回來
router.post('/event', (req, res) => {
  const { type, campaignId, pkgId, subdomain, domain, lang, platform, fingerprint, ts } = req.body;
  const VALID_TYPES = ['page_view', 'install_click', 'install_complete', 'pwa_open', 'redirect', 'push_subscribe'];
  if (!type || !VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Invalid event type' });
  }
  const ua = req.headers['user-agent'] || '';
  const ip = req.ip || req.connection?.remoteAddress || '';
  const referer = req.headers['referer'] || '';
  recordEvent(type, { campaignId, pkgId, subdomain, domain, lang, platform, ua, ip, referer, fingerprint, ts });
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ ok: true });
});

// AUTH — 後台查詢（看板本身帶 cookie，故此處只攔截未登入的一般 AJAX 工具）
router.get('/', (req, res) => {
  // /api/stats 不能掛 router-level requireAuth，否則公開的 POST /event 會被擋。
  // 這裡用 pwa_cms_session cookie 直接查登入者。
  const user = getRequestUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { from, to, pkgId, campaignId, type } = req.query;
  const result = queryStats({ from, to, pkgId, campaignId, type });
  res.json(result);
});

// AUTH
router.get('/range', (req, res) => {
  const user = getRequestUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json(getDateRange());
});

module.exports = router;
