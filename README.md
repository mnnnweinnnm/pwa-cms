# PWA CMS

團隊用 PWA 下載頁管理系統。

## 功能

- **PWA 包管理**：上傳 icon + 截圖 + 文案，建立可複用的 PWA 包（支援西語/英語/孟加拉文）
- **推廣連結建立**：選擇 PWA 包 → 填目標網址 → 選域名 → 填子網域 → 一鍵生成下載頁
- **自動部署**：下載頁直接寫入 VPS2 本機（`/var/www/pwa-downloads/`）
- **DNS 自動路由**：`xxx.{domain}` 自動對應到對應資料夾

## 部署流程（更新代碼）

```bash
# 1. 本地改完推送 GitHub
cd ~/repos/pwa-cms
git add . && git commit -m "..." && git push

# 2. SSH 到 VPS2 拉最新
ssh root@174.138.26.149
cd /var/www/pwa-cms && git pull origin main && npm install && systemctl restart pwa-cms
```

## 架構

```
┌──────────────────────────────────────────────────────────────────┐
│  admin.pwaadminhub.xyz  →  VPS2 :3003 (CMS)                       │
│    /admin                 管理後台                                 │
│    /api/*                  管理 API                               │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  stats.pwaadminhub.xyz  →  VPS2 :3003 (CMS)                       │
│    /api/stats/event       公開統計埋點（前台打這裡，不暴露 admin） │
│    /api/push/subscribe    公開推播訂閱                             │
└──────────────────────────────────────────────────────────────────┘
                    rsync ↓
┌──────────────────────────────────────────────────────────────────┐
│  *.xmx99juego.online           →  VPS2 :80 (Caddy wildcard)       │
│    /var/www/pwa-downloads/{subdomain}/                            │
└──────────────────────────────────────────────────────────────────┘
```

## 環境變數

| 變數 | 說明 |
|------|------|
| `PORT` | 監聽埠（預設 3003） |
| `PWA_DOWNLOAD_BASE` | PWA 下載頁部署目錄，預設 `/var/www/pwa-downloads` |
| `CMS_BASE_URL` | 前台統計/推播 URL，預設 `https://stats.pwaadminhub.xyz`（**前台只打這個，不暴露 admin domain**）|

## 新增域名流程

見 `memory/topics/domain-migration-godaddy-to-cloudflare.md`

TL;DR:
1. CF API 建立 zone
2. CF 加入 `*.download` CNAME
3. GoDaddy 改 NS → CF NS

## 環境變數

| 變數 | 說明 |
|------|------|
| `PORT` | 監聽埠（預設 3003） |
| `PWA_DOWNLOAD_BASE` | PWA 下載頁部署目錄，預設 `/var/www/pwa-downloads` |

## 新增主域名到後台

1. 在 Cloudflare 建立 zone + `*.download` CNAME
2. 在後台「域名設定」頁新增域名（API: `POST /api/campaigns/domains`）

## 前台 URL 分離原則

**前台（STATS_URL / 推播訂閱）打 `stats.pwaadminhub.xyz`**
後台管理打 `admin.pwaadminhub.xyz`
兩個 domain 都 reverse_proxy 到同一個 CMS backend，避免前台原始碼暴露後台網址。
