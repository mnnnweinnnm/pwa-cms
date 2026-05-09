/**
 * 統計數據 API
 * POST /api/stats/event     — 記錄事件（PUBLIC，下載頁打回來的）
 * GET  /api/stats            — 查詢統計（需登入）
 * GET  /api/stats/range      — 可用日期範圍
 */
const express = require('express');
const router = express.Router();
const { recordEvent, queryStats, getDateRange } = require('../services/stats-service');
const { requireAuth } = require('../lib/auth-store');

// PUBLIC — 下載頁埋的 JS 打回來
router.post('/event', (req, res) => {
  const { type, campaignId, pkgId, subdomain, domain, lang, platform } = req.body;
  const VALID_TYPES = ['page_view', 'install_click', 'install_complete', 'pwa_open', 'redirect', 'push_subscribe'];
  if (!type || !VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Invalid event type' });
  }
  const ua = req.headers['user-agent'] || '';
  const ip = req.ip || req.connection?.remoteAddress || '';
  const referer = req.headers['referer'] || '';
  recordEvent(type, { campaignId, pkgId, subdomain, domain, lang, platform, ua, ip, referer });
  res.json({ ok: true });
});

// AUTH — 後台查詢
router.get('/', requireAuth, (req, res) => {
  const { from, to, pkgId, campaignId, type } = req.query;
  const result = queryStats({ from, to, pkgId, campaignId, type });
  res.json(result);
});

router.get('/range', requireAuth, (req, res) => {
  res.json(getDateRange());
});

module.exports = router;
