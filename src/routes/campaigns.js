/**
 * 推廣連結管理 API
 * GET    /api/campaigns           - 列出所有連結
 * POST   /api/campaigns          - 建立新連結（生成下載頁）
 * GET    /api/campaigns/:id       - 取得連結
 * DELETE /api/campaigns/:id       - 刪除連結
 * POST   /api/campaigns/:id/verify - 手動驗證 DNS 指向
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { buildDownloadPage, buildManifest } = require('../templates/download-page');
const { deployPage, removePage, verifyDeploy } = require('../services/deploy');

const DATA_FILE = path.join(__dirname, '../../data/campaigns.json');

// 可用域名清單（後台管理）
const DOMAINS_FILE = path.join(__dirname, '../../data/domains.json');
function loadDomains() {
  if (!fs.existsSync(DOMAINS_FILE)) return ['xmx99juego.online'];
  return JSON.parse(fs.readFileSync(DOMAINS_FILE, 'utf8'));
}

function loadCampaigns() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveCampaigns(campaigns) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(campaigns, null, 2));
}

// GET list
router.get('/', (req, res) => {
  const campaigns = loadCampaigns();
  const domains = loadDomains();
  res.json({ campaigns, domains });
});

// GET domains
router.get('/domains', (req, res) => {
  res.json(loadDomains());
});

// POST add domain
router.post('/domains', (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: 'domain required' });
  const domains = loadDomains();
  if (!domains.includes(domain)) {
    domains.push(domain);
    fs.writeFileSync(DOMAINS_FILE, JSON.stringify(domains));
  }
  res.json({ ok: true, domains });
});

// POST create campaign
router.post('/', async (req, res) => {
  const { pkgId, targetUrl, subdomain, domain } = req.body;

  if (!pkgId || !targetUrl || !subdomain || !domain) {
    return res.status(400).json({ error: 'pkgId, targetUrl, subdomain, domain 皆為必填' });
  }

  // 驗證 subdomain 格式
  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    return res.status(400).json({ error: 'subdomain 只能包含小寫字母、數字、連字符' });
  }

  // 檢查 subdomain 是否已被使用
  const campaigns = loadCampaigns();
  if (campaigns.find(c => c.subdomain === subdomain && c.domain === domain)) {
    return res.status(409).json({ error: '此子網域已被使用' });
  }

  // 取得 PWA 包
  const pkgs = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/packages.json'), 'utf8').replace(/\[\]$/, '[]'));
  const pkg = pkgs.find(p => p.id === pkgId);
  if (!pkg) return res.status(404).json({ error: 'PWA 包不存在' });

  // 建立本機資料夾
  const STAGING_DIR = path.join(__dirname, `../../staging/${subdomain}`);
  fs.mkdirSync(STAGING_DIR, { recursive: true });

  // 生成 HTML
  const html = buildDownloadPage({
    pkg,
    targetUrl,
    subdomain,
    domain,
  });
  fs.writeFileSync(path.join(STAGING_DIR, 'index.html'), html);

  // 生成 manifest.json
  const manifest = buildManifest({ pkg, subdomain, domain });
  fs.writeFileSync(path.join(STAGING_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // 複製 icon
  if (pkg.iconPath && fs.existsSync(pkg.iconPath)) {
    fs.copyFileSync(pkg.iconPath, path.join(STAGING_DIR, 'icon.png'));
  }

  // 複製截圖（改名為 screenshot-1.jpg 等）
  if (pkg.screenshotPaths) {
    pkg.screenshotPaths.forEach((sp, i) => {
      if (fs.existsSync(sp)) {
        const ext = path.extname(sp);
        fs.copyFileSync(sp, path.join(STAGING_DIR, `screenshot-${i + 1}${ext}`));
      }
    });
  }

  // 部署到 VPS1
  let deployed = false;
  let verified = false;
  let downloadUrl = `https://${subdomain}.download.${domain}/`;

  try {
    await deployPage(subdomain, STAGING_DIR);
    deployed = true;
    const result = await verifyDeploy(subdomain, domain);
    verified = result.ok;
  } catch (err) {
    console.error('Deploy error:', err.message);
  }

  const campaign = {
    id: uuidv4(),
    pkgId,
    pkgName: pkg.appName,
    pkgLang: pkg.lang,
    targetUrl,
    subdomain,
    domain,
    downloadUrl,
    deployed,
    verified,
    createdAt: new Date().toISOString(),
  };

  campaigns.push(campaign);
  saveCampaigns(campaigns);

  res.status(201).json({ ...campaign, stagingDir: STAGING_DIR });
});

// DELETE campaign
router.delete('/:id', async (req, res) => {
  const campaigns = loadCampaigns();
  const idx = campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const [removed] = campaigns.splice(idx, 1);
  saveCampaigns(campaigns);

  try {
    await removePage(removed.subdomain);
  } catch (e) {
    console.error('Remove page error:', e.message);
  }

  res.json({ ok: true, id: removed.id });
});

// POST verify
router.post('/:id/verify', async (req, res) => {
  const campaigns = loadCampaigns();
  const idx = campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const campaign = campaigns[idx];
  const result = await verifyDeploy(campaign.subdomain, campaign.domain);

  campaigns[idx] = { ...campaign, verified: result.ok };
  saveCampaigns(campaigns);

  res.json({ ...campaigns[idx], verifyResult: result });
});

module.exports = router;
