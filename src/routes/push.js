/**
 * Push Notification Routes
 * PUBLIC:  POST /api/push/subscribe, POST /api/push/unsubscribe
 * AUTH:    GET  /api/push/stats
 * ADMIN:   POST /api/push/send, POST /api/push/recall
 */
const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../lib/auth-store');
const pushService = require('../services/push-service');

// CORS preflight for public endpoints (download pages call cross-origin)
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// PUBLIC - Store push subscription
router.post('/subscribe', (req, res) => {
  try {
    const { subscription, campaignId, pkgId, meta } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'subscription with endpoint is required' });
    }
    const result = pushService.addSubscription({
      subscription,
      campaignId: campaignId || null,
      pkgId: pkgId || null,
      meta: meta || {},
    });
    res.json({ ok: true, id: result.record.id });
  } catch (err) {
    console.error('Push subscribe error:', err.message);
    res.status(500).json({ error: 'Internal error' });
  }
});

// PUBLIC - Unsubscribe
router.post('/unsubscribe', (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ error: 'endpoint is required' });
    const result = pushService.removeSubscription(endpoint);
    res.json({ ok: true, found: result.found });
  } catch (err) {
    console.error('Push unsubscribe error:', err.message);
    res.status(500).json({ error: 'Internal error' });
  }
});

// AUTH - Stats
router.get('/stats', requireAuth, (req, res) => {
  try {
    const stats = pushService.getStats();
    res.json(stats);
  } catch (err) {
    console.error('Push stats error:', err.message);
    res.status(500).json({ error: 'Internal error' });
  }
});

// ADMIN - Send push to subscribers
router.post('/send', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { campaignId, title, body, url, icon } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'title and body are required' });
    const results = await pushService.sendBulk({ campaignId, title, body, url, icon });
    res.json({ ok: true, ...results });
  } catch (err) {
    console.error('Push send error:', err.message);
    res.status(500).json({ error: 'Internal error' });
  }
});

// ADMIN - Trigger recall check manually
router.post('/recall', requireAuth, requireAdmin, async (req, res) => {
  try {
    const results = await pushService.processRecalls();
    res.json({ ok: true, ...results });
  } catch (err) {
    console.error('Push recall error:', err.message);
    res.status(500).json({ error: 'Internal error' });
  }
});

module.exports = router;
