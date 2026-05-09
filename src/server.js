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
        <div class="form-group"><label>截圖（可多選，建議 3-5 張）</label><input type="file" name="screenshots" accept="image/*" multiple /></div>
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
    if (isAdmin) document.getElementById('users-nav').style.display = '';

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
    function showTab(name, el) { document.querySelectorAll('.tab-content').forEach(x => x.style.display='none'); document.getElementById('tab-'+name).style.display='block'; document.querySelectorAll('.nav a').forEach(a=>a.classList.remove('active')); if(el) el.classList.add('active'); if(name==='packages') loadPackages(); if(name==='campaigns'){loadCampaigns(); loadPkgOptions();} if(name==='domains') loadDomains(); if(name==='users') loadUsers(); }

    async function loadPackages(){ const pkgs=await api('GET','/api/packages'); document.querySelector('#pkg-table tbody').innerHTML=pkgs.map(p=>'<tr><td>'+esc(p.appName)+'</td><td><span class="badge badge-'+esc(p.lang)+'">'+esc(String(p.lang).toUpperCase())+'</span></td><td>v'+esc(p.version)+'</td><td>'+((p.screenshots||[]).length)+' 張截圖</td><td><button class="btn btn-danger btn-sm" data-action="del-pkg" data-id="'+esc(p.id)+'">刪除</button></td></tr>').join(''); }
    document.getElementById('pkg-form').onsubmit=async(e)=>{e.preventDefault();try{await api('POST','/api/packages',new FormData(e.target));msg('pkg-msg','✅ PWA 包建立成功');e.target.reset();loadPackages();}catch(err){msg('pkg-msg','❌ 建立失敗：'+err.message,false);}};
    async function delPkg(id){ if(!confirm('確認刪除？'))return; await api('DELETE','/api/packages/'+id); loadPackages(); }

    async function loadCampaigns(){ const {campaigns}=await api('GET','/api/campaigns'); document.getElementById('camp-table-body').innerHTML=campaigns.map(c=>'<tr><td>'+esc(c.subdomain)+'</td><td>'+esc(c.pkgName)+'</td><td><span class="badge badge-'+esc(c.pkgLang)+'">'+esc(String(c.pkgLang).toUpperCase())+'</span></td><td>'+(c.downloadUrl?'<div class="link-box">'+esc(c.downloadUrl)+'</div>':'-')+'</td><td>'+(c.verified?'<span class="badge badge-verified">已驗證</span>':'<span class="badge badge-pending">待驗證</span>')+'</td><td><button class="btn btn-muted btn-sm" data-action="verify-camp" data-id="'+esc(c.id)+'">驗證</button> <button class="btn btn-danger btn-sm" data-action="del-camp" data-id="'+esc(c.id)+'">刪除</button></td></tr>').join(''); }
    async function loadPkgOptions(){ const pkgs=await api('GET','/api/packages'); document.getElementById('camp-pkg-select').innerHTML='<option value="">-- 選擇包 --</option>'+pkgs.map(p=>'<option value="'+p.id+'">'+esc(p.appName)+' ('+esc(String(p.lang).toUpperCase())+')</option>').join(''); const {activeDomains}=await api('GET','/api/campaigns/domains'); document.getElementById('camp-domain-select').innerHTML='<option value="">-- 選擇域名 --</option>'+activeDomains.map(d=>'<option value="'+esc(d)+'">'+esc(d)+'</option>').join(''); }
    document.getElementById('camp-form').onsubmit=async(e)=>{e.preventDefault();try{const r=await api('POST','/api/campaigns',Object.fromEntries(new FormData(e.target)));msg('camp-msg','✅ 建立成功！下載頁：'+r.downloadUrl);e.target.reset();loadCampaigns();}catch(err){msg('camp-msg','❌ 建立失敗：'+err.message,false);}};
    async function verifyCamp(id){ await api('POST','/api/campaigns/'+id+'/verify'); loadCampaigns(); }
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


    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'del-pkg') return delPkg(btn.dataset.id);
      if (action === 'verify-camp') return verifyCamp(btn.dataset.id);
      if (action === 'del-camp') return delCamp(btn.dataset.id);
      if (action === 'domain-status') return setDomainStatus(btn.dataset.domain, btn.dataset.status);
      if (action === 'del-domain') return delDomain(btn.dataset.domain);
      if (action === 'toggle-user') return toggleUser(btn.dataset.id, btn.dataset.active === 'true');
      if (action === 'del-user') return delUser(btn.dataset.id);
    });

    loadPackages();
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`🎯 PWA CMS running on port ${PORT}`);
});
