/**
 * 部署服務：將生成的下載頁 rsync 到 VPS1
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2-sftp-client');

const VPS1_HOST = '128.199.249.195';
const VPS1_USER = 'root';
const VPS1_KEY = process.env.VPS1_SSH_KEY || process.env.HOME + '/.ssh/id_ed25519';
const REMOTE_BASE = '/var/www/pwa-downloads';

async function deployPage(subdomain, localDir) {
  const sftp = new Client();
  try {
    await sftp.connect({
      host: VPS1_HOST,
      username: VPS1_USER,
      privateKey: fs.readFileSync(VPS1_KEY),
    });

    const remoteDir = `${REMOTE_BASE}/${subdomain}`;
    
    // 確保 remote 目錄存在
    try {
      await sftp.mkdir(remoteDir, true);
    } catch (e) {
      // 可能已存在，忽略
    }

    // 上傳所有檔案
    const files = fs.readdirSync(localDir);
    for (const file of files) {
      const localPath = path.join(localDir, file);
      const remotePath = `${remoteDir}/${file}`;
      if (fs.statSync(localPath).isDirectory()) continue;
      await sftp.put(localPath, remotePath);
      console.log(`Uploaded: ${remotePath}`);
    }

    console.log(`✅ Deploy complete: ${subdomain} -> ${remoteDir}`);
    return true;
  } catch (err) {
    console.error(`❌ Deploy failed: ${err.message}`);
    throw err;
  } finally {
    sftp.end();
  }
}

async function removePage(subdomain) {
  const sftp = new Client();
  try {
    await sftp.connect({
      host: VPS1_HOST,
      username: VPS1_USER,
      privateKey: fs.readFileSync(VPS1_KEY),
    });

    const remoteDir = `${REMOTE_BASE}/${subdomain}`;
    try {
      await sftp.rmdir(remoteDir, true);
      console.log(`✅ Removed: ${remoteDir}`);
    } catch (e) {
      console.log(`Note: ${remoteDir} removal: ${e.message}`);
    }
    return true;
  } catch (err) {
    console.error(`❌ Remove failed: ${err.message}`);
    throw err;
  } finally {
    sftp.end();
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
