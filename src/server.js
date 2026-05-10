/**
 * PWA CMS - Express Server
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const packagesRouter = require('./routes/packages');
const campaignsRouter = require('./routes/campaigns');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const pushRouter = require('./routes/push');
const healthRouter = require('./routes/health-check');
const statsRouter = require('./routes/stats');
const auditRouter = require('./routes/audit');
const { ensureDefaultAdmin, getRequestUser, requireAuth, publicUser } = require('./lib/auth-store');

const app = express();
const PORT = process.env.PORT || 3003;

ensureDefaultAdmin();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/auth', authRouter);
app.use('/api/packages', requireAuth, packagesRouter);
app.use('/api/campaigns', requireAuth, campaignsRouter);
app.use('/api/users', requireAuth, usersRouter);
app.use('/api/push', pushRouter);  // subscribe/unsubscribe are public, stats/send/recall require auth
app.use('/api/health', requireAuth, healthRouter);
app.use('/api/stats', statsRouter);  // /event is public, / and /range require auth
app.use('/api/audit', requireAuth, auditRouter);

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.get('/', (req, res) => res.redirect('/admin'));

app.get('/login', (req, res) => {
  const user = getRequestUser(req);
  if (user) return res.redirect('/admin');
  res.send(`<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>PWA CMS 登入</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f0f2f5;color:#1a1a1a;min-height:100vh;display:flex;align-items:center;justify-content:center}.card{width:360px;background:#fff;border-radius:16px;padding:28px;box-shadow:0 10px 30px rgba(0,0,0,.08)}h1{font-size:22px;margin:0 0 18px}.form-group{margin-bottom:12px}label{display:block;font-size:13px;color:#555;margin-bottom:5px}input{width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:10px;font-size:14px}.btn{width:100%;padding:11px;border:none;border-radius:10px;background:#1a1a2e;color:#fff;font-weight:600;cursor:pointer}.msg{font-size:13px;color:#c53030;margin-top:12px;min-height:18px}
</style></head><body>
<div class="card"><h1>🎯 PWA CMS 登入</h1>
<form id="login-form"><div class="form-group"><label>帳號</label><input name="username" autocomplete="username" required /></div><div class="form-group"><label>密碼</label><input name="password" type="password" autocomplete="current-password" required /></div><button class="btn" type="submit">登入</button><div id="msg" class="msg"></div></form></div>
<script>
document.getElementById('login-form').onsubmit=async(e)=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));const msg=document.getElementById('msg');const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const j=await r.json().catch(()=>({}));if(!r.ok){msg.textContent=j.error||'登入失敗';return;}location.href='/admin';};
</script></body></html>`);
});

app.get('/admin', requireAuth, (req, res) => {
  const currentUser = JSON.stringify(publicUser(req.user));
  res.send(`<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PWA CMS 管理後台</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f2f5; color: #1a1a1a; }
    .nav { background: #1a1a2e; color: #fff; padding: 16px 24px; display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
    .nav h1 { font-size: 18px; font-weight: 600; margin-right: 8px; }
    .nav a { color: #a0aec0; text-decoration: none; font-size: 14px; cursor: pointer; }
    .nav a.active { color: #fff; }
    .spacer { flex: 1; }
    .user-pill { color: #cbd5e0; font-size: 13px; }
    .container { max-width: 1120px; margin: 0 auto; padding: 24px; }
    .card { background: #fff; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .card-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #333; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-size: 13px; color: #555; margin-bottom: 4px; font-weight: 500; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .form-group textarea { height: 80px; resize: vertical; }
    .btn { padding: 10px 20px; border-radius: 8px; border: none; font-size: 14px; font-weight: 500; cursor: pointer; }
    .btn-primary { background: #1a1a2e; color: #fff; }
    .btn-danger { background: #e53e3e; color: #fff; }
    .btn-muted { background: #edf2f7; color: #2d3748; }
    .btn-sm { padding: 6px 10px; font-size: 12px; }
    .table { width: 100%; border-collapse: collapse; }
    .table th { text-align: left; padding: 10px 12px; font-size: 12px; color: #888; text-transform: uppercase; border-bottom: 1px solid #eee; }
    .table td { padding: 12px; font-size: 14px; border-bottom: 1px solid #f5f5f5; vertical-align: top; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    .badge-es { background: #ebf5ff; color: #2b6cb0; }
    .badge-en { background: #f0fff4; color: #276749; }
    .badge-bn { background: #fffaf0; color: #c05621; }
    .badge-active, .badge-verified { background: #c6f6d5; color: #276749; }
    .badge-pending { background: #fefcbf; color: #744210; }
    .badge-disabled { background: #e2e8f0; color: #4a5568; }
    .domain-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .domain-tag { background: #edf2f7; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
    .link-box { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; font-family: monospace; font-size: 13px; word-break: break-all; margin-top: 8px; }
    .msg { padding: 10px 14px; border-radius: 8px; font-size: 13px; margin: 12px 0; }
    .msg-success { background: #c6f6d5; color: #276749; }
    .msg-error { background: #fed7d7; color: #c53030; }
    .hint { font-size: 12px; color: #718096; line-height: 1.5; }
    @media (max-width: 760px) { .form-grid { grid-template-columns: 1fr; } .container { padding: 12px; } .nav { gap: 12px; } }
  </style>
</head>
<body>
  <nav class="nav">
    <h1>🎯 PWA CMS</h1>
    <a class="active" data-tab="packages" onclick="showTab('packages', this)">📦 PWA 包</a>
    <a data-tab="campaigns" onclick="showTab('campaigns', this)">🔗 推廣連結</a>
    <a data-tab="domains" onclick="showTab('domains', this)">🌐 域名設定</a>
    <a data-tab="stats" onclick="showTab('stats', this)">📊 統計</a>
    <a data-tab="health" onclick="showTab('health', this)">🛡️ 域名健康</a>
    <a id="push-nav" data-tab="push" onclick="showTab('push', this)" style="display:none">📲 推播</a>
    <a id="audit-nav" data-tab="audit" onclick="showTab('audit', this)" style="display:none">📋 操作紀錄</a>
    <a id="users-nav" data-tab="users" onclick="showTab('users', this)" style="display:none">👥 使用者</a>
    <span class="spacer"></span><span class="user-pill" id="user-pill"></span><a onclick="logout()">登出</a>
  </nav>

  <div class="container">
    <div id="tab-packages" class="tab-content">
      <div class="card"><div class="card-title">建立 PWA 包</div>
        <form id="pkg-form"><div class="form-grid">
          <div class="form-group"><label>應用名稱</label><input name="appName" required placeholder="My Amazing App" /></div>
          <div class="form-group"><label>語系</label><select name="lang"><option value="es">Español（西班牙）</option><option value="en">English（英語）</option><option value="bn">বাংলা（孟加拉）</option></select></div>
          <div class="form-group"><label>開發者</label><input name="developer" placeholder="Official Partner" /></div>
          <div class="form-group"><label>版本</label><input name="version" value="1.0.0" /></div>
          <div class="form-group"><label>下載量（顯示用）</label><input name="downloadCount" value="10,000+" /></div>
          <div class="form-group"><label>評分</label><input name="rating" value="4.8" /></div>
        </div><div class="form-group"><label>App 說明（About this app）</label><textarea name="description" placeholder="Describe the app..."></textarea></div>
        <div class="form-group"><label>App Icon（PNG/JPG，建議 512x512）</label><input type="file" name="icon" accept="image/png,image/jpeg" /></div>
        <div class="form-group"><label>截圖（可多選，建議 3-5 張，建議尺寸 1080x1920px 或 640x360px）</label><input type="file" name="screenshots" accept="image/*" multiple /></div>
        <button type="submit" class="btn btn-primary">建立 PWA 包</button></form><div id="pkg-msg"></div>
      </div>
      <div class="card"><div class="card-title">PWA 包列表</div><table class="table" id="pkg-table"><thead><tr><th>名稱</th><th>語系</th><th>版本</th><th>素材</th><th>操作</th></tr></thead><tbody></tbody></table></div>
    </div>

    <div id="tab-campaigns" class="tab-content" style="display:none">
      <div class="card"><div class="card-title">建立推廣連結</div>
        <form id="camp-form"><div class="form-grid">
          <div class="form-group"><label>選擇 PWA 包</label><select name="pkgId" required id="camp-pkg-select"><option value="">-- 選擇包 --</option></select></div>
          <div class="form-group"><label>選擇已啟用域名</label><select name="domain" required id="camp-domain-select"><option value="">-- 選擇域名 --</option></select></div>
          <div class="form-group"><label>自訂子網域</label><input name="subdomain" required placeholder="mexico2026" pattern="[a-z0-9-]+" /></div>
          <div class="form-group"><label>目標網址（PWA 安裝後開啟）</label><input name="targetUrl" required placeholder="https://..." /></div>
        </div><button type="submit" class="btn btn-primary">建立連結</button></form><div id="camp-msg"></div>
      </div>
      <div class="card"><div class="card-title">推廣連結列表</div><table class="table"><thead><tr><th>子網域</th><th>PWA 包</th><th>語系</th><th>下載 URL</th><th>狀態</th><th>操作</th></tr></thead><tbody id="camp-table-body"></tbody></table></div>
    </div>

    <div id="tab-domains" class="tab-content" style="display:none">
      <div class="card"><div class="card-title">已啟用域名</div><div class="domain-list" id="active-domain-list"></div>
        <p class="hint">新增域名只會建立「待處理」申請，不會自動購買/搬 DNS/改 Caddy。完成 GoDaddy → Cloudflare → wildcard DNS → Caddy 驗證後，管理員再改成啟用。</p>
      </div>
      <div class="card"><div class="card-title">新增域名申請</div>
        <div class="form-grid"><div class="form-group"><label>域名</label><input id="new-domain" placeholder="example.com" /></div><div class="form-group"><label>備註</label><input id="new-domain-notes" placeholder="用途 / 市場 / 負責人" /></div></div>
        <button class="btn btn-primary" onclick="addDomain()">新增待處理域名</button><div id="domain-msg"></div>
      </div>
      <div class="card"><div class="card-title">域名狀態</div><table class="table"><thead><tr><th>域名</th><th>狀態</th><th>備註</th><th>操作</th></tr></thead><tbody id="domain-table-body"></tbody></table></div>
    </div>

    <div id="tab-health" class="tab-content" style="display:none">
      <div class="card">
        <div class="card-title">🛡️ 域名健康檢查</div>
        <p class="hint" style="margin-bottom:12px">檢查所有 campaign 下載頁是否被 Google SafeBrowsing 標記。需設定 <code>GOOGLE_SAFEBROWSING_KEY</code> 環境變數才能使用 API 檢查；未設定時僅進行 HTTP 狀態檢查。</p>
        <button class="btn btn-primary" id="check-all-btn" onclick="runCheckAll()">🔍 檢查所有域名</button>
        <button class="btn btn-muted" style="margin-left:8px" onclick="loadHealthStatus()">🔄 刷新結果</button>
        <div id="health-msg"></div>
        <div id="health-last-check" style="margin-top:12px;font-size:13px;color:#718096"></div>
      </div>
      <div class="card">
        <div class="card-title">檢查結果</div>
        <table class="table"><thead><tr><th>URL</th><th>狀態</th><th>HTTP</th><th>威脅</th><th>檢查時間</th></tr></thead><tbody id="health-table-body"><tr><td colspan="5" class="hint">尚無檢查結果，點擊上方按鈕開始檢查</td></tr></tbody></table>
      </div>
      <div class="card">
        <div class="card-title">單一 URL 檢查</div>
        <div class="form-grid"><div class="form-group"><label>URL</label><input id="single-health-url" placeholder="https://example.xmx99juego.online/" /></div></div>
        <button class="btn btn-primary" onclick="runSingleCheck()">檢查</button>
        <div id="single-health-msg"></div>
      </div>
    </div>

    <div id="tab-push" class="tab-content" style="display:none">
      <div class="card"><div class="card-title">📊 推播統計</div>
        <div id="push-stats"><p class="hint">載入中...</p></div>
      </div>
      <div class="card"><div class="card-title">📤 手動推播</div>
        <form id="push-form"><div class="form-grid">
          <div class="form-group"><label>Campaign（留空=全部）</label><select name="campaignId" id="push-camp-select"><option value="">-- 全部訂閱者 --</option></select></div>
          <div class="form-group"><label>標題</label><input name="title" required placeholder="Notification title" /></div>
          <div class="form-group"><label>內文</label><input name="body" required placeholder="Notification body" /></div>
          <div class="form-group"><label>連結 URL（選填）</label><input name="url" placeholder="https://..." /></div>
        </div><button class="btn btn-primary" type="submit">發送推播</button></form><div id="push-msg"></div>
      </div>
      <div class="card"><div class="card-title">🔄 自動召回（Recall）</div>
        <div id="recall-stats"></div>
        <button class="btn btn-muted" onclick="triggerRecall()">手動觸發 Recall 檢查</button>
        <div id="recall-msg"></div>
      </div>
      <div class="card"><div class="card-title">📋 發送記錄</div>
        <div id="push-history"><p class="hint">載入中...</p></div>
      </div>
    </div>

    <div id="tab-stats" class="tab-content" style="display:none">
      <div class="card"><div class="card-title">📊 統計 Dashboard</div>
        <div class="form-grid" style="margin-bottom:12px">
          <div class="form-group"><label>推廣連結</label><select id="stats-camp" style="min-width:200px"><option value="">全部</option></select></div>
          <div class="form-group"><label>日期範圍</label><div style="display:flex;gap:8px"><input type="date" id="stats-from" /><input type="date" id="stats-to" /></div></div>
        </div>
        <div id="stats-summary" style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:16px"></div>
        <div id="stats-daily" class="hint"></div>
      </div>
    </div>

    <div id="tab-audit" class="tab-content" style="display:none">
      <div class="card"><div class="card-title">📋 操作紀錄</div>
        <div class="form-grid" style="margin-bottom:12px">
          <div class="form-group"><label>使用者</label><input id="audit-user" placeholder="全部" /></div>
          <div class="form-group"><label>筆數</label><select id="audit-limit" onchange="loadAudit()"><option value="50">50</option><option value="100" selected>100</option><option value="200">200</option></select></div>
        </div>
        <button class="btn btn-muted" onclick="loadAudit()">🔄 刷新</button>
        <table class="table" style="margin-top:12px"><thead><tr><th>時間</th><th>使用者</th><th>操作</th><th>對象</th><th>詳情</th></tr></thead><tbody id="audit-table-body"></tbody></table>
      </div>
    </div>

    <div id="tab-users" class="tab-content" style="display:none">
      <div class="card"><div class="card-title">新增使用者</div>
        <form id="user-form"><div class="form-grid"><div class="form-group"><label>帳號</label><input name="username" required placeholder="user01" /></div><div class="form-group"><label>顯示名稱</label><input name="displayName" placeholder="Team User" /></div><div class="form-group"><label>角色</label><select name="role"><option value="user">一般使用者</option><option value="admin">管理員</option></select></div><div class="form-group"><label>初始密碼</label><input name="password" type="password" required minlength="8" /></div></div><button class="btn btn-primary" type="submit">建立使用者</button></form><div id="user-msg"></div>
      </div>
      <div class="card"><div class="card-title">使用者列表</div><table class="table"><thead><tr><th>帳號</th><th>名稱</th><th>角色</th><th>狀態</th><th>操作</th></tr></thead><tbody id="user-table-body"></tbody></table></div>
    </div>
  </div>

  <script>
    const currentUser = ${currentUser};
    const isAdmin = currentUser.role === 'admin';
    document.getElementById('user-pill').textContent = currentUser.displayName + ' / ' + currentUser.role;
    if (isAdmin) { document.getElementById('users-nav').style.display = ''; document.getElementById('push-nav').style.display = ''; document.getElementById('audit-nav').style.display = ''; }

    async function api(method, url, body) {
      const opts = { method, headers: {} };
      if (body && !(body instanceof FormData)) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
      else if (body) opts.body = body;
      const r = await fetch(url, opts);
      if (r.status === 401) { location.href = '/login'; throw new Error('請先登入'); }
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Request failed');
      return j;
    }
    function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
    function msg(id, text, ok=true) { const el=document.getElementById(id); if(!el) return; el.className='msg '+(ok?'msg-success':'msg-error'); el.textContent=text; }
    async function logout(){ await api('POST','/api/auth/logout'); location.href='/login'; }
    function showTab(name, el) { document.querySelectorAll('.tab-content').forEach(x => x.style.display='none'); document.getElementById('tab-'+name).style.display='block'; document.querySelectorAll('.nav a').forEach(a=>a.classList.remove('active')); if(el) el.classList.add('active'); if(name==='packages') loadPackages(); if(name==='campaigns'){loadCampaigns(); loadPkgOptions();} if(name==='domains') loadDomains(); if(name==='health') loadHealthStatus(); if(name==='users') loadUsers(); if(name==='push'){loadPushStats();loadPushHistory();} if(name==='stats') loadStats(); if(name==='audit') loadAudit(); }

    async function loadPackages(){ const pkgs=await api('GET','/api/packages'); document.querySelector('#pkg-table tbody').innerHTML=pkgs.map(p=>'<tr><td>'+esc(p.appName)+'</td><td><span class="badge badge-'+esc(p.lang)+'">'+esc(String(p.lang).toUpperCase())+'</span></td><td>v'+esc(p.version)+'</td><td>'+((p.screenshots||[]).length)+' 張截圖</td><td><button class="btn btn-muted btn-sm" data-action="edit-pkg" data-id="'+esc(p.id)+'">編輯</button> <button class="btn btn-danger btn-sm" data-action="del-pkg" data-id="'+esc(p.id)+'">刪除</button></td></tr>').join(''); }
    window.addEventListener('DOMContentLoaded', loadPackages);
    document.getElementById('pkg-form').onsubmit=async(e)=>{e.preventDefault();try{await api('POST','/api/packages',new FormData(e.target));msg('pkg-msg','✅ PWA 包建立成功');e.target.reset();loadPackages();}catch(err){msg('pkg-msg','❌ 建立失敗：'+err.message,false);}};
    async function delPkg(id){ if(!confirm('確認刪除？'))return; await api('DELETE','/api/packages/'+id); loadPackages(); }

    async function loadCampaigns(){ const {campaigns}=await api('GET','/api/campaigns'); document.getElementById('camp-table-body').innerHTML=campaigns.map(c=>'<tr><td>'+esc(c.subdomain)+'</td><td>'+esc(c.pkgName)+'</td><td><span class="badge badge-'+esc(c.pkgLang)+'">'+esc(String(c.pkgLang).toUpperCase())+'</span></td><td>'+(c.downloadUrl?'<div class="link-box">'+esc(c.downloadUrl)+'</div>':'-')+'</td><td>'+(c.verified?'<span class="badge badge-verified">已驗證</span>':'<span class="badge badge-pending">待驗證</span>')+'</td><td><button class="btn btn-muted btn-sm" data-action="edit-camp" data-id="'+esc(c.id)+'">編輯</button> <button class="btn btn-muted btn-sm" data-action="redeploy-camp" data-id="'+esc(c.id)+'">重新部署</button> <button class="btn btn-muted btn-sm" data-action="verify-camp" data-id="'+esc(c.id)+'">驗證</button> <button class="btn btn-danger btn-sm" data-action="del-camp" data-id="'+esc(c.id)+'">刪除</button></td></tr>').join(''); }
    async function loadPkgOptions(){ const pkgs=await api('GET','/api/packages'); document.getElementById('camp-pkg-select').innerHTML='<option value="">-- 選擇包 --</option>'+pkgs.map(p=>'<option value="'+p.id+'">'+esc(p.appName)+' ('+esc(String(p.lang).toUpperCase())+')</option>').join(''); const {activeDomains}=await api('GET','/api/campaigns/domains'); document.getElementById('camp-domain-select').innerHTML='<option value="">-- 選擇域名 --</option>'+activeDomains.map(d=>'<option value="'+esc(d)+'">'+esc(d)+'</option>').join(''); }
    document.getElementById('camp-form').onsubmit=async(e)=>{e.preventDefault();const btn=e.target.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='建立中...';try{const r=await api('POST','/api/campaigns',Object.fromEntries(new FormData(e.target)));msg('camp-msg','✅ 建立成功！下載頁：'+r.downloadUrl);e.target.reset();loadCampaigns();}catch(err){msg('camp-msg','❌ 建立失敗：'+err.message,false);}finally{btn.disabled=false;btn.textContent='建立連結';}};
    async function verifyCamp(id){ const btn=document.querySelector('[data-action="verify-camp"][data-id="'+id+'"]'); const orig=btn?btn.textContent:''; if(btn){btn.disabled=true;btn.textContent='驗證中...';}try{await api('POST','/api/campaigns/'+id+'/verify');loadCampaigns();}finally{if(btn){btn.disabled=false;btn.textContent=orig;}}}
    async function delCamp(id){ if(!confirm('確認刪除？會一併移除下載頁'))return; await api('DELETE','/api/campaigns/'+id); loadCampaigns(); }

    async function loadDomains(){ const {domains,activeDomains}=await api('GET','/api/campaigns/domains'); document.getElementById('active-domain-list').innerHTML=activeDomains.map(d=>'<span class="domain-tag">'+esc(d)+'</span>').join('')||'<span class="hint">尚無已啟用域名</span>'; document.getElementById('domain-table-body').innerHTML=domains.map(d=>'<tr><td>'+esc(d.domain)+'</td><td><span class="badge badge-'+esc(d.status)+'">'+esc(d.status)+'</span></td><td>'+esc(d.notes||'')+'</td><td>'+(isAdmin?domainActions(d):'<span class="hint">僅管理員可修改</span>')+'</td></tr>').join(''); }
    function domainActions(d){ return '<button class="btn btn-muted btn-sm" data-action="domain-status" data-domain="'+esc(d.domain)+'" data-status="active">啟用</button> <button class="btn btn-muted btn-sm" data-action="domain-status" data-domain="'+esc(d.domain)+'" data-status="pending">待處理</button> <button class="btn btn-muted btn-sm" data-action="domain-status" data-domain="'+esc(d.domain)+'" data-status="disabled">停用</button> <button class="btn btn-danger btn-sm" data-action="del-domain" data-domain="'+esc(d.domain)+'">刪除</button>'; }
    async function addDomain(){ const d=document.getElementById('new-domain').value.trim(); const notes=document.getElementById('new-domain-notes').value.trim(); if(!d)return; try{await api('POST','/api/campaigns/domains',{domain:d,notes});document.getElementById('new-domain').value='';document.getElementById('new-domain-notes').value='';msg('domain-msg','✅ 已建立待處理域名；需人工完成 DNS/Caddy 後再啟用');loadDomains();}catch(err){msg('domain-msg','❌ 新增失敗：'+err.message,false);} }
    async function setDomainStatus(domain,status){ await api('PATCH','/api/campaigns/domains/'+domain,{status}); loadDomains(); }
    async function delDomain(domain){ if(!confirm('確認刪除此域名紀錄？'))return; await api('DELETE','/api/campaigns/domains/'+domain); loadDomains(); }

    async function loadUsers(){ if(!isAdmin)return; const users=await api('GET','/api/users'); document.getElementById('user-table-body').innerHTML=users.map(u=>'<tr><td>'+esc(u.username)+'</td><td>'+esc(u.displayName)+'</td><td>'+esc(u.role)+'</td><td>'+(u.active?'<span class="badge badge-active">active</span>':'<span class="badge badge-disabled">disabled</span>')+'</td><td><button class="btn btn-muted btn-sm" data-action="toggle-user" data-id="'+esc(u.id)+'" data-active="'+(!u.active)+'">'+(u.active?'停用':'啟用')+'</button> <button class="btn btn-danger btn-sm" data-action="del-user" data-id="'+esc(u.id)+'">刪除</button></td></tr>').join(''); }
    document.getElementById('user-form').onsubmit=async(e)=>{e.preventDefault();try{await api('POST','/api/users',Object.fromEntries(new FormData(e.target)));msg('user-msg','✅ 使用者已建立');e.target.reset();loadUsers();}catch(err){msg('user-msg','❌ 建立失敗：'+err.message,false);}};
    async function toggleUser(id,active){ await api('PATCH','/api/users/'+id,{active}); loadUsers(); }
    async function delUser(id){ if(!confirm('確認刪除此使用者？'))return; await api('DELETE','/api/users/'+id); loadUsers(); }


    async function loadHealthStatus(){ try{ const data=await api('GET','/api/health/status'); renderHealthResults(data); }catch(err){ msg('health-msg','❌ '+err.message,false); } }
    function renderHealthResults(data){ document.getElementById('health-last-check').textContent=data.lastCheckAt?'上次檢查：'+new Date(data.lastCheckAt).toLocaleString():'尚未檢查'; const results=data.results||{}; const urls=Object.keys(results); if(urls.length===0){ document.getElementById('health-table-body').innerHTML='<tr><td colspan="5" class="hint">尚無檢查結果</td></tr>'; return; } document.getElementById('health-table-body').innerHTML=urls.map(u=>{ const r=results[u]; const statusBadge=r.safe?'<span class="badge badge-active">✅ Safe</span>':(r.threats&&r.threats.length?'<span class="badge" style="background:#fed7d7;color:#c53030">🔴 Flagged</span>':'<span class="badge badge-pending">⚠️ Warning</span>'); const httpStr=r.httpStatus?(r.httpStatus<400?'<span style="color:#276749">'+r.httpStatus+'</span>':'<span style="color:#c53030">'+r.httpStatus+'</span>'):(r.httpError?'<span style="color:#c53030">Error</span>':'-'); const threats=r.threats&&r.threats.length?r.threats.map(t=>esc(t.type)).join(', '):'—'; const time=r.checkedAt?new Date(r.checkedAt).toLocaleString():'-'; return '<tr><td style="font-size:12px;word-break:break-all">'+esc(u)+'</td><td>'+statusBadge+'</td><td>'+httpStr+'</td><td style="font-size:12px">'+threats+'</td><td style="font-size:12px">'+time+'</td></tr>'; }).join(''); }
    async function runCheckAll(){ const btn=document.getElementById('check-all-btn'); btn.disabled=true; btn.textContent='檢查中...'; try{ const data=await api('POST','/api/health/check-all'); renderHealthResults(data); msg('health-msg','✅ 檢查完成'); }catch(err){ msg('health-msg','❌ '+err.message,false); } btn.disabled=false; btn.textContent='🔍 檢查所有域名'; }
    async function runSingleCheck(){ const url=document.getElementById('single-health-url').value.trim(); if(!url)return; try{ const r=await api('POST','/api/health/check',{url}); msg('single-health-msg',(r.safe?'✅ Safe':'🔴 Flagged: '+r.threats.map(t=>t.type).join(', '))+(r.httpStatus?' (HTTP '+r.httpStatus+')':'')); }catch(err){ msg('single-health-msg','❌ '+err.message,false); } }

    // Push notification functions
    async function loadPushStats(){
      try {
        const stats = await api('GET','/api/push/stats');
        let html = '<div style="display:flex;gap:24px;flex-wrap:wrap;margin-bottom:12px">';
        html += '<div><strong>'+stats.total+'</strong><br><span class="hint">總訂閱</span></div>';
        html += '<div><strong>'+stats.active+'</strong><br><span class="hint">活躍</span></div>';
        html += '<div><strong>'+stats.inactive+'</strong><br><span class="hint">已停用</span></div>';
        html += '</div>';
        if (stats.byCampaign && Object.keys(stats.byCampaign).length) {
          html += '<div style="margin-top:8px"><strong>By Campaign:</strong><br>';
          for (const [k,v] of Object.entries(stats.byCampaign)) { html += '<span class="badge" style="margin:2px">'+esc(k)+': '+v+'</span> '; }
          html += '</div>';
        }
        document.getElementById('push-stats').innerHTML = html;
        let rhtml = '<div style="margin-bottom:12px">';
        rhtml += '<span class="badge badge-active">24h 已發: '+stats.recalls['24h_sent']+'</span> ';
        rhtml += '<span class="badge badge-active">48h 已發: '+stats.recalls['48h_sent']+'</span>';
        rhtml += '</div>';
        document.getElementById('recall-stats').innerHTML = rhtml;
        try {
          const {campaigns} = await api('GET','/api/campaigns');
          document.getElementById('push-camp-select').innerHTML = '<option value="">-- 全部訂閱者 --</option>' + campaigns.map(c => '<option value="'+esc(c.id)+'">'+esc(c.pkgName)+' ('+esc(c.subdomain)+'.'+esc(c.domain)+')</option>').join('');
        } catch(e) {}
      } catch(err) { document.getElementById('push-stats').innerHTML = '<span class="hint">無法載入: '+esc(err.message)+'</span>'; }
    }
    document.getElementById('push-form').onsubmit=async(e)=>{
      e.preventDefault();
      try {
        const data = Object.fromEntries(new FormData(e.target));
        if (!data.campaignId) delete data.campaignId;
        const r = await api('POST','/api/push/send', data);
        msg('push-msg', '✅ 已發送! sent='+r.sent+' failed='+r.failed);
        loadPushStats();
      } catch(err) { msg('push-msg', '❌ '+err.message, false); }
    };
    async function triggerRecall(){
      try {
        const r = await api('POST','/api/push/recall');
        msg('recall-msg', '✅ Recall 完成: 24h='+r['24h_sent']+' 48h='+r['48h_sent']+' failed='+r.failed);
        loadPushStats();
      } catch(err) { msg('recall-msg', '❌ '+err.message, false); }
    }
    async function loadPushHistory(){
      try {
        const {history} = await api('GET','/api/push/history');
        if (!history || history.length === 0) {
          document.getElementById('push-history').innerHTML = '<p class="hint">尚無發送記錄</p>';
          return;
        }
        var campMap = {};
        try { const {campaigns} = await api('GET','/api/campaigns'); campaigns.forEach(function(c){ campMap[c.id] = c.subdomain+'.'+c.domain; }); } catch(_){}
        var html = '<table class="table"><thead><tr><th>時間</th><th>標題</th><th>內文</th><th>Campaign</th><th>結果</th></tr></thead><tbody>';
        history.forEach(function(h){
          var campLabel = h.campaignId ? (campMap[h.campaignId] || h.campaignId.slice(0,8)) : '全部';
          var dt = new Date(h.sentAt).toLocaleString('zh-TW', {timeZone:'Asia/Taipei'});
          var badge = h.failed === 0 ? 'badge-active' : (h.sent === 0 ? 'badge-disabled' : 'badge-pending');
          var result = h.type === 'recall' ? '🔄 Recall' : '<span class="badge '+badge+'">'+h.sent+'/'+h.total+'</span>';
          html += '<tr><td style="white-space:nowrap;font-size:12px">'+esc(dt)+'</td><td style="max-width:160px;overflow:hidden;text-overflow:ellipsis">'+esc(h.title||'-')+'</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">'+esc(h.body||'-')+'</td><td><span class="hint">'+esc(campLabel)+'</span></td><td>'+result+'</td></tr>';
        });
        html += '</tbody></table>';
        document.getElementById('push-history').innerHTML = html;
      } catch(err) { document.getElementById('push-history').innerHTML = '<span class="hint">載入失敗: '+esc(err.message)+'</span>'; }
    }

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'edit-pkg') return openPkgEditModal(btn.dataset.id);
      if (action === 'edit-camp') return openCampEditModal(btn.dataset.id);
      if (action === 'close-pkg-modal') return closePkgModal();
      if (action === 'close-camp-modal') return closeCampModal();
      if (action === 'del-pkg') return delPkg(btn.dataset.id);
      if (action === 'del-pkg-icon') return delPkgIcon();
      if (action === 'del-pkg-ss') return delPkgScreenshot(btn.dataset.index);
      if (action === 'verify-camp') return verifyCamp(btn.dataset.id);
      if (action === 'del-camp') return delCamp(btn.dataset.id);
      if (action === 'redeploy-camp') return redeployCamp(btn.dataset.id);
      if (action === 'domain-status') return setDomainStatus(btn.dataset.domain, btn.dataset.status);
      if (action === 'del-domain') return delDomain(btn.dataset.domain);
      if (action === 'toggle-user') return toggleUser(btn.dataset.id, btn.dataset.active === 'true');
      if (action === 'del-user') return delUser(btn.dataset.id);
    });

    async function redeployCamp(id) {
      if (!confirm('確認重新部署？會重新產生下載頁')) return;
      try {
        msg('camp-msg', '⏳ 部署中...');
        var r = await api('POST', '/api/campaigns/' + id + '/redeploy');
        msg('camp-msg', r.deployed ? '✅ 部署成功' + (r.verified ? '（已驗證）' : '（未驗證）') : '❌ 部署失敗');
        loadCampaigns();
      } catch(err) { msg('camp-msg', '❌ 部署失敗: ' + err.message, false); }
    }

    // === Stats ===
    async function loadStats() {
      var campId = document.getElementById('stats-camp').value;
      var from = document.getElementById('stats-from').value;
      var to = document.getElementById('stats-to').value;
      var qs = '?';
      if (campId) qs += 'campaignId=' + encodeURIComponent(campId) + '&';
      if (from) qs += 'from=' + from + '&';
      if (to) qs += 'to=' + to + '&';
      try {
        var r = await api('GET', '/api/stats' + qs);
        var s = r.summary;
        var types = ['page_view','install_click','install_complete','pwa_open','redirect','push_subscribe'];
        var labels = ['👁 瀏覽','☝️ 點安裝','✅ 安裝完成','📱 PWA開啟','➡️ 跳轉','🔔 推播訂閱'];
        document.getElementById('stats-summary').innerHTML = types.map(function(t,i) { return '<div style="text-align:center"><div style="font-size:24px;font-weight:700">'+(s.byType[t]||0)+'</div><div class="hint">'+labels[i]+'</div></div>'; }).join('');
        var days = Object.keys(s.byDay||{}).sort().reverse();
        if (days.length) {
          var tbl = '<table class="table"><thead><tr><th>日期</th>' + types.map(function(t,i){return '<th>'+labels[i]+'</th>';}).join('') + '<th>合計</th></tr></thead><tbody>';
          var totals = {}; types.forEach(function(t){ totals[t] = 0; }); var grandTotal = 0;
          days.forEach(function(d) {
            var dayTotal = 0;
            var cells = types.map(function(t){ var v = (s.byDay[d]||{})[t]||0; totals[t] += v; dayTotal += v; return '<td>'+v+'</td>'; }).join('');
            grandTotal += dayTotal;
            tbl += '<tr><td>'+d+'</td>' + cells + '<td style="font-weight:600">'+dayTotal+'</td></tr>';
          });
          tbl += '<tr style="font-weight:700;border-top:2px solid #45475a"><td>📊 加總</td>' + types.map(function(t){ return '<td>'+totals[t]+'</td>'; }).join('') + '<td>'+grandTotal+'</td></tr>';
          tbl += '</tbody></table>';
          document.getElementById('stats-daily').innerHTML = tbl;
        } else { document.getElementById('stats-daily').innerHTML = '<p class="hint">尚無數據</p>'; }
        // populate campaign filter if empty
        var sel = document.getElementById('stats-camp');
        if (sel.options.length <= 1) {
          try {
            var cd = await api('GET','/api/campaigns');
            (cd.campaigns||[]).forEach(function(c){
              var o = document.createElement('option');
              o.value = c.id;
              o.textContent = c.subdomain + '.' + c.domain;
              sel.appendChild(o);
            });
          } catch(e){}
        }
      } catch(err) { document.getElementById('stats-summary').innerHTML = '<span class="hint">載入失敗: '+esc(err.message)+'</span>'; }
    }
    document.getElementById('stats-camp').onchange = loadStats;
    document.getElementById('stats-from').onchange = loadStats;
    document.getElementById('stats-to').onchange = loadStats;

    // === Audit ===
    async function loadAudit() {
      if (!isAdmin) return;
      var user = document.getElementById('audit-user').value.trim();
      var limit = document.getElementById('audit-limit').value;
      var qs = '?limit=' + limit;
      if (user) qs += '&user=' + encodeURIComponent(user);
      try {
        var r = await api('GET', '/api/audit' + qs);
        document.getElementById('audit-table-body').innerHTML = r.entries.map(function(e) {
          return '<tr><td style="font-size:12px;white-space:nowrap">'+new Date(e.timestamp).toLocaleString()+'</td><td>'+esc(e.user)+'</td><td><span class="badge">'+esc(e.action)+'</span></td><td style="font-size:12px">'+esc(e.target)+'</td><td style="font-size:11px;max-width:200px;overflow:hidden;text-overflow:ellipsis">'+esc(JSON.stringify(e.detail||''))+'</td></tr>';
        }).join('');
      } catch(err) { document.getElementById('audit-table-body').innerHTML = '<tr><td colspan="5" class="hint">載入失敗</td></tr>'; }
    }

    // === Package Edit ===
    var _pkgEditId = null;
    async function openPkgEditModal(id) {
      try {
        var pkg = await api('GET', '/api/packages/' + id);
        _pkgEditId = pkg.id;
        document.getElementById('pkg-edit-id').value = pkg.id;
        document.getElementById('pkg-edit-name').value = pkg.appName || '';
        document.getElementById('pkg-edit-dev').value = pkg.developer || '';
        document.getElementById('pkg-edit-ver').value = pkg.version || '';
        document.getElementById('pkg-edit-lang').value = pkg.lang || 'es';
        document.getElementById('pkg-edit-dl').value = pkg.downloadCount || '';
        document.getElementById('pkg-edit-rating').value = pkg.rating || '';
        document.getElementById('pkg-edit-desc').value = pkg.description || '';
        // Icon preview
        var iconBox = document.getElementById('pkg-edit-icon-preview');
        if (pkg.iconUrl) {
          iconBox.innerHTML = '<div style="display:flex;align-items:center;gap:12px"><img src="' + esc(pkg.iconUrl) + '" style="width:64px;height:64px;border-radius:12px;object-fit:cover"><button type="button" data-action="del-pkg-icon" style="padding:4px 10px;background:#f38ba8;border:none;border-radius:4px;color:#1e1e2e;cursor:pointer;font-size:12px">刪除</button></div>';
        } else {
          iconBox.innerHTML = '<span style="color:#6c7086">無 icon</span>';
        }
        // Screenshot previews
        var ssBox = document.getElementById('pkg-edit-ss-preview');
        var ssHtml = '';
        var shots = pkg.screenshots || [];
        for (var i = 0; i < shots.length; i++) {
          ssHtml += '<div style="position:relative;display:inline-block;margin:4px"><img src="' + esc(shots[i]) + '" style="height:120px;border-radius:6px;object-fit:cover"><button type="button" data-action="del-pkg-ss" data-index="' + i + '" style="position:absolute;top:2px;right:2px;background:#f38ba8;border:none;border-radius:50%;width:22px;height:22px;color:#1e1e2e;cursor:pointer;font-size:14px;line-height:20px;padding:0">&times;</button></div>';
        }
        ssBox.innerHTML = ssHtml || '<span style="color:#6c7086">無截圖</span>';
        document.getElementById('pkg-edit-modal').style.display = 'flex';
      } catch(err) { msg('pkg-msg', '❌ 載入失敗: ' + err.message, false); }
    }
    function closePkgModal() { document.getElementById('pkg-edit-modal').style.display = 'none'; _pkgEditId = null; }
    async function delPkgIcon() {
      if (!_pkgEditId || !confirm('確認刪除 icon？')) return;
      try { await api('DELETE', '/api/packages/' + _pkgEditId + '/icon'); openPkgEditModal(_pkgEditId); } catch(e) { alert('刪除失敗'); }
    }
    async function delPkgScreenshot(idx) {
      if (!_pkgEditId || !confirm('確認刪除這張截圖？')) return;
      try { await api('DELETE', '/api/packages/' + _pkgEditId + '/screenshots/' + idx); openPkgEditModal(_pkgEditId); } catch(e) { alert('刪除失敗'); }
    }
    document.getElementById('pkg-edit-form').onsubmit = async function(e) {
      e.preventDefault();
      var id = document.getElementById('pkg-edit-id').value;
      var fd = new FormData(e.target);
      try {
        await fetch('/api/packages/' + id, { method: 'PUT', body: fd });
        closePkgModal();
        msg('pkg-msg', '✅ PWA 包已更新');
        loadPackages();
      } catch(err) { msg('pkg-msg', '❌ 更新失敗: ' + err.message, false); }
    };

    async function openCampEditModal(id) {
      try {
        var c = await api('GET', '/api/campaigns/' + id);
        document.getElementById('camp-edit-id').value = c.id;
        document.getElementById('camp-edit-sub').value = c.subdomain || '';
        document.getElementById('camp-edit-target').value = c.targetUrl || '';
        var pkgs = await api('GET', '/api/packages');
        var opts = '';
        for (var i = 0; i < pkgs.length; i++) {
          var sel = pkgs[i].id === c.pkgId ? ' selected' : '';
          opts += '<option value="' + esc(pkgs[i].id) + '"' + sel + '>' + esc(pkgs[i].appName) + ' (' + String(pkgs[i].lang).toUpperCase() + ')</option>';
        }
        document.getElementById('camp-edit-pkg').innerHTML = opts;
        var dd = await api('GET', '/api/campaigns/domains');
        var dopts = '';
        for (var j = 0; j < dd.activeDomains.length; j++) {
          var dsel = dd.activeDomains[j] === c.domain ? ' selected' : '';
          dopts += '<option value="' + esc(dd.activeDomains[j]) + '"' + dsel + '>' + esc(dd.activeDomains[j]) + '</option>';
        }
        document.getElementById('camp-edit-domain').innerHTML = dopts;
        document.getElementById('camp-edit-modal').style.display = 'flex';
      } catch(err) { msg('camp-msg', '❌ 載入失敗: ' + err.message, false); }
    }
    function closeCampModal() { document.getElementById('camp-edit-modal').style.display = 'none'; }
    document.getElementById('camp-edit-form').onsubmit = async function(e) {
      e.preventDefault();
      var id = document.getElementById('camp-edit-id').value;
      var data = { subdomain: document.getElementById('camp-edit-sub').value, domain: document.getElementById('camp-edit-domain').value, targetUrl: document.getElementById('camp-edit-target').value, pkgId: document.getElementById('camp-edit-pkg').value };
      try {
        await api('PUT', '/api/campaigns/' + id, data);
        closeCampModal();
        msg('camp-msg', '✅ 推廣連結已更新');
        loadCampaigns();
      } catch(err) { msg('camp-msg', '❌ 更新失敗: ' + err.message, false); }
    };

    loadPackages();
    if(location.hash==='#health') showTab('health',document.querySelector('[data-tab="health"]'));
    if(location.hash==='#stats') showTab('stats',document.querySelector('[data-tab="stats"]'));
  </script>

  <div id="pkg-edit-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:999;align-items:center;justify-content:center">
    <div style="background:#1e1e2e;border-radius:12px;padding:24px;width:480px;max-width:90vw;max-height:90vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="margin:0;color:#cdd6f4">📦 編輯 PWA 包</h3>
        <button data-action="close-pkg-modal" style="background:none;border:none;color:#cdd6f4;font-size:20px;cursor:pointer">&times;</button>
      </div>
      <form id="pkg-edit-form" enctype="multipart/form-data">
        <input type="hidden" name="id" id="pkg-edit-id">
        <div style="margin-bottom:12px"><label style="color:#a6adc8;display:block;margin-bottom:4px">Icon</label><div id="pkg-edit-icon-preview" style="margin-bottom:8px"></div><input type="file" name="icon" accept="image/*" style="color:#cdd6f4;font-size:12px"></div>
        <div style="margin-bottom:12px"><label style="color:#a6adc8;display:block;margin-bottom:4px">應用名稱</label><input type="text" name="appName" id="pkg-edit-name" required style="width:100%;padding:8px;background:#313244;border:1px solid #45475a;border-radius:6px;color:#cdd6f4"></div>
        <div style="display:flex;gap:12px;margin-bottom:12px">
          <div style="flex:1"><label style="color:#a6adc8;display:block;margin-bottom:4px">開發者</label><input type="text" name="developer" id="pkg-edit-dev" style="width:100%;padding:8px;background:#313244;border:1px solid #45475a;border-radius:6px;color:#cdd6f4"></div>
          <div style="flex:1"><label style="color:#a6adc8;display:block;margin-bottom:4px">版本</label><input type="text" name="version" id="pkg-edit-ver" style="width:100%;padding:8px;background:#313244;border:1px solid #45475a;border-radius:6px;color:#cdd6f4"></div>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:12px">
          <div style="flex:1"><label style="color:#a6adc8;display:block;margin-bottom:4px">語系</label><select name="lang" id="pkg-edit-lang" style="width:100%;padding:8px;background:#313244;border:1px solid #45475a;border-radius:6px;color:#cdd6f4"><option value="es">ES 西班牙</option><option value="en">EN 英語</option><option value="bn">BN 孟加拉</option></select></div>
          <div style="flex:1"><label style="color:#a6adc8;display:block;margin-bottom:4px">下載量</label><input type="text" name="downloadCount" id="pkg-edit-dl" style="width:100%;padding:8px;background:#313244;border:1px solid #45475a;border-radius:6px;color:#cdd6f4"></div>
          <div style="flex:1"><label style="color:#a6adc8;display:block;margin-bottom:4px">評分</label><input type="text" name="rating" id="pkg-edit-rating" style="width:100%;padding:8px;background:#313244;border:1px solid #45475a;border-radius:6px;color:#cdd6f4"></div>
        </div>
        <div style="margin-bottom:12px"><label style="color:#a6adc8;display:block;margin-bottom:4px">截圖</label><div id="pkg-edit-ss-preview" style="margin-bottom:8px;max-height:200px;overflow-y:auto"></div><label style="color:#6c7086;font-size:12px">新增截圖（可多選）</label><input type="file" name="screenshots" accept="image/*" multiple style="color:#cdd6f4;font-size:12px"></div>
        <div style="margin-bottom:16px"><label style="color:#a6adc8;display:block;margin-bottom:4px">說明</label><textarea name="description" id="pkg-edit-desc" rows="2" style="width:100%;padding:8px;background:#313244;border:1px solid #45475a;border-radius:6px;color:#cdd6f4"></textarea></div>
        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button type="button" data-action="close-pkg-modal" style="padding:8px 16px;background:#45475a;border:none;border-radius:6px;color:#cdd6f4;cursor:pointer">取消</button>
          <button type="submit" style="padding:8px 16px;background:#89b4fa;border:none;border-radius:6px;color:#1e1e2e;cursor:pointer;font-weight:600">儲存</button>
        </div>
      </form>
    </div>
  </div>

  <div id="camp-edit-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:999;align-items:center;justify-content:center">
    <div style="background:#1e1e2e;border-radius:12px;padding:24px;width:480px;max-width:90vw;max-height:90vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="margin:0;color:#cdd6f4">🔗 編輯推廣連結</h3>
        <button data-action="close-camp-modal" style="background:none;border:none;color:#cdd6f4;font-size:20px;cursor:pointer">&times;</button>
      </div>
      <form id="camp-edit-form">
        <input type="hidden" name="id" id="camp-edit-id">
        <div style="display:flex;gap:12px;margin-bottom:12px">
          <div style="flex:1"><label style="color:#a6adc8;display:block;margin-bottom:4px">子網域</label><input type="text" name="subdomain" id="camp-edit-sub" required style="width:100%;padding:8px;background:#313244;border:1px solid #45475a;border-radius:6px;color:#cdd6f4"></div>
          <div style="flex:1"><label style="color:#a6adc8;display:block;margin-bottom:4px">域名</label><select name="domain" id="camp-edit-domain" required style="width:100%;padding:8px;background:#313244;border:1px solid #45475a;border-radius:6px;color:#cdd6f4"></select></div>
        </div>
        <div style="margin-bottom:12px"><label style="color:#a6adc8;display:block;margin-bottom:4px">PWA 包</label><select name="pkgId" id="camp-edit-pkg" required style="width:100%;padding:8px;background:#313244;border:1px solid #45475a;border-radius:6px;color:#cdd6f4"></select></div>
        <div style="margin-bottom:16px"><label style="color:#a6adc8;display:block;margin-bottom:4px">目標網址</label><input type="url" name="targetUrl" id="camp-edit-target" required style="width:100%;padding:8px;background:#313244;border:1px solid #45475a;border-radius:6px;color:#cdd6f4"></div>
        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button type="button" data-action="close-camp-modal" style="padding:8px 16px;background:#45475a;border:none;border-radius:6px;color:#cdd6f4;cursor:pointer">取消</button>
          <button type="submit" style="padding:8px 16px;background:#89b4fa;border:none;border-radius:6px;color:#1e1e2e;cursor:pointer;font-weight:600">儲存</button>
        </div>
      </form>
    </div>
  </div>

</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`🎯 PWA CMS running on port ${PORT}`);
});

