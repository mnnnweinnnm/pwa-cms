/**
 * Push Notification Service
 * Handles VAPID configuration, sending notifications, recall logic, and cleanup.
 */
const webpush = require('web-push');
const path = require('path');
const fs = require('fs');

const SUBS_FILE = path.join(__dirname, '../../data/push-subscriptions.json');
const HISTORY_FILE = path.join(__dirname, '../../data/push-history.json');
const LOCK_FILE = SUBS_FILE + '.lock';

// Configure VAPID
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@pwaadminhub.xyz';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// --- File-based lock for concurrent writes ---
function acquireLock(maxWaitMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      fs.mkdirSync(LOCK_FILE);
      return true;
    } catch (e) {
      // Lock exists, check if stale (>10s)
      try {
        const stat = fs.statSync(LOCK_FILE);
        if (Date.now() - stat.mtimeMs > 10000) {
          fs.rmdirSync(LOCK_FILE);
          continue;
        }
      } catch (_) { /* lock was released */ continue; }
      // Wait a bit
      const waitUntil = Date.now() + 50;
      while (Date.now() < waitUntil) { /* busy wait */ }
    }
  }
  throw new Error('Could not acquire lock on push-subscriptions.json');
}

function releaseLock() {
  try { fs.rmdirSync(LOCK_FILE); } catch (_) {}
}

function loadSubscriptions() {
  if (!fs.existsSync(SUBS_FILE)) return [];
  return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8'));
}

function saveSubscriptions(subs) {
  fs.mkdirSync(path.dirname(SUBS_FILE), { recursive: true });
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));
}

/** Read-modify-write with lock */
function withLock(fn) {
  acquireLock();
  try {
    const subs = loadSubscriptions();
    const result = fn(subs);
    saveSubscriptions(result.subs !== undefined ? result.subs : subs);
    return result;
  } finally {
    releaseLock();
  }
}

// --- Core functions ---

function addSubscription({ subscription, campaignId, pkgId, meta }) {
  return withLock((subs) => {
    // Deduplicate by endpoint
    const existing = subs.find(s => s.subscription.endpoint === subscription.endpoint);
    if (existing) {
      existing.subscription = subscription;
      existing.campaignId = campaignId || existing.campaignId;
      existing.meta = { ...existing.meta, ...meta };
      existing.active = true;
      return { subs, record: existing };
    }
    const record = {
      id: require('crypto').randomUUID(),
      subscription,
      campaignId: campaignId || null,
      pkgId: pkgId || null,
      subscribedAt: new Date().toISOString(),
      lastPushAt: null,
      recalls: { '24h': null, '48h': null },
      active: true,
      meta: meta || {},
    };
    subs.push(record);
    return { subs, record };
  });
}

function removeSubscription(endpoint) {
  return withLock((subs) => {
    const sub = subs.find(s => s.subscription.endpoint === endpoint);
    if (sub) sub.active = false;
    return { subs, found: !!sub };
  });
}

function getStats() {
  const subs = loadSubscriptions();
  const active = subs.filter(s => s.active);
  const byCampaign = {};
  active.forEach(s => {
    const key = s.campaignId || 'unknown';
    byCampaign[key] = (byCampaign[key] || 0) + 1;
  });
  const recalls24h = subs.filter(s => s.recalls['24h']).length;
  const recalls48h = subs.filter(s => s.recalls['48h']).length;
  return {
    total: subs.length,
    active: active.length,
    inactive: subs.length - active.length,
    byCampaign,
    recalls: { '24h_sent': recalls24h, '48h_sent': recalls48h },
  };
}

async function sendNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (err) {
    return { success: false, statusCode: err.statusCode, message: err.message };
  }
}

async function sendBulk({ campaignId, title, body, url, icon }) {
  const subs = loadSubscriptions();
  const targets = subs.filter(s => {
    if (!s.active) return false;
    if (campaignId && s.campaignId !== campaignId) return false;
    return true;
  });

  const payload = { title, body, url, icon };
  const results = { sent: 0, failed: 0, gone: [] };

  for (const sub of targets) {
    const result = await sendNotification(sub.subscription, payload);
    if (result.success) {
      results.sent++;
      sub.lastPushAt = new Date().toISOString();
    } else {
      results.failed++;
      if (result.statusCode === 410 || result.statusCode === 404) {
        results.gone.push(sub.id);
        sub.active = false;
      }
    }
  }

  // Save updated lastPushAt and deactivated subs
  acquireLock();
  try { saveSubscriptions(subs); } finally { releaseLock(); }

  // Save push history record
  const historyRecord = {
    id: require('crypto').randomUUID(),
    type: 'manual',
    campaignId: campaignId || null,
    title,
    body,
    url: url || null,
    icon: icon || null,
    sentAt: new Date().toISOString(),
    sent: results.sent,
    failed: results.failed,
    total: targets.length,
  };
  appendHistory(historyRecord);

  return results;
}

