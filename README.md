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
┌──────────────────────────────────────────────────────┐
│  admin.xmx99juego.online  →  VPS2 :3003 (CMS)        │
│    /admin                   管理後台                  │
│    /api/packages            PWA 包 CRUD              │
│    /api/campaigns           連結建立 + 部署           │
└──────────────────────────────────────────────────────┘
                    rsync ↓
┌──────────────────────────────────────────────────────┐
│  *.xmx99juego.online           →  VPS2 :80            │
│    /var/www/pwa-downloads/{subdomain}/                │
└──────────────────────────────────────────────────────┘
```

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
