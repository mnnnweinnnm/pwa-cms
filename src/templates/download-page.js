/**
 * 下載頁 HTML 模板（三語系）
 * 素材由 PWA 包提供，目標網址由推廣連結決定
 */

const LANGS = {
  es: {
    install: 'Instalar',
    rating: 'Valoración',
    downloads: 'descargas',
    age: '12+',
    developer: 'Desarrollador',
    aboutApp: 'Sobre esta app',
    newFeatures: 'Características',
    mayAlsoLike: 'También te puede gustar',
    addToHome: 'Añadir a pantalla de inicio',
    addToHomeDesc: 'To install, tap',
    andThen: 'and then',
    notSupported: 'Your browser does not support PWA installation.',
    installFailed: 'Installation failed. Try again later.',
    close: 'Close',
  },
  en: {
    install: 'Install',
    rating: 'Rating',
    downloads: 'downloads',
    age: '12+',
    developer: 'Developer',
    aboutApp: 'About this app',
    newFeatures: 'Features',
    mayAlsoLike: 'You may also like',
    addToHome: 'Add to Home Screen',
    addToHomeDesc: 'To install, tap',
    andThen: 'and then',
    notSupported: 'Your browser does not support PWA installation.',
    installFailed: 'Installation failed. Try again later.',
    close: 'Close',
  },
  bn: {
    install: 'ইনস্টল',
    rating: 'রেটিং',
    downloads: 'ডাউনলোড',
    age: '১২+',
    developer: 'ডেভেলপার',
    aboutApp: 'অ্যাপ সম্পর্কে',
    newFeatures: 'বৈশিষ্ট্য',
    mayAlsoLike: 'আপনার পছন্দ হতে পারে',
    addToHome: 'হোম স্ক্রিনে যোগ করুন',
    addToHomeDesc: 'ইনস্টল করতে, ট্যাপ করুন',
    andThen: 'এবং তারপর',
    notSupported: 'আপনার ব্রাউজার PWA ইনস্টল সমর্থন করে না।',
    installFailed: 'ইনস্টল ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।',
    close: 'বন্ধ',
  },
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildDownloadPage({ pkg, targetUrl, subdomain, domain }) {
  const lang = LANGS[pkg.lang] || LANGS.es;
  const screenshots = (pkg.screenshots || []).map((s, i) => `
      <div class="screenshot-item ${i === 0 ? 'active' : ''}">
        <img src="${escapeHtml(s)}" alt="Screenshot ${i + 1}" loading="lazy" />
      </div>`).join('\n');

  const appName = escapeHtml(pkg.appName || 'App');
  const iconUrl = pkg.iconUrl || '/assets/logo.png';
  const version = escapeHtml(pkg.version || '1.0.0');
  const releaseDate = escapeHtml(pkg.releaseDate || new Date().toLocaleDateString());
  const developer = escapeHtml(pkg.developer || 'Official Partner');
  const description = escapeHtml(pkg.description || '');
  const rating = pkg.rating || '4.8';
  const downloadCount = pkg.downloadCount || '10,000+';
  const fallbackUrl = targetUrl || 'https://www.pera57.pro';

  return `<!DOCTYPE html>
<html lang="${pkg.lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${appName}</title>
  <meta name="theme-color" content="#25d366" />
  <link rel="manifest" href="manifest.json" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #f5f5f5; color: #1a1a1a; padding-bottom: 80px; }
    .header { background: #fff; padding: 20px; display: flex; gap: 16px; align-items: center; border-bottom: 1px solid #eee; }
    .app-icon { width: 72px; height: 72px; border-radius: 16px; object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .app-info { flex: 1; }
    .app-name { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .developer { font-size: 13px; color: #666; margin-bottom: 6px; }
    .meta { display: flex; gap: 12px; font-size: 12px; color: #888; align-items: center; }
    .rating-badge { background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 12px; font-weight: 600; }
    .screenshots { background: #fff; margin: 12px 0; padding: 16px 0; }
    .screenshots-track { display: flex; overflow-x: auto; gap: 10px; padding: 0 16px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
    .screenshots-track::-webkit-scrollbar { display: none; }
    .screenshot-item { flex: 0 0 200px; height: 400px; border-radius: 12px; overflow: hidden; scroll-snap-align: start; }
    .screenshot-item img { width: 100%; height: 100%; object-fit: cover; }
    .section { background: #fff; margin: 12px; border-radius: 12px; padding: 16px; }
    .section-title { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #333; }
    .about-text { font-size: 14px; color: #555; line-height: 1.6; white-space: pre-line; }
    .version-row { display: flex; justify-content: space-between; font-size: 13px; color: #888; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; }
    .install-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 12px 16px; box-shadow: 0 -2px 12px rgba(0,0,0,0.1); display: flex; gap: 12px; z-index: 100; }
    .install-btn { flex: 1; background: #25d366; color: #fff; border: none; padding: 14px; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; }
    .install-btn:active { background: #1fb855; }
    #install-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; align-items: center; justify-content: center; padding: 20px; }
    #install-modal.show { display: flex; }
    .modal-content { background: #fff; border-radius: 16px; padding: 24px; max-width: 360px; width: 100%; text-align: center; }
    .modal-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
    .modal-step { background: #f5f5f5; border-radius: 12px; padding: 14px; margin: 8px 0; font-size: 14px; color: #333; text-align: left; display: flex; align-items: center; gap: 10px; }
    .modal-step-icon { font-size: 20px; }
    .modal-close { margin-top: 16px; background: #eee; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; }
    .modal-close:hover { background: #ddd; }
    .install-status { padding: 10px; text-align: center; font-size: 13px; color: #888; min-height: 44px; }
    .install-status.error { color: #e53935; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="header">
    <img class="app-icon" src="${iconUrl}" alt="${appName}" />
    <div class="app-info">
      <div class="app-name">${appName}</div>
      <div class="developer">${developer}</div>
      <div class="meta">
        <span class="rating-badge">★ ${rating}</span>
        <span>${downloadCount} ${lang.downloads}</span>
        <span>${lang.age}</span>
      </div>
    </div>
  </div>

  <div class="screenshots">
    <div class="screenshots-track">${screenshots}</div>
  </div>

  <div class="section">
    <div class="section-title">${lang.aboutApp}</div>
    <div class="about-text">${description}</div>
    <div class="version-row">
      <span>${lang.newFeatures} · v${version}</span>
      <span>${releaseDate}</span>
    </div>
  </div>

  <div class="install-bar">
    <button class="install-btn" id="installBtn">${lang.install}</button>
  </div>

  <div id="install-modal">
    <div class="modal-content">
      <div class="modal-title">${lang.addToHome}</div>
      <div class="modal-step"><span class="modal-step-icon">📱</span> ${lang.addToHomeDesc} <strong>${lang.andThen} ⋮</strong></div>
      <div class="modal-step"><span class="modal-step-icon">➕</span> ${lang.addToHome}</div>
      <button class="modal-close" id="modalClose">${lang.close}</button>
    </div>
  </div>

  <div class="install-status" id="installStatus"></div>

  <script>
    const FALLBACK_URL = "${fallbackUrl}";
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      document.getElementById('installBtn').addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          deferredPrompt = null;
          if (outcome === 'accepted') {
            document.getElementById('installStatus').textContent = '';
          }
        } else {
          // iOS or fallback — show modal
          document.getElementById('install-modal').classList.add('show');
        }
      });
    });

    window.addEventListener('appinstalled', () => {
      document.getElementById('installStatus').textContent = '';
      deferredPrompt = null;
    });

    document.addEventListener('DOMContentLoaded', () => {
      const btn = document.getElementById('installBtn');
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        btn.addEventListener('click', () => {
          if (!deferredPrompt) {
            document.getElementById('install-modal').classList.add('show');
          }
        });
      } else {
        // Already installed
        btn.textContent = '✓';
        btn.disabled = true;
      }

      document.getElementById('modalClose').addEventListener('click', () => {
        document.getElementById('install-modal').classList.remove('show');
      });

      // PWA Standalone → redirect
      if (window.matchMedia('(display-mode: standalone)').matches) {
        window.location.replace(FALLBACK_URL);
      }
    });
  </script>
</body>
</html>`;
}

function buildManifest({ pkg, subdomain, domain }) {
  const iconPath = pkg.iconUrl || '/assets/logo.png';
  const startUrl = pkg.targetUrl || 'https://www.pera57.pro';
  return {
    name: pkg.appName || 'App',
    short_name: pkg.appName || 'App',
    start_url: startUrl,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#25d366',
    icons: [
      { src: iconPath, sizes: '192x192', type: 'image/png' },
      { src: iconPath, sizes: '512x512', type: 'image/png' },
    ],
  };
}

module.exports = { buildDownloadPage, buildManifest, LANGS };