// Recall messages by language
const RECALL_MESSAGES = {
  '24h': {
    es: { title: '¡Te extrañamos! 🎮', body: 'Vuelve y reclama tu bono de bienvenida. ¡No te lo pierdas!' },
    en: { title: 'We miss you! 🎮', body: 'Come back and claim your welcome bonus. Don\'t miss out!' },
    bn: { title: 'আমরা আপনাকে মিস করি! 🎮', body: 'ফিরে আসুন এবং আপনার স্বাগত বোনাস দাবি করুন!' },
  },
  '48h': {
    es: { title: '🔥 Última oportunidad', body: 'Tu bono exclusivo expira pronto. ¡Entra ahora y gana!' },
    en: { title: '🔥 Last chance', body: 'Your exclusive bonus expires soon. Play now and win!' },
    bn: { title: '🔥 শেষ সুযোগ', body: 'আপনার এক্সক্লুসিভ বোনাস শীঘ্রই মেয়াদ শেষ হবে। এখনই খেলুন!' },
  },
};

/** Load campaigns.json to get targetUrl for recall links */
function loadCampaigns() {
  const campFile = path.join(__dirname, '../../data/campaigns.json');
  if (!fs.existsSync(campFile)) return [];
  return JSON.parse(fs.readFileSync(campFile, 'utf8'));
}

/** Load packages.json to get language info */
function loadPackages() {
  const pkgFile = path.join(__dirname, '../../data/packages.json');
  if (!fs.existsSync(pkgFile)) return [];
  return JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
}

async function processRecalls() {
  const subs = loadSubscriptions();
  const campaigns = loadCampaigns();
  const packages = loadPackages();
  const now = Date.now();
  const H24 = 24 * 60 * 60 * 1000;
  const H48 = 48 * 60 * 60 * 1000;
  const results = { '24h_sent': 0, '48h_sent': 0, failed: 0 };

  for (const sub of subs) {
    if (!sub.active) continue;
    const subscribedAt = new Date(sub.subscribedAt).getTime();
    const elapsed = now - subscribedAt;

    // Determine language from campaign → package
    const campaign = campaigns.find(c => c.id === sub.campaignId);
    const pkg = campaign ? packages.find(p => p.id === campaign.pkgId) : null;
    const lang = pkg?.lang || campaign?.pkgLang || 'es';
    const targetUrl = campaign?.targetUrl || campaign?.downloadUrl || '';

    // 24h recall
    if (elapsed >= H24 && !sub.recalls['24h']) {
      const msgs = RECALL_MESSAGES['24h'][lang] || RECALL_MESSAGES['24h']['es'];
      const payload = { ...msgs, url: targetUrl };
      const result = await sendNotification(sub.subscription, payload);
      if (result.success) {
        sub.recalls['24h'] = new Date().toISOString();
        sub.lastPushAt = new Date().toISOString();
        results['24h_sent']++;
      } else {
        results.failed++;
        if (result.statusCode === 410 || result.statusCode === 404) sub.active = false;
      }
    }

    // 48h recall
    if (elapsed >= H48 && !sub.recalls['48h']) {
      const msgs = RECALL_MESSAGES['48h'][lang] || RECALL_MESSAGES['48h']['es'];
      const payload = { ...msgs, url: targetUrl };
      const result = await sendNotification(sub.subscription, payload);
      if (result.success) {
        sub.recalls['48h'] = new Date().toISOString();
        sub.lastPushAt = new Date().toISOString();
        results['48h_sent']++;
      } else {
        results.failed++;
        if (result.statusCode === 410 || result.statusCode === 404) sub.active = false;
      }
    }
  }

  // Save updated subs
  acquireLock();
  try { saveSubscriptions(subs); } finally { releaseLock(); }

  // Log recall sends to history
  if (results['24h_sent'] > 0) {
    appendHistory({
      id: require('crypto').randomUUID(),
      type: 'recall_24h',
      campaignId: null,
      title: RECALL_MESSAGES['24h']['es'].title,
      body: RECALL_MESSAGES['24h']['es'].body,
      url: '',
      icon: null,
      sentAt: new Date().toISOString(),
      sent: results['24h_sent'],
      failed: results.failed,
      total: subs.filter(s => s.active).length,
    });
  }
  if (results['48h_sent'] > 0) {
    appendHistory({
      id: require('crypto').randomUUID(),
      type: 'recall_48h',
      campaignId: null,
      title: RECALL_MESSAGES['48h']['es'].title,
      body: RECALL_MESSAGES['48h']['es'].body,
      url: '',
      icon: null,
      sentAt: new Date().toISOString(),
      sent: results['48h_sent'],
      failed: results.failed,
      total: subs.filter(s => s.active).length,
    });
  }

  return results;
}

function appendHistory(record) {
  let history = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try { history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); } catch (_) {}
  }
  history.unshift(record); // newest first
  // Keep last 200 records
  if (history.length > 200) history = history.slice(0, 200);
  fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function getHistory() {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); } catch (_) { return []; }
}

function cleanupExpired() {
  return withLock((subs) => {
    const before = subs.length;
    const cleaned = subs.filter(s => s.active);
    return { subs: cleaned, removed: before - cleaned.length };
  });
}

module.exports = {
  addSubscription,
  removeSubscription,
  getStats,
  sendNotification,
  sendBulk,
  processRecalls,
  cleanupExpired,
  getHistory,
  appendHistory,
  VAPID_PUBLIC_KEY,
};
