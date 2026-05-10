/**
 * 部署服務：將生成的下載頁寫到本機 VPS2
 *
 * PWA CMS 目前跑在 VPS2（174.138.26.149），下載頁也統一放 VPS2：
 *   /var/www/pwa-downloads/{subdomain}/
 *
 * 不再透過 SFTP 部署到 VPS1，避免 CMS / 前端跨機器造成 DNS、Caddy、驗證不同步。
 */
const fs = require('fs');
const path = require('path');

const DEPLOY_BASE = process.env.PWA_DOWNLOAD_BASE || '/var/www/pwa-downloads';

function ensureReadable(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fs.chmodSync(fullPath, 0o755);
      ensureReadable(fullPath);
    } else {
      fs.chmodSync(fullPath, 0o644);
    }
  }
  fs.chmodSync(dir, 0o755);
}

async function deployPage(subdomain, localDir) {
  try {
    const targetDir = path.join(DEPLOY_BASE, subdomain);
    fs.mkdirSync(DEPLOY_BASE, { recursive: true });
    fs.rmSync(targetDir, { recursive: true, force: true });
    fs.mkdirSync(targetDir, { recursive: true });

    const files = fs.readdirSync(localDir);
    for (const file of files) {
      const localPath = path.join(localDir, file);
      const targetPath = path.join(targetDir, file);
      fs.cpSync(localPath, targetPath, { recursive: true });
      console.log(`Copied: ${targetPath}`);
    }

    ensureReadable(targetDir);
    console.log(`✅ Deploy complete: ${subdomain} -> ${targetDir}`);
    return true;
  } catch (err) {
    console.error(`❌ Deploy failed: ${err.message}`);
    throw err;
  }
}

async function removePage(subdomain) {
  try {
    const targetDir = path.join(DEPLOY_BASE, subdomain);
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.log(`✅ Removed: ${targetDir}`);
    return true;
  } catch (err) {
    console.error(`❌ Remove failed: ${err.message}`);
    throw err;
  }
}

async function verifyDeploy(subdomain, domain) {
  const url = `https://${subdomain}.${domain}/`;
  const maxAttempts = 10;
  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(5000) });
      if (res.ok || res.status === 200 || res.status === 301 || res.status === 302) {
        console.log(`✅ Verified: ${url} (status ${res.status})`);
        return { ok: true, url, status: res.status };
      }
    } catch (e) {
      // DNS 還沒傳播或 Caddy 還沒 reload，等一下
    }
    await delay(3000);
  }

  console.log(`⚠️  Verify timeout: ${url}`);
  return { ok: false, url };
}

module.exports = { deployPage, removePage, verifyDeploy };
