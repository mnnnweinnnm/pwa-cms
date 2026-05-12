/**
 * 統計數據服務
 * 追蹤：page_view / install_click / install_complete / pwa_open / redirect / push_subscribe
 * 儲存：data/stats.json（按日期分片）
 */
const fs = require('fs');
const path = require('path');

const STATS_DIR = path.join(__dirname, '../../data/stats');
const TZ_OFFSET = 8; // Taipei UTC+8

function ensureDir() {
  fs.mkdirSync(STATS_DIR, { recursive: true });
}

/** Get current date key in Taipei time (YYYY-MM-DD) */
function dateKey(d) {
  if (d) {
    // If given a UTC ISO string, treat it as UTC and convert to Taipei
    const utcMs = new Date(d).getTime();
    const taipeiMs = utcMs + TZ_OFFSET * 3600000;
    return new Date(taipeiMs).toISOString().slice(0, 10);
  }
  // Current time in Taipei
  const taipeiMs = Date.now() + TZ_OFFSET * 3600000;
  return new Date(taipeiMs).toISOString().slice(0, 10);
}

/** Get current UTC ISO timestamp for storage */
function nowUTC() {
  return new Date().toISOString();
}

function statsFilePath(date) {
  return path.join(STATS_DIR, `${date}.json`);
}

function loadDay(date) {
  const fp = statsFilePath(date);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return []; }
}

function appendEvent(event) {
  ensureDir();
  const day = dateKey();
  const fp = statsFilePath(day);
  const events = loadDay(day);

  // pwa_open deduplication: one per device (fingerprint) per campaign per day
  if (event.type === 'pwa_open' && event.fingerprint && event.campaignId) {
    const exists = events.some(e =>
      e.type === 'pwa_open' &&
      e.campaignId === event.campaignId &&
      e.fingerprint === event.fingerprint
    );
    if (exists) return; // already tracked today
  }

  // install_complete deduplication: one per device ever
  if (event.type === 'install_complete' && event.fingerprint && event.campaignId) {
    // Check all existing stat files for this device+campaign
    const allFiles = fs.readdirSync(STATS_DIR).filter(f => f.endsWith('.json'));
    for (const f of allFiles) {
      const dayEvents = loadDay(f.replace('.json', ''));
      const exists = dayEvents.some(e =>
        e.type === 'install_complete' &&
        e.campaignId === event.campaignId &&
        e.fingerprint === event.fingerprint
      );
      if (exists) return; // already installed by this device
    }
  }

  events.push({
    ...event,
    timestamp: nowUTC(),
  });
  fs.writeFileSync(fp, JSON.stringify(events));
}

/**
 * Record a stats event
 * @param {string} type - page_view|install_click|install_complete|pwa_open|redirect|push_subscribe
 * @param {object} meta - { campaignId, pkgId, subdomain, domain, ua, ip, referer, lang, platform, fingerprint }
 */
function recordEvent(type, meta = {}) {
  appendEvent({ type, ...meta });
}

/**
 * Record a pwa_open event from SW (carries fingerprint + ts)
 * @param {string} campaignId
 * @param {string} fingerprint - device fingerprint hash
 * @param {number} ts - client timestamp (ms)
 */
function recordPwaOpen(campaignId, fingerprint, ts) {
  // ts is client-side timestamp; use it only for dateKey, store UTC now
  if (ts) {
    const d = new Date(ts).toISOString();
    appendEvent({ type: 'pwa_open', campaignId, fingerprint, timestamp: nowUTC() });
  } else {
    appendEvent({ type: 'pwa_open', campaignId, fingerprint });
  }
}

/**
 * Query stats with filters
 * @param {object} filters - { from, to, pkgId, campaignId, type }
 * @returns {{ events: array, summary: object }}
 */
function queryStats({ from, to, pkgId, campaignId, type } = {}) {
  ensureDir();
  const files = fs.readdirSync(STATS_DIR).filter(f => f.endsWith('.json')).sort();

  let filtered = [];
  for (const f of files) {
    const day = f.replace('.json', '');
    if (from && day < from) continue;
    if (to && day > to) continue;
    let events = loadDay(day);
    if (pkgId) events = events.filter(e => e.pkgId === pkgId);
    if (campaignId) events = events.filter(e => e.campaignId === campaignId);
    if (type) events = events.filter(e => e.type === type);
    filtered.push(...events);
  }

  // Build summary
  const summary = {
    total: filtered.length,
    byType: {},
    byPkg: {},
    byCampaign: {},
    byDay: {},
  };

  for (const e of filtered) {
    // by type
    summary.byType[e.type] = (summary.byType[e.type] || 0) + 1;
    // by pkg
    if (e.pkgId) {
      summary.byPkg[e.pkgId] = summary.byPkg[e.pkgId] || {};
      summary.byPkg[e.pkgId][e.type] = (summary.byPkg[e.pkgId][e.type] || 0) + 1;
    }
    // by campaign
    if (e.campaignId) {
      summary.byCampaign[e.campaignId] = summary.byCampaign[e.campaignId] || {};
      summary.byCampaign[e.campaignId][e.type] = (summary.byCampaign[e.campaignId][e.type] || 0) + 1;
    }
    // by day - use Taipei date for grouping
    const day = e.timestamp ? dateKey(e.timestamp) : 'unknown';
    summary.byDay[day] = summary.byDay[day] || {};
    summary.byDay[day][e.type] = (summary.byDay[day][e.type] || 0) + 1;
  }

  return { events: filtered, summary };
}

/**
 * Get available date range
 */
function getDateRange() {
  ensureDir();
  const files = fs.readdirSync(STATS_DIR).filter(f => f.endsWith('.json')).sort();
  if (files.length === 0) return { from: dateKey(), to: dateKey() };
  return {
    from: files[0].replace('.json', ''),
    to: files[files.length - 1].replace('.json', ''),
  };
}

module.exports = { recordEvent, queryStats, getDateRange };
