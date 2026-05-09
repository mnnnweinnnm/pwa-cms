/**
 * 推廣連結管理 API
 * GET    /api/campaigns           - 列出所有連結
 * POST   /api/campaigns          - 建立新連結（生成下載頁）
 * GET    /api/campaigns/:id      - 取得連結
 * DELETE /api/campaigns/:id      - 刪除連結
 * POST   /api/campaigns/:id/verify - 手動驗證 DNS 指向
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { buildDownloadPage, buildManifest } = require('../templates/download-page');
const { deployPage, removePage, verifyDeploy } = require('../services/deploy');
const { requireAdmin } = require('../lib/auth-store');

const DATA_FILE = path.join(__dirname, '../../data/campaigns.json');
const DOMAINS_FILE = path.join(__dirname, '../../data/domains.json');

function normalizeDomainRecords(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(item => typeof item === 'string'
    ? { domain: item, status: 'active', notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    : { status: 'pending', notes: '', ...item });
}

function loadDomainRecords() {
  if (!fs.existsSync(DOMAINS_FILE)) return [{ domain: 'xmx99juego.online', status: 'active', notes: 'Default download domain', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
  return normalizeDomainRecords(JSON.parse(fs.readFileSync(DOMAINS_FILE, 'utf8')));
}

function saveDomainRecords(records) {
  fs.mkdirSync(path.dirname(DOMAINS_FILE), { recursive: true });
  fs.writeFileSync(DOMAINS_FILE, JSON.stringify(records, null, 2));
}

function loadDomains() {
  return loadDomainRecords().filter(d => d.status === 'active').map(d => d.domain);
}

function loadCampaigns() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveCampaigns(campaigns) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(campaigns, null, 2));
}

function buildDownloadUrl(subdomain, domain) {
  return `https://${subdomain}.${domain}/`;
}

// GET list
router.get('/', (req, res) => {
  const campaigns = loadCampaigns();
  const domains = loadDomains();
  res.json({ campaigns, domains });
});

router.get('/domains', (req, res) => {
  res.json({ domains: loadDomainRecords(), activeDomains: loadDomains() });
});

router.post('/domains', requireAdmin, (req, res) => {
  const { domain, notes } = req.body;
  if (!domain) return res.status(400).json({ error: 'domain required' });
  const normalized = String(domain).trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(normalized)) return res.status(400).json({ error: '域名格式不正確' });
  const records = loadDomainRecords();
  if (!records.some(d => d.domain === normalized)) {
    records.push({
      domain: normalized,
      status: 'pending',
      notes: notes || '待人工完成 GoDaddy → Cloudflare → wildcard DNS → Caddy 驗證',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user?.username,
    });
    saveDomainRecords(records);
  }
  res.json({ ok: true, domains: records, activeDomains: records.filter(d => d.status === 'active').map(d => d.domain) });
});

router.patch('/domains/:domain', requireAdmin, (req, res) => {
  const records = loadDomainRecords();
  const idx = records.findIndex(d => d.domain === req.params.domain);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  if (req.body.status !== undefined) {
    if (!['pending', 'active', 'disabled'].includes(req.body.status)) return res.status(400).json({ error: 'status must be pending/active/disabled' });
    records[idx].status = req.body.status;
  }
  if (req.body.notes !== undefined) records[idx].notes = req.body.notes;
  records[idx].updatedAt = new Date().toISOString();
  records[idx].updatedBy = req.user?.username;
  saveDomainRecords(records);
  res.json({ ok: true, domain: records[idx], domains: records });
});

router.delete('/domains/:domain', requireAdmin, (req, res) => {
  const records = loadDomainRecords();
  const next = records.filter(d => d.domain !== req.params.domain);
  if (next.length === records.length) return res.status(404).json({ error: 'Not found' });
  saveDomainRecords(next);
  res.json({ ok: true });
});

router.post('/', async (req, res) => {
  const { pkgId, targetUrl, subdomain, domain } = req.body;
  if (!pkgId || !targetUrl || !subdomain || !domain) {
    return res.status(400).json({ error: 'pkgId, targetUrl, subdomain, domain 皆為必填' });
  }
  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    return res.status(400).json({ error: 'subdomain 只能包含小寫字母、數字、連字符' });
  }

  const activeDomains = loadDomains();
  if (!activeDomains.includes(domain)) {
    return res.status(400).json({ error: '此域名尚未啟用，需管理員完成 DNS/Caddy 驗證後才能使用' });
  }

  const campaigns = loadCampaigns();
  if (campaigns.find(c => c.subdomain === subdomain && c.domain === domain)) {
    return res.status(409).json({ error: '此子網域已被使用' });
  }

  const PKG_FILE = path.join(__dirname, '../../data/packages.json');
  const pkgs = fs.existsSync(PKG_FILE) ? JSON.parse(fs.readFileSync(PKG_FILE, 'utf8')) : [];
  const pkg = pkgs.find(p => p.id === pkgId);
  if (!pkg) return res.status(404).json({ error: 'PWA 包不存在' });

  const STAGING_DIR = path.join(__dirname, `../../staging/${subdomain}`);
  fs.mkdirSync(STAGING_DIR, { recursive: true });

  fs.writeFileSync(path.join(STAGING_DIR, 'index.html'),
    buildDownloadPage({ pkg, targetUrl, subdomain, domain }));
  fs.writeFileSync(path.join(STAGING_DIR, 'manifest.json'),
    JSON.stringify(buildManifest({ pkg, subdomain, domain }), null, 2));

  if (pkg.iconPath && fs.existsSync(pkg.iconPath)) {
    fs.copyFileSync(pkg.iconPath, path.join(STAGING_DIR, 'icon.png'));
  }
  if (pkg.screenshotPaths) {
    pkg.screenshotPaths.forEach((sp, i) => {
      if (fs.existsSync(sp)) {
        fs.copyFileSync(sp, path.join(STAGING_DIR, `screenshot-${i + 1}${path.extname(sp)}`));
      }
    });
  }

  let deployed = false;
  let verified = false;
  const downloadUrl = buildDownloadUrl(subdomain, domain);

  try {
    await deployPage(subdomain, STAGING_DIR);
    deployed = true;
    await new Promise(r => setTimeout(r, 6000));
    const result = await verifyDeploy(subdomain, domain);
    verified = result.ok;
  } catch (err) {
    console.error('Deploy error:', err.message);
  }

  const campaign = { id: uuidv4(), pkgId, pkgName: pkg.appName, pkgLang: pkg.lang, targetUrl, subdomain, domain, downloadUrl, deployed, verified, createdAt: new Date().toISOString() };
  campaigns.push(campaign);
  saveCampaigns(campaigns);
  res.status(201).json(campaign);
});

router.delete('/:id', async (req, res) => {
  const campaigns = loadCampaigns();
  const idx = campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = campaigns.splice(idx, 1);
  saveCampaigns(campaigns);
  try { await removePage(removed.subdomain); } catch (e) { console.error(e.message); }
  res.json({ ok: true, id: removed.id });
});

router.post('/:id/verify', async (req, res) => {
  const campaigns = loadCampaigns();
  const idx = campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const result = await verifyDeploy(campaigns[idx].subdomain, campaigns[idx].domain);
  campaigns[idx] = { ...campaigns[idx], verified: result.ok };
  saveCampaigns(campaigns);
  res.json({ ...campaigns[idx], verifyResult: result });
});

module.exports = router;
