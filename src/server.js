/**
 * PWA CMS - Express Server
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const packagesRouter = require('./routes/packages');
const campaignsRouter = require('./routes/campaigns');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploaded assets)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/packages', packagesRouter);
app.use('/api/campaigns', campaignsRouter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Simple admin dashboard (serves as the CMS UI)
app.get('/admin', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PWA CMS 管理後台</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f2f5; color: #1a1a1a; }
    .nav { background: #1a1a2e; color: #fff; padding: 16px 24px; display: flex; align-items: center; gap: 24px; }
    .nav h1 { font-size: 18px; font-weight: 600; }
    .nav a { color: #a0aec0; text-decoration: none; font-size: 14px; }
    .nav a.active { color: #fff; }
    .container { max-width: 1100px; margin: 0 auto; padding: 24px; }
    .card { background: #fff; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .card-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #333; }
    .tabs { display: flex; gap: 4px; margin-bottom: 20px; }
    .tab { padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; background: transparent; border: none; color: #666; }
    .tab.active { background: #1a1a2e; color: #fff; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-size: 13px; color: #555; margin-bottom: 4px; font-weight: 500; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .form-group textarea { height: 80px; resize: vertical; }
    .btn { padding: 10px 20px; border-radius: 8px; border: none; font-size: 14px; font-weight: 500; cursor: pointer; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-primary:hover { background: #2d2d4a; }
    .btn-danger { background: #e53e3e; color: #fff; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .table { width: 100%; border-collapse: collapse; }
    .table th { text-align: left; padding: 10px 12px; font-size: 12px; color: #888; text-transform: uppercase; border-bottom: 1px solid #eee; }
    .table td { padding: 12px; font-size: 14px; border-bottom: 1px solid #f5f5f5; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    .badge-es { background: #ebf5ff; color: #2b6cb0; }
    .badge-en { background: #f0fff4; color: #276749; }
    .badge-bn { background: #fffaf0; color: #c05621; }
    .badge-verified { background: #c6f6d5; color: #276749; }
    .badge-pending { background: #fefcbf; color: #744210; }
    .domain-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .domain-tag { background: #edf2f7; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
    .link-box { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; font-family: monospace; font-size: 13px; word-break: break-all; margin-top: 8px; }
    .msg { padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 12px; }
    .msg-success { background: #c6f6d5; color: #276749; }
    .msg-error { background: #fed7d7; color: #c53030; }
  </style>
</head>
<body>
  <nav class="nav">
    <h1>🎯 PWA CMS</h1>
    <a href="#" class="active" onclick="showTab('packages')">📦 PWA 包</a>
    <a href="#" onclick="showTab('campaigns')">🔗 推廣連結</a>
    <a href="#" onclick="showTab('domains')">🌐 域名設定</a>
  </nav>

  <div class="container">
    <!-- PWA 包管理 -->
    <div id="tab-packages" class="tab-content">
      <div class="card">
        <div class="card-title">建立 PWA 包</div>
        <form id="pkg-form">
          <div class="form-grid">
            <div class="form-group"><label>應用名稱</label><input name="appName" required placeholder="My Amazing App" /></div>
            <div class="form-group"><label>語系</label><select name="lang"><option value="es">Español（西班牙）</option><option value="en">English（英語）</option><option value="bn">বাংলা（孟加拉）</option></select></div>
            <div class="form-group"><label>開發者</label><input name="developer" placeholder="Official Partner" /></div>
            <div class="form-group"><label>版本</label><input name="version" value="1.0.0" /></div>
            <div class="form-group"><label>下載量（顯示用）</label><input name="downloadCount" value="10,000+" /></div>
            <div class="form-group"><label>評分</label><input name="rating" value="4.8" /></div>
          </div>
          <div class="form-group"><label>App 說明（About this app）</label><textarea name="description" placeholder="Describe the app..."></textarea></div>
          <div class="form-group"><label>App Icon（PNG, 建議 512x512）</label><input type="file" name="icon" accept="image/png,image/jpeg" /></div>
          <div class="form-group"><label>截圖（可多選）</label><input type="file" name="screenshots" accept="image/*" multiple /></div>
          <button type="submit" class="btn btn-primary">建立 PWA 包</button>
        </form>
        <div id="pkg-msg"></div>
      </div>

      <div class="card">
        <div class="card-title">PWA 包列表</div>
        <table class="table" id="pkg-table">
          <thead><tr><th>名稱</th><th>語系</th><th>版本</th><th>操作</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    </div>

    <!-- 推廣連結管理 -->
    <div id="tab-campaigns" class="tab-content" style="display:none">
      <div class="card">
        <div class="card-title">建立推廣連結</div>
        <form id="camp-form">
          <div class="form-grid">
            <div class="form-group"><label>選擇 PWA 包</label><select name="pkgId" required id="camp-pkg-select"><option value="">-- 選擇包 --</option></select></div>
            <div class="form-group"><label>選擇域名</label><select name="domain" required id="camp-domain-select"><option value="">-- 選擇域名 --</option></select></div>
            <div class="form-group"><label>自訂子網域</label><input name="subdomain" required placeholder="mexico2026" pattern="[a-z0-9-]+" /></div>
            <div class="form-group"><label>目標網址（PWA 安裝後開啟）</label><input name="targetUrl" required placeholder="https://..." /></div>
          </div>
          <button type="submit" class="btn btn-primary">建立連結</button>
        </form>
        <div id="camp-msg"></div>
      </div>

      <div class="card">
        <div class="card-title">推廣連結列表</div>
        <table class="table">
          <thead><tr><th>子網域</th><th>PWA 包</th><th>語系</th><th>下載 URL</th><th>狀態</th><th>操作</th></tr></thead>
          <tbody id="camp-table-body"></tbody>
        </table>
      </div>
    </div>

    <!-- 域名設定 -->
    <div id="tab-domains" class="tab-content" style="display:none">
      <div class="card">
        <div class="card-title">已啟用域名</div>
        <div class="domain-list" id="domain-list"></div>
        <div class="form-group"><label>新增域名</label><input id="new-domain" placeholder="example.com" style="width:calc(100% - 120px)" /> <button class="btn btn-primary btn-sm" onclick="addDomain()">新增</button></div>
        <p style="font-size:12px;color:#888;margin-top:8px">⚠️ 新增域名後，請確認已在 Cloudflare 加入 *.download CNAME 記錄，否則子網域無法正常運作。</p>
      </div>
    </div>
  </div>

  <script>
    async function api(method, url, body) {
      const opts = { method, headers: {} };
      if (body && !(body instanceof FormData)) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      } else if (body) {
        opts.body = body;
      }
      const r = await fetch(url, opts);
      return r.json();
    }

    function showTab(name) {
      document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
      document.getElementById('tab-' + name).style.display = 'block';
      document.querySelectorAll('.nav a').forEach(a => a.classList.remove('active'));
      event?.target?.classList.add('active');
      if (name === 'packages') loadPackages();
      if (name === 'campaigns') { loadCampaigns(); loadPkgOptions(); }
      if (name === 'domains') loadDomains();
    }

    // Packages
    async function loadPackages() {
      const pkgs = await api('GET', '/api/packages');
      const tbody = document.querySelector('#pkg-table tbody');
      tbody.innerHTML = pkgs.map(p => \`<tr>
        <td>\${p.appName}</td>
        <td><span class="badge badge-\${p.lang}">\${p.lang.toUpperCase()}</span></td>
        <td>v\${p.version}</td>
        <td><button class="btn btn-danger btn-sm" onclick="delPkg('\${p.id}')">刪除</button></td>
      </tr>\`).join('');
    }

    document.getElementById('pkg-form').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const msg = document.getElementById('pkg-msg');
      try {
        const r = await api('POST', '/api/packages', fd);
        msg.className = 'msg msg-success';
        msg.textContent = '✅ PWA 包建立成功';
        e.target.reset();
        loadPackages();
      } catch (err) {
        msg.className = 'msg msg-error';
        msg.textContent = '❌ 建立失敗：' + err.message;
      }
    };

    async function delPkg(id) {
      if (!confirm('確認刪除？')) return;
      await api('DELETE', \`/api/packages/\${id}\`);
      loadPackages();
    }

    // Campaigns
    async function loadCampaigns() {
      const { campaigns } = await api('GET', '/api/campaigns');
      document.getElementById('camp-table-body').innerHTML = campaigns.map(c => \`<tr>
        <td>\${c.subdomain}</td>
        <td>\${c.pkgName}</td>
        <td><span class="badge badge-\${c.pkgLang}">\${c.pkgLang.toUpperCase()}</span></td>
        <td>\${c.downloadUrl ? \`<div class="link-box">\${c.downloadUrl}</div>\` : '-'}</td>
        <td>\${c.verified ? '<span class="badge badge-verified">已驗證</span>' : '<span class="badge badge-pending">待驗證</span>'}</td>
        <td><button class="btn btn-sm" onclick="verifyCamp('\${c.id}')">驗證</button> <button class="btn btn-danger btn-sm" onclick="delCamp('\${c.id}')">刪除</button></td>
      </tr>\`).join('');
    }

    async function loadPkgOptions() {
      const pkgs = await api('GET', '/api/packages');
      document.getElementById('camp-pkg-select').innerHTML = '<option value="">-- 選擇包 --</option>' +
        pkgs.map(p => \`<option value="\${p.id}">\${p.appName} (\${p.lang.toUpperCase()})</option>\`).join('');
      const { domains } = await api('GET', '/api/campaigns');
      document.getElementById('camp-domain-select').innerHTML = '<option value="">-- 選擇域名 --</option>' +
        domains.map(d => \`<option value="\${d}">\${d}</option>\`).join('');
    }

    document.getElementById('camp-form').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = Object.fromEntries(fd);
      const msg = document.getElementById('camp-msg');
      try {
        const r = await api('POST', '/api/campaigns', data);
        if (r.error) throw new Error(r.error);
        msg.className = 'msg msg-success';
        msg.textContent = \`✅ 建立成功！下載頁：\${r.downloadUrl}\`;
        e.target.reset();
        loadCampaigns();
      } catch (err) {
        msg.className = 'msg msg-error';
        msg.textContent = '❌ 建立失敗：' + err.message;
      }
    };

    async function verifyCamp(id) {
      await api('POST', \`/api/campaigns/\${id}/verify\`);
      loadCampaigns();
    }

    async function delCamp(id) {
      if (!confirm('確認刪除？會一併移除下載頁')) return;
      await api('DELETE', \`/api/campaigns/\${id}\`);
      loadCampaigns();
    }

    // Domains
    async function loadDomains() {
      const { domains } = await api('GET', '/api/campaigns');
      document.getElementById('domain-list').innerHTML = domains.map(d => \`<span class="domain-tag">\${d}</span>\`).join('');
    }

    async function addDomain() {
      const d = document.getElementById('new-domain').value.trim();
      if (!d) return;
      await api('POST', '/api/campaigns/domains', { domain: d });
      document.getElementById('new-domain').value = '';
      loadDomains();
    }

    loadPackages();
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`🎯 PWA CMS running on port ${PORT}`);
});
