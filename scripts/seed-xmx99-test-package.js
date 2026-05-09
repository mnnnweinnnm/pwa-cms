#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const projectRoot = path.resolve(__dirname, '..');
const landingDir = process.env.PWA_LANDING_DIR || '/Users/zhendeweihan/repos/pwa-landing-xmx99';
const dataDir = path.join(projectRoot, 'data');
const uploadDir = path.join(projectRoot, 'uploads');
const iconDir = path.join(uploadDir, 'icons');
const screenshotDir = path.join(uploadDir, 'screenshots');
const packagesFile = path.join(dataDir, 'packages.json');
const domainsFile = path.join(dataDir, 'domains.json');

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}
function copy(src, dest) {
  if (!fs.existsSync(src)) throw new Error(`Missing source asset: ${src}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return dest;
}

fs.mkdirSync(iconDir, { recursive: true });
fs.mkdirSync(screenshotDir, { recursive: true });

const iconPath = copy(path.join(landingDir, 'assets/logo_m2.png'), path.join(iconDir, 'xmx99-logo_m2.png'));
const screenshotNames = [
  'wps_v2_20250306160532.jpg',
  'wps_v2_20250306160544.jpg',
  'wps_v2_20250306160552.jpg',
  'wps_v2_20250306160600.jpg',
  'wps_v2_20250306160609.jpg',
];
const screenshotPaths = screenshotNames.map(name => copy(path.join(landingDir, `assets/${name}`), path.join(screenshotDir, `xmx99-${name}`)));

const packages = readJson(packagesFile, []);
const existingIdx = packages.findIndex(p => p.appName === 'XMX99' || p.id === 'xmx99-pwa-test');
const pkg = {
  id: existingIdx >= 0 ? packages[existingIdx].id : 'xmx99-pwa-test',
  appName: 'XMX99',
  lang: 'es',
  developer: 'XMX99 Entertainment',
  description: 'Vive los juegos más emocionantes de 2026 con gráficos impresionantes, efectos de sonido envolventes y jugabilidad fluida. ¡Disfruta de la adrenalina del entretenimiento en cualquier momento y lugar, directamente desde tu dispositivo móvil!\n\nDescubre juegos populares, recompensas emocionantes y diversión sin parar en una sola experiencia conveniente.\n\nFinal winnings are not guaranteed.',
  version: '2.4.1',
  downloadCount: '1 M+',
  rating: '4.7',
  releaseDate: '2026-05-09',
  iconPath,
  screenshotPaths,
  createdAt: existingIdx >= 0 ? packages[existingIdx].createdAt : new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  source: 'pwa-landing-xmx99 test package',
};
if (existingIdx >= 0) packages[existingIdx] = pkg;
else packages.push(pkg);
writeJson(packagesFile, packages);

const rawDomains = readJson(domainsFile, []);
const domains = Array.isArray(rawDomains) ? rawDomains.map(item => typeof item === 'string' ? { domain: item, status: 'active', notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : item) : [];
if (!domains.some(d => d.domain === 'xmx99juego.online')) {
  domains.push({ domain: 'xmx99juego.online', status: 'active', notes: 'PWA download domain; Cloudflare wildcard + VPS1 Caddy verified', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
}
writeJson(domainsFile, domains);

console.log(JSON.stringify({ ok: true, packageId: pkg.id, screenshots: screenshotPaths.length, domains: domains.length }, null, 2));
