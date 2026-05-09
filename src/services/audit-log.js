/**
 * 操作紀錄服務
 * 記錄所有後台操作：建立/刪除包、建立/刪除推廣連結、域名操作、使用者管理、推播發送等
 */
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../data/audit');

function ensureDir() {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function dateKey() {
  return new Date().toISOString().slice(0, 10);
}

function logFilePath(date) {
  return path.join(LOG_DIR, `${date}.json`);
}

function loadDay(date) {
  const fp = logFilePath(date);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return []; }
}

/**
 * @param {string} action - 操作類型
 * @param {object} opts
 * @param {string} opts.user - 執行者
 * @param {string} opts.target - 操作對象
 * @param {object} opts.detail - 額外資訊
 * @param {string} opts.ip
 */
function log(action, { user, target, detail, ip } = {}) {
  ensureDir();
  const day = dateKey();
  const fp = logFilePath(day);
  const entries = loadDay(day);
  entries.push({
    action,
    user: user || 'system',
    target: target || '',
    detail: detail || null,
    ip: ip || '',
    timestamp: new Date().toISOString(),
  });
  fs.writeFileSync(fp, JSON.stringify(entries));
}

/**
 * 查詢紀錄
 * @param {object} filters - { from, to, user, action, limit }
 */
function query({ from, to, user, action, limit } = {}) {
  ensureDir();
  const files = fs.readdirSync(LOG_DIR).filter(f => f.endsWith('.json')).sort().reverse();
  let all = [];
  for (const f of files) {
    const day = f.replace('.json', '');
    if (from && day < from) continue;
    if (to && day > to) continue;
    let entries = loadDay(day);
    if (user) entries = entries.filter(e => e.user === user);
    if (action) entries = entries.filter(e => e.action === action);
    all.push(...entries);
    if (limit && all.length >= limit) break;
  }
  all.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  if (limit) all = all.slice(0, limit);
  return all;
}

module.exports = { log, query };
