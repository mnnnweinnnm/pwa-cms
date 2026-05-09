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
const { execSync } = require('child_process');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { buildDownloadPage, buildManifest } = require('../templates/download-page');
const { deployPage, removePage, verifyDeploy } = require('../services/deploy');

const DATA_FILE = path.join(__dirname, '../../data/campaigns.json');
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

// SSH 到 VPS1 動態加 subdomain 到 Caddyfile + reload
async function addCaddySubdomain(subdomain, domain) {
  const block = `${subdomain}.download.${domain} {
    root * /var/www/pwa-downloads/${subdomain}
    try_files {path} /index.html
    file_server
    encode gzip
}
`;

  // 用 here-doc 方式 SSH 過去執行，避免複雜引號轉義
  const script = [
    `EXISTING=$(grep -cF "${subdomain}.download.${domain}" /etc/caddy/Caddyfile 2>/dev/null || echo 0)`,
    `if [ "$EXISTING" -gt 0 ]; then`,
    `  echo "already exists"`,
    `  exit 0`,
    `fi`,
    // 插在 wildcard /*.download... 行之前
    `awk '/^\\*\\.download\\.${domain} / && !added {print; print "${block.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"; added=1; next} {print}' /etc/caddy/Caddyfile > /tmp/Caddyfile.new`,
    `mv /tmp/Caddyfile.new /etc/caddy/Caddyfile`,
    `caddy reload --config /etc/caddy/Caddyfile`,
    `echo "done"`,
  ].join('; ');

  return new Promise((resolve) => {
    try {
      const cmd = `ssh -i /root/.ssh/id_ed25519 -o StrictHostKeyChecking=no -o LogLevel=ERROR root@128.199.249.195 '${script}'`;
      const out = execSync(cmd, { stdio: 'pipe', timeout: 30000 });
      console.log('Caddy SSH:', out.toString().trim());
    } catch (e) {
      console.log('Caddy SSH error:', e.message.slice(-200));
    }
    resolve();
  });
}

// GET list
router.get('/', (req, res) => {
  const campaigns = loadCampaigns();
  const domains = loadDomains();
  res.json({ campaigns, domains });
});

router.get('/domains', (req, res) => {
  res.json(loadDomains());
});

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

router.post('/', async (req, res) => {
  const { pkgId, targetUrl, subdomain, domain } = req.body;
  if (!pkgId || !targetUrl || !subdomain || !domain) {
    return res.status(400).json({ error: 'pkgId, targetUrl, subdomain, domain 皆為必填' });
  }
  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    return res.status(400).json({ error: 'subdomain 只能包含小寫字母、數字、連字符' });
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
  const downloadUrl = `https://${subdomain}.download.${domain}/`;

  try {
    await deployPage(subdomain, STAGING_DIR);
    deployed = true;
    await addCaddySubdomain(subdomain, domain);
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
