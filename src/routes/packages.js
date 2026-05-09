/**
 * PWA 包管理 API
 * GET    /api/packages          - 列出所有包
 * POST   /api/packages          - 建立新包
 * GET    /api/packages/:id      - 取得單一包
 * PUT    /api/packages/:id      - 更新包
 * DELETE /api/packages/:id      - 刪除包
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const audit = require('../services/audit-log');

// Storage
const UPLOAD_BASE = path.join(__dirname, '../../uploads');
const ICON_DIR = path.join(UPLOAD_BASE, 'icons');
const SCREENSHOT_DIR = path.join(UPLOAD_BASE, 'screenshots');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'icon') cb(null, ICON_DIR);
    else if (file.fieldname === 'screenshots') cb(null, SCREENSHOT_DIR);
    else cb(null, UPLOAD_BASE);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Data file
const DATA_FILE = path.join(__dirname, '../../data/packages.json');

function loadPackages() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function savePackages(pkgs) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(pkgs, null, 2));
}

// GET list
router.get('/', (req, res) => {
  const pkgs = loadPackages();
  res.json(pkgs.map(p => ({ ...p, iconUrl: `/uploads/icons/${path.basename(p.iconPath || '')}`, screenshots: (p.screenshotPaths || []).map(s => `/uploads/screenshots/${path.basename(s)}`) })));
});

// GET one
router.get('/:id', (req, res) => {
  const pkgs = loadPackages();
  const pkg = pkgs.find(p => p.id === req.params.id);
  if (!pkg) return res.status(404).json({ error: 'Not found' });
  res.json({ ...pkg, iconUrl: `/uploads/icons/${path.basename(pkg.iconPath || '')}`, screenshots: (pkg.screenshotPaths || []).map(s => `/uploads/screenshots/${path.basename(s)}`) });
});

// POST create
router.post('/', upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'screenshots', maxCount: 10 }]), (req, res) => {
  const pkgs = loadPackages();
  const { appName, lang, developer, description, version, downloadCount, rating } = req.body;

  const iconPath = req.files['icon']?.[0]?.path || null;
  const screenshotPaths = (req.files['screenshots'] || []).map(f => f.path);

  const pkg = {
    id: uuidv4(),
    appName,
    lang: lang || 'es',
    developer: developer || '',
    description: description || '',
    version: version || '1.0.0',
    downloadCount: downloadCount || '10,000+',
    rating: rating || '4.8',
    releaseDate: new Date().toLocaleDateString(),
    iconPath,
    screenshotPaths,
    createdAt: new Date().toISOString(),
  };

  pkgs.push(pkg);
  savePackages(pkgs);
  audit.log('package.create', { user: req.user?.username, target: pkg.id, detail: { appName, lang, version }, ip: req.ip });
  res.status(201).json({ ...pkg, iconUrl: `/uploads/icons/${path.basename(pkg.iconPath || '')}`, screenshots: (pkg.screenshotPaths || []).map(s => `/uploads/screenshots/${path.basename(s)}`) });
});

// PUT update
router.put('/:id', upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'screenshots', maxCount: 10 }]), (req, res) => {
  const pkgs = loadPackages();
  const idx = pkgs.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const existing = pkgs[idx];
  const updated = {
    ...existing,
    appName: req.body.appName ?? existing.appName,
    lang: req.body.lang ?? existing.lang,
    developer: req.body.developer ?? existing.developer,
    description: req.body.description ?? existing.description,
    version: req.body.version ?? existing.version,
    downloadCount: req.body.downloadCount ?? existing.downloadCount,
    rating: req.body.rating ?? existing.rating,
  };

  if (req.files['icon']?.[0]) {
    updated.iconPath = req.files['icon'][0].path;
  }
  if (req.files['screenshots']?.length) {
    updated.screenshotPaths = [...(existing.screenshotPaths || []), ...req.files['screenshots'].map(f => f.path)];
  }

  pkgs[idx] = updated;
  savePackages(pkgs);
  audit.log('package.update', { user: req.user?.username, target: updated.id, detail: { appName: updated.appName, lang: updated.lang, version: updated.version }, ip: req.ip });
  res.json({ ...updated, iconUrl: `/uploads/icons/${path.basename(updated.iconPath || '')}`, screenshots: (updated.screenshotPaths || []).map(s => `/uploads/screenshots/${path.basename(s)}`) });
});

// DELETE
router.delete('/:id', (req, res) => {
  const pkgs = loadPackages();
  const idx = pkgs.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const [removed] = pkgs.splice(idx, 1);
  savePackages(pkgs);
  audit.log('package.delete', { user: req.user?.username, target: removed.id, detail: { appName: removed.appName }, ip: req.ip });
  res.json({ ok: true, id: removed.id });
});

module.exports = router;
