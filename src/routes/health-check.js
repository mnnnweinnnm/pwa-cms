/**
 * 域名健康檢查 API
 * POST /api/health/check      - 檢查單一 URL
 * POST /api/health/check-all  - 檢查所有 active campaign URLs
 * GET  /api/health/status     - 取得上次檢查結果
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { checkUrl, checkUrls, getLastResults } = require('../services/safebrowsing');

const CAMPAIGNS_FILE = path.join(__dirname, '../../data/campaigns.json');

function loadCampaigns() {
  if (!fs.existsSync(CAMPAIGNS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(CAMPAIGNS_FILE, 'utf8')); } catch { return []; }
}

// POST /api/health/check — check a single URL
router.post('/check', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  try {
    const result = await checkUrl(url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/health/check-all — check all active campaign URLs
router.post('/check-all', async (req, res) => {
  try {
    const campaigns = loadCampaigns();
    const urls = campaigns
      .filter(c => c.downloadUrl)
      .map(c => c.downloadUrl);
    if (urls.length === 0) return res.json({ lastCheckAt: new Date().toISOString(), results: {}, message: 'No active campaigns' });
    const data = await checkUrls(urls);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/health/status — get last check results
router.get('/status', (req, res) => {
  const data = getLastResults();
  res.json(data);
});

module.exports = router;
