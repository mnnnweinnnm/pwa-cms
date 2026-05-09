/**
 * Google SafeBrowsing + basic URL health check service
 */
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/health-checks.json');
const API_KEY = process.env.GOOGLE_SAFEBROWSING_KEY || '';

function loadResults() {
  if (!fs.existsSync(DATA_FILE)) return { lastCheckAt: null, results: {} };
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return { lastCheckAt: null, results: {} }; }
}

function saveResults(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/**
 * Check a single URL against Google SafeBrowsing Lookup API v4
 * @param {string} url
 * @returns {Promise<{safe: boolean, threats: Array, error?: string}>}
 */
async function checkUrl(url) {
  const result = { url, safe: true, threats: [], checkedAt: new Date().toISOString(), method: 'none' };

  // 1. Google SafeBrowsing API check (if key available)
  if (API_KEY) {
    try {
      const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;
      const body = {
        client: { clientId: 'pwa-cms', clientVersion: '1.0.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }],
        },
      };
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      result.method = 'safebrowsing-api';
      if (data.matches && data.matches.length > 0) {
        result.safe = false;
        result.threats = data.matches.map(m => ({
          type: m.threatType,
          platform: m.platformType,
          url: m.threat?.url,
        }));
      }
    } catch (err) {
      result.error = `SafeBrowsing API error: ${err.message}`;
    }
  }

  // 2. Basic HTTP check — look for redirect/block indicators
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const resp = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PWA-CMS-HealthCheck/1.0)' },
    });
    clearTimeout(timeout);

    result.httpStatus = resp.status;
    result.httpMethod = 'fetch';

    // Check for suspicious redirects (e.g., to Google warning page)
    if (resp.status >= 300 && resp.status < 400) {
      const location = resp.headers.get('location') || '';
      if (/safebrowsing|transparencyreport|phishing|malware|deceptive/i.test(location)) {
        result.safe = false;
        result.threats.push({ type: 'SUSPICIOUS_REDIRECT', detail: location });
      }
      result.redirectTo = location;
    }

    // 4xx/5xx might indicate the page is down or blocked
    if (resp.status >= 400) {
      result.httpError = true;
    }
  } catch (err) {
    result.httpError = true;
    result.httpErrorMessage = err.message;
  }

  return result;
}

/**
 * Check multiple URLs and persist results
 * @param {string[]} urls
 * @returns {Promise<Object>}
 */
async function checkUrls(urls) {
  const data = loadResults();
  const results = {};

  for (const url of urls) {
    try {
      results[url] = await checkUrl(url);
    } catch (err) {
      results[url] = { url, safe: true, threats: [], error: err.message, checkedAt: new Date().toISOString() };
    }
  }

  data.lastCheckAt = new Date().toISOString();
  data.results = { ...data.results, ...results };
  saveResults(data);
  return { lastCheckAt: data.lastCheckAt, results };
}

function getLastResults() {
  return loadResults();
}

module.exports = { checkUrl, checkUrls, getLastResults };
