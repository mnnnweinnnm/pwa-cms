/**
 * 推廣連結管理 API
 * GET    /api/campaigns           - 列出所有連結
 * POST   /api/campaigns          - 建立新連結（生成下載頁）
 * GET    /api/campaigns/:id      - 取得連結
 * PUT    /api/campaigns/:id      - 更新連結
 * DELETE /api/campaigns/:id      - 刪除連結
 * POST   /api/campaigns/:id/verify - 手動驗證 DNS 指向
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { buildDownloadPage, buildSafePage, buildManifest, buildServiceWorker } = require('../templates/download-page');
const { deployPage, removePage, verifyDeploy } = require('../services/deploy');
const audit = require('../services/audit-log');
const { requireAuth, requireAdmin } = require('../lib/auth-store');

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

const PKG_FILE = path.join(__dirname, '../../data/packages.json');
function loadPackages() {
  if (!fs.existsSync(PKG_FILE)) return [];
  return JSON.parse(fs.readFileSync(PKG_FILE, 'utf8'));
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
  audit.log('domain.create', { user: req.user?.username, target: normalized, detail: { notes: notes || '' }, ip: req.ip });
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
  audit.log('domain.update', { user: req.user?.username, target: req.params.domain, detail: { status: records[idx].status }, ip: req.ip });
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

  const pkgs = loadPackages();
  const pkg = pkgs.find(p => p.id === pkgId);
  if (!pkg) return res.status(404).json({ error: 'PWA 包不存在' });

  const STAGING_DIR = path.join(__dirname, `../../staging/${subdomain}`);
  fs.mkdirSync(STAGING_DIR, { recursive: true });

  // Copy icon
  if (pkg.iconPath && fs.existsSync(pkg.iconPath)) {
    fs.copyFileSync(pkg.iconPath, path.join(STAGING_DIR, 'icon.png'));
  }

  // Copy screenshots and build relative filename list
  const screenshotFiles = [];
  if (pkg.screenshotPaths) {
    pkg.screenshotPaths.forEach((sp, i) => {
      if (fs.existsSync(sp)) {
        const fname = `screenshot-${i + 1}${path.extname(sp)}`;
        fs.copyFileSync(sp, path.join(STAGING_DIR, fname));
        screenshotFiles.push(fname);
      }
    });
  }

  // Generate index.html, safe.html, manifest.json, sw.js
  const cmsBaseUrl = process.env.CMS_BASE_URL || 'https://admin.pwaadminhub.xyz';
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
  const campaignId = uuidv4();
  fs.writeFileSync(path.join(STAGING_DIR, 'index.html'),
    buildDownloadPage({ pkg, targetUrl, subdomain, domain, screenshotFiles, cmsBaseUrl, vapidPublicKey, campaignId }));
  fs.writeFileSync(path.join(STAGING_DIR, 'safe.html'),
    buildSafePage({ pkg, campaignId, statsEndpoint: cmsBaseUrl }));
  fs.writeFileSync(path.join(STAGING_DIR, 'manifest.json'),
    JSON.stringify(buildManifest({ pkg, targetUrl, subdomain, domain }), null, 2));
  fs.writeFileSync(path.join(STAGING_DIR, 'sw.js'),
    buildServiceWorker({ targetUrl, campaignId, statsEndpoint: cmsBaseUrl }));

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

  const campaign = { id: campaignId, pkgId, pkgName: pkg.appName, pkgLang: pkg.lang, targetUrl, subdomain, domain, downloadUrl, deployed, verified, createdAt: new Date().toISOString() };
  campaigns.push(campaign);
  saveCampaigns(campaigns);
  audit.log('campaign.create', { user: req.user?.username, target: campaign.id, detail: { subdomain, domain, pkgName: pkg.appName, targetUrl, deployed, verified }, ip: req.ip });
  res.status(201).json(campaign);
});

// GET single campaign
router.get('/:id', async (req, res) => {
  const campaigns = loadCampaigns();
  const c = campaigns.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(c);
});

// PUT update campaign
router.put('/:id', requireAuth, async (req, res) => {
  const campaigns = loadCampaigns();
  const idx = campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const { subdomain, domain, targetUrl, pkgId } = req.body;
  if (!subdomain || !domain || !targetUrl || !pkgId) {
    return res.status(400).json({ error: 'subdomain, domain, targetUrl, pkgId 皆為必填' });
  }
  // Check domain exists and is active
  const domainRecords = loadDomainRecords();
  if (!domainRecords.some(d => d.domain === domain && d.status === 'active')) {
    return res.status(400).json({ error: '域名不存在或未啟用' });
  }
  // Check duplicate subdomain+domain (excluding self)
  if (campaigns.some(c => c.id !== req.params.id && c.subdomain === subdomain && c.domain === domain)) {
    return res.status(409).json({ error: '此域名+子網域組合已存在' });
  }
  // Check pkg exists
  const packages = loadPackages();
  const pkg = packages.find(p => p.id === pkgId);
  if (!pkg) return res.status(400).json({ error: 'PWA 包不存在' });
  const old = campaigns[idx];
  const urlChanged = old.subdomain !== subdomain || old.domain !== domain || old.targetUrl !== targetUrl;
  campaigns[idx] = {
    ...old,
    subdomain, domain, targetUrl, pkgId,
    pkgName: pkg.appName,
    pkgLang: pkg.lang,
    // Any change to subdomain/domain/targetUrl invalidates deploy and verification
    deployed: urlChanged ? false : old.deployed,
    verified: urlChanged ? false : old.verified,
    updatedAt: new Date().toISOString()
  };
  saveCampaigns(campaigns);
  audit.log('campaign.update', { user: req.user?.username, target: campaigns[idx].id, detail: { subdomain, domain, pkgName: pkg.appName, targetUrl, urlChanged }, ip: req.ip });
  res.json(campaigns[idx]);
});


// PATCH update campaign targetUrl only — user role allowed
router.patch('/:id/target', requireAuth, async (req, res) => {
  const campaigns = loadCampaigns();
  const idx = campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const { targetUrl } = req.body;
  if (!targetUrl) return res.status(400).json({ error: 'targetUrl 為必填' });
  const old = campaigns[idx];
  campaigns[idx] = {
    ...old,
    targetUrl,
    deployed: old.targetUrl !== targetUrl ? false : old.deployed,
    verified: old.targetUrl !== targetUrl ? false : old.verified,
    updatedAt: new Date().toISOString()
  };
  saveCampaigns(campaigns);
  audit.log('campaign.update-target', { user: req.user?.username, target: campaigns[idx].id, detail: { targetUrl }, ip: req.ip });
  res.json(campaigns[idx]);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const campaigns = loadCampaigns();
  const idx = campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = campaigns.splice(idx, 1);
  saveCampaigns(campaigns);
  try { await removePage(removed.subdomain); } catch (e) { console.error(e.message); }
  audit.log('campaign.delete', { user: req.user?.username, target: removed.id, detail: { subdomain: removed.subdomain, domain: removed.domain }, ip: req.ip });
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

// POST redeploy campaign (regenerate download page with latest template)
router.post('/:id/redeploy', requireAuth, async (req, res) => {
  const campaigns = loadCampaigns();
  const idx = campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const camp = campaigns[idx];
  const pkgs = loadPackages();
  const pkg = pkgs.find(p => p.id === camp.pkgId);
  if (!pkg) return res.status(404).json({ error: 'PWA 包不存在' });

  const STAGING_DIR = path.join(__dirname, `../../staging/${camp.subdomain}`);
  fs.mkdirSync(STAGING_DIR, { recursive: true });

  if (pkg.iconPath && fs.existsSync(pkg.iconPath)) {
    fs.copyFileSync(pkg.iconPath, path.join(STAGING_DIR, 'icon.png'));
  }
  const screenshotFiles = [];
  if (pkg.screenshotPaths) {
    pkg.screenshotPaths.forEach((sp, i) => {
      if (fs.existsSync(sp)) {
        const fname = `screenshot-${i + 1}${path.extname(sp)}`;
        fs.copyFileSync(sp, path.join(STAGING_DIR, fname));
        screenshotFiles.push(fname);
      }
    });
  }

  const cmsBaseUrl = process.env.CMS_BASE_URL || 'https://admin.pwaadminhub.xyz';
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
  fs.writeFileSync(path.join(STAGING_DIR, 'index.html'),
    buildDownloadPage({ pkg, targetUrl: camp.targetUrl, subdomain: camp.subdomain, domain: camp.domain, screenshotFiles, cmsBaseUrl, vapidPublicKey, campaignId: camp.id }));
  fs.writeFileSync(path.join(STAGING_DIR, 'safe.html'),
    buildSafePage({ pkg, campaignId: camp.id, statsEndpoint: cmsBaseUrl }));
  fs.writeFileSync(path.join(STAGING_DIR, 'manifest.json'),
    JSON.stringify(buildManifest({ pkg, targetUrl: camp.targetUrl, subdomain: camp.subdomain, domain: camp.domain }), null, 2));
  fs.writeFileSync(path.join(STAGING_DIR, 'sw.js'),
    buildServiceWorker({ targetUrl: camp.targetUrl, campaignId: camp.id, statsEndpoint: cmsBaseUrl }));

  let deployed = false;
  let verified = false;
  try {
    await deployPage(camp.subdomain, STAGING_DIR);
    deployed = true;
    await new Promise(r => setTimeout(r, 6000));
    const result = await verifyDeploy(camp.subdomain, camp.domain);
    verified = result.ok;
  } catch (err) {
    console.error('Redeploy error:', err.message);
  }

  campaigns[idx] = { ...camp, deployed, verified, redeployedAt: new Date().toISOString() };
  saveCampaigns(campaigns);
  audit.log('campaign.redeploy', { user: req.user?.username, target: camp.id, detail: { subdomain: camp.subdomain, deployed, verified }, ip: req.ip });
  res.json(campaigns[idx]);
});
