/**
 * 下載頁 HTML 模板（三語系）
 * 素材由 PWA 包提供，目標網址由推廣連結決定
 * 圖片使用絕對 URL，指向 CMS 主機
 */

const LANGS = {
  es: {
    install: 'Instalar',
    rating: 'Valoración',
    downloads: 'Descargas',
    age: '18+',
    developer: 'Desarrollador',
    aboutApp: 'Sobre esta app',
    newFeatures: 'Novedades',
    mayAlsoLike: 'También te puede gustar',
    addToHome: 'Añadir a pantalla de inicio',
    addToHomeDesc: 'Para instalar en tu dispositivo: toca',
    andThen: 'y luego',
    notSupported: 'Tu navegador no soporta instalación PWA.',
    installFailed: 'Instalación fallida. Intenta de nuevo más tarde.',
    close: 'Cerrar',
    containsAds: 'Contiene anuncios',
    inAppPurchases: 'Compras dentro de la app',
    reviews: 'reseñas',
    peopleFound: 'personas encontraron útil esta opinión',
    helpfulYes: 'Sí',
    helpfulNo: 'No',
    similarApps: 'Apps parecidas',
  },
  en: {
    install: 'Install',
    rating: 'Rating',
    downloads: 'Downloads',
    age: '18+',
    developer: 'Developer',
    aboutApp: 'About this app',
    newFeatures: "What's New",
    mayAlsoLike: 'You may also like',
    addToHome: 'Add to Home Screen',
    addToHomeDesc: 'To install on your device: tap',
    andThen: 'and then',
    notSupported: 'Your browser does not support PWA installation.',
    installFailed: 'Installation failed. Try again later.',
    close: 'Close',
    containsAds: 'Contains ads',
    inAppPurchases: 'In-app purchases',
    reviews: 'reviews',
    peopleFound: 'people found this review helpful',
    helpfulYes: 'Yes',
    helpfulNo: 'No',
    similarApps: 'Similar apps',
  },
  bn: {
    install: 'ইনস্টল',
    rating: 'রেটিং',
    downloads: 'ডাউনলোড',
    age: '১৮+',
    developer: 'ডেভেলপার',
    aboutApp: 'অ্যাপ সম্পর্কে',
    newFeatures: 'নতুন কী',
    mayAlsoLike: 'আপনার পছন্দ হতে পারে',
    addToHome: 'হোম স্ক্রিনে যোগ করুন',
    addToHomeDesc: 'আপনার ডিভাইসে ইনস্টল করতে: ট্যাপ করুন',
    andThen: 'এবং তারপর',
    notSupported: 'আপনার ব্রাউজার PWA ইনস্টল সমর্থন করে না।',
    installFailed: 'ইনস্টল ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।',
    close: 'বন্ধ',
    containsAds: 'বিজ্ঞাপন রয়েছে',
    inAppPurchases: 'অ্যাপের মধ্যে কেনাকাটা',
    reviews: 'রিভিউ',
    peopleFound: 'জন এই রিভিউ সহায়ক মনে করেছেন',
    helpfulYes: 'হ্যাঁ',
    helpfulNo: 'না',
    similarApps: 'অনুরূপ অ্যাপস',
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

function buildDownloadPage({ pkg, targetUrl, subdomain, domain, cmsBaseUrl = 'https://admin.xmx99juego.online' }) {
  const lang = LANGS[pkg.lang] || LANGS.es;
  const iconSrc = pkg.iconUrl ? `${cmsBaseUrl}${pkg.iconUrl}` : `${cmsBaseUrl}/uploads/icons/default-icon.png`;
  const screenshots = (pkg.screenshotPaths || pkg.screenshots || []).map((s, i) => {
    const src = s.startsWith('http') ? s : `${cmsBaseUrl}${s}`;
    return `<div class="screenshot-card"><img src="${escapeHtml(src)}" alt="Pantalla ${i + 1}" loading="lazy" /></div>`;
  }).join('\n');

  const appName = escapeHtml(pkg.appName || 'App');
  const version = escapeHtml(pkg.version || '1.0.0');
  const releaseDate = escapeHtml(pkg.releaseDate || new Date().toLocaleDateString());
  const developer = escapeHtml(pkg.developer || 'Official Partner');
  const description = escapeHtml(pkg.description || '');
  const rating = pkg.rating || '4.8';
  const downloadCount = pkg.downloadCount || '10,000+';
  const fallbackUrl = targetUrl || 'https://www.pera57.pro';
  const langCode = pkg.lang || 'es';
  const stars = Math.round(Number(rating));

  const starsSvg = `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;

  return `<!DOCTYPE html>
<html lang="${langCode}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="theme-color" content="#ffffff" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="description" content="${appName} — ${lang.aboutApp}" />
  <title>${appName} — Apps en Google Play</title>
  <link rel="manifest" href="manifest.json" />
  <link rel="apple-touch-icon" href="${iconSrc}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #ffffff;
      --surface: #ffffff;
      --primary-green: #01875f;
      --primary-green-dark: #017048;
      --text-primary: #202124;
      --text-secondary: #5f6368;
      --text-tertiary: #80868b;
      --star-active: #01875f;
      --border: #e8eaed;
      --border-strong: #dadce0;
      --chip-bg: #f1f3f4;
      --rating-bar-bg: #e8eaed;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body { font-family: 'Google Sans', 'Roboto', sans-serif; background: var(--bg); color: var(--text-primary); -webkit-font-smoothing: antialiased; }
    body { max-width: 480px; margin: 0 auto; padding-bottom: 40px; overflow-x: hidden; }
    a { color: var(--primary-green); text-decoration: none; }

    /* Top bar */
    .topbar { display: flex; align-items: center; gap: 16px; padding: 12px 16px; background: #fff; border-bottom: 1px solid var(--border); }
    .topbar-back { width: 24px; height: 24px; flex-shrink: 0; color: var(--text-primary); }
    .topbar-search { flex: 1; display: flex; gap: 12px; align-items: center; }
    .topbar-icon { width: 24px; height: 24px; color: var(--text-secondary); }

    /* App header */
    .app-header { padding: 20px 24px 16px; display: flex; gap: 16px; align-items: center; }
    .app-icon { width: 72px; height: 72px; flex-shrink: 0; border-radius: 18px; overflow: hidden; box-shadow: 0 1px 2px rgba(60,64,67,0.15); }
    .app-icon img { width: 100%; height: 100%; object-fit: cover; }
    .app-meta { flex: 1; min-width: 0; }
    .app-title { font-size: 22px; font-weight: 500; color: var(--text-primary); line-height: 1.2; margin-bottom: 4px; letter-spacing: -0.2px; }
    .app-developer { font-size: 14px; color: var(--primary-green); font-weight: 500; line-height: 1.3; margin-bottom: 2px; }
    .app-ads-note { font-size: 12px; color: var(--text-secondary); line-height: 1.3; }

    /* Stats row */
    .stats-row { display: flex; padding: 8px 16px 20px; justify-content: space-around; align-items: stretch; border-bottom: 1px solid var(--border); }
    .stat-cell { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 4px 0; position: relative; }
    .stat-cell + .stat-cell::before { content: ''; position: absolute; left: 0; top: 14%; bottom: 14%; width: 1px; background: var(--border); }
    .stat-top { font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 3px; }
    .stat-top svg { width: 12px; height: 12px; }
    .stat-bottom { font-size: 11px; color: var(--text-secondary); font-weight: 400; }
    .age-rect { border: 1px solid var(--text-secondary); border-radius: 2px; padding: 2px 5px; font-size: 11px; font-weight: 700; color: var(--text-secondary); line-height: 1; }

    /* Install CTA */
    .cta-wrap { padding: 20px 24px 8px; }
    .btn-install { width: 100%; background: var(--primary-green); color: #fff; border: none; border-radius: 100px; font-size: 14px; font-weight: 500; letter-spacing: 0.2px; padding: 11px 24px; cursor: pointer; transition: background 0.15s; }
    .btn-install:active { background: var(--primary-green-dark); }
    .btn-install:disabled { background: #ddd; color: #888; cursor: default; }
    .install-secondary-info { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 6px 0 0; font-size: 12px; color: var(--text-secondary); }
    .install-secondary-info svg { width: 14px; height: 14px; }

    .extra-actions { display: flex; justify-content: space-around; padding: 12px 16px 16px; border-bottom: 1px solid var(--border); }
    .extra-action { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--primary-green); font-size: 12px; font-weight: 500; }
    .extra-action svg { width: 20px; height: 20px; }

    /* Screenshots */
    .screenshots-scroll { display: flex; overflow-x: auto; gap: 8px; padding: 16px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
    .screenshots-scroll::-webkit-scrollbar { display: none; }
    .screenshot-card { flex: 0 0 200px; height: 400px; border-radius: 12px; overflow: hidden; scroll-snap-align: start; }
    .screenshot-card img { width: 100%; height: 100%; object-fit: cover; display: block; }

    /* Sections */
    section { padding: 16px 24px; border-bottom: 1px solid var(--border); }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
    .section-arrow { width: 20px; height: 20px; color: var(--text-tertiary); }
    .about-text { font-size: 14px; color: var(--text-secondary); line-height: 1.6; white-space: pre-line; }
    .about-text p { margin-bottom: 10px; }
    .tags-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
    .tag-chip { background: var(--chip-bg); color: var(--text-secondary); font-size: 12px; padding: 4px 10px; border-radius: 100px; }
    .updated-row { display: flex; gap: 8px; font-size: 12px; color: var(--text-tertiary); margin-top: 10px; }
    .changelog-text { font-size: 14px; color: var(--text-secondary); line-height: 1.5; }
    .review-item { margin-bottom: 16px; }
    .review-header { display: flex; gap: 10px; margin-bottom: 6px; }
    .review-avatar { width: 36px; height: 36px; border-radius: 50%; background: #ddd; flex-shrink: 0; overflow: hidden; }
    .review-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .review-meta { flex: 1; }
    .review-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .review-stars { display: flex; gap: 2px; margin: 2px 0; }
    .review-stars svg { width: 12px; height: 12px; }
    .review-date { font-size: 11px; color: var(--text-tertiary); }
    .review-text { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-top: 4px; }
    .review-helpful { font-size: 11px; color: var(--text-tertiary); margin-top: 6px; }
    .review-helpful-q { display: flex; gap: 8px; margin-top: 4px; align-items: center; font-size: 12px; color: var(--text-secondary); }
    .helpful-btn { background: #fff; border: 1px solid var(--border-strong); border-radius: 4px; padding: 2px 10px; font-size: 12px; cursor: pointer; color: var(--primary-green); }
    .all-reviews-link { display: block; text-align: center; font-size: 13px; color: var(--primary-green); padding: 12px; }

    /* iOS hint */
    .ios-hint { background: #fff3cd; border: 1px solid #ffeaa7; margin: 12px 16px; padding: 10px 14px; border-radius: 10px; font-size: 13px; color: #856404; line-height: 1.5; }

    /* Install bar (bottom) */
    .install-bar-fixed { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 10px 16px; box-shadow: 0 -2px 8px rgba(0,0,0,0.1); display: flex; gap: 10px; z-index: 100; max-width: 480px; margin: 0 auto; }
    .install-bar-fixed .btn-install-fixed { flex: 1; background: var(--primary-green); color: #fff; border: none; border-radius: 100px; font-size: 14px; font-weight: 500; padding: 12px; cursor: pointer; }
    .install-bar-fixed .btn-install-fixed:active { background: var(--primary-green-dark); }

    /* Modal */
    #install-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; align-items: center; justify-content: center; padding: 20px; }
    #install-modal.show { display: flex; }
    .modal-content { background: #fff; border-radius: 16px; padding: 24px; max-width: 360px; width: 100%; text-align: center; }
    .modal-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
    .modal-step { background: #f5f5f5; border-radius: 12px; padding: 14px; margin: 8px 0; font-size: 14px; color: #333; text-align: left; display: flex; align-items: center; gap: 10px; }
    .modal-step-icon { font-size: 20px; }
    .modal-close { margin-top: 16px; background: #eee; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; }
    .modal-close:hover { background: #ddd; }

    @media (min-width: 481px) { body { border-left: 1px solid var(--border); border-right: 1px solid var(--border); } }
  </style>
</head>
<body>

  <!-- Top bar -->
  <div class="topbar">
    <svg class="topbar-back" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
    <div class="topbar-search">
      <svg class="topbar-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
    </div>
  </div>

  <!-- App header -->
  <div class="app-header">
    <div class="app-icon">
      <img src="${iconSrc}" alt="${appName}" />
    </div>
    <div class="app-meta">
      <h1 class="app-title">${appName}</h1>
      <div class="app-developer">${developer}</div>
      <div class="app-ads-note">${lang.containsAds} · ${lang.inAppPurchases}</div>
    </div>
  </div>

  <!-- Stats row -->
  <div class="stats-row">
    <div class="stat-cell">
      <div class="stat-top">${rating} ${starsSvg}</div>
      <div class="stat-bottom">${(Number(rating) * 1000).toLocaleString()} ${lang.reviews}</div>
    </div>
    <div class="stat-cell">
      <div class="stat-top">${downloadCount}</div>
      <div class="stat-bottom">${lang.downloads}</div>
    </div>
    <div class="stat-cell">
      <div class="stat-top"><span class="age-rect">${lang.age}</span></div>
      <div class="stat-bottom">Adultos</div>
    </div>
  </div>

  <!-- iOS hint -->
  <div class="ios-hint" id="iosHint">
    <strong>Para instalar en iPhone:</strong> toca el botón <strong>Compartir</strong> en Safari y selecciona <strong>«Añadir a pantalla de inicio»</strong>.
  </div>

  <!-- Install CTA -->
  <div class="cta-wrap">
    <button class="btn-install" id="installBtn">${lang.install}</button>
    <div class="install-secondary-info">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
      Esta app está disponible para tu dispositivo
    </div>
  </div>

  <!-- Extra actions -->
  <div class="extra-actions">
    <div class="extra-action">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
      Lista de deseos
    </div>
    <div class="extra-action">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
      Compartir
    </div>
  </div>

  <!-- Screenshots -->
  <section>
    <div class="screenshots-scroll">
      ${screenshots}
    </div>
  </section>

  <!-- About this app -->
  <section>
    <div class="section-header">
      <h2 class="section-title">${lang.aboutApp}</h2>
      <svg class="section-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
    </div>
    <div class="about-text">${description}</div>
    <div class="tags-row">
      <div class="tag-chip">Casino</div>
      <div class="tag-chip">Juegos de mesa</div>
      <div class="tag-chip">N.º 1 Top de cassation</div>
    </div>
    <div class="updated-row">
      <span>Actualizado el</span>
      <span>${releaseDate}</span>
    </div>
  </section>

  <!-- Reviews section -->
  <section>
    <div class="section-header">
      <h2 class="section-title">Reseñas</h2>
      <svg class="section-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
    </div>
    <div class="review-item">
      <div class="review-header">
        <div class="review-avatar"><img src="${iconSrc}" alt="" /></div>
        <div class="review-meta">
          <div class="review-name">Usuario anónimo</div>
          <div class="review-stars">${Array(stars).fill(`<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`).join('')}</div>
          <div class="review-date">hace 1 semana</div>
        </div>
      </div>
      <div class="review-text">Buena app en general. Me gustaría que agregaran más métodos de pago, pero el juego es muy bueno y las gráficas son top.</div>
      <div class="review-helpful">52 ${lang.peopleFound}</div>
      <div class="review-helpful-q">
        <span>${lang.helpfulYes}</span>
        <button class="helpful-btn">👍 ${lang.helpfulYes}</button>
        <button class="helpful-btn">👎 ${lang.helpfulNo}</button>
      </div>
    </div>
    <a class="all-reviews-link">Ver todas las reseñas</a>
  </section>

  <!-- What's new -->
  <section>
    <div class="section-header">
      <h2 class="section-title">${lang.newFeatures}</h2>
      <svg class="section-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
    </div>
    <div class="changelog-text">Versión ${version} — Nuevos juegos exclusivos añadidos al catálogo, rendimiento mejorado, tiempos de carga más rápidos y corrección de errores menores.</div>
  </section>

  <!-- Similar apps -->
  <section>
    <div class="section-header">
      <h2 class="section-title">${lang.similarApps}</h2>
      <svg class="section-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
    </div>
  </section>

  <!-- Fixed install bar -->
  <div class="install-bar-fixed">
    <button class="btn-install-fixed" id="installBtnFixed">${lang.install}</button>
  </div>

  <!-- iOS install modal -->
  <div id="install-modal">
    <div class="modal-content">
      <div class="modal-title">${lang.addToHome}</div>
      <div class="modal-step"><span class="modal-step-icon">📱</span> ${lang.addToHomeDesc} <strong>⋮</strong></div>
      <div class="modal-step"><span class="modal-step-icon">➕</span> ${lang.addToHome}</div>
      <button class="modal-close" id="modalClose">${lang.close}</button>
    </div>
  </div>

  <script>
    var FALLBACK_URL = "${escapeHtml(fallbackUrl)}";

    function isStandalone() {
      return window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true
        || document.referrer.includes('standalone');
    }

    function redirectOrShowModal() {
      if (isStandalone()) {
        window.location.replace(FALLBACK_URL);
      } else {
        document.getElementById('install-modal').classList.add('show');
      }
    }

    // Top install button — open PWA install prompt or show iOS modal
    document.getElementById('installBtn').addEventListener('click', function(e) {
      e.preventDefault();
      if (typeof beforeInstallPrompt !== 'undefined' && beforeInstallPrompt !== null) {
        beforeInstallPrompt.prompt();
        beforeInstallPrompt.userChoice.then(function(choice) {
          if (choice.outcome === 'accepted') {
            // Installed
          }
          beforeInstallPrompt = null;
        });
      } else {
        // iOS or not supported — show modal
        document.getElementById('install-modal').classList.add('show');
      }
    });

    document.getElementById('installBtnFixed').addEventListener('click', function(e) {
      e.preventDefault();
      if (typeof beforeInstallPrompt !== 'undefined' && beforeInstallPrompt !== null) {
        beforeInstallPrompt.prompt();
        beforeInstallPrompt.userChoice.then(function(choice) {
          if (choice.outcome === 'accepted') {}
          beforeInstallPrompt = null;
        });
      } else {
        document.getElementById('install-modal').classList.add('show');
      }
    });

    document.getElementById('modalClose').addEventListener('click', function() {
      document.getElementById('install-modal').classList.remove('show');
    });

    window.addEventListener('beforeinstallprompt', function(e) {
      e.preventDefault();
      window.beforeInstallPrompt = e;
    });

    window.addEventListener('appinstalled', function() {
      window.beforeInstallPrompt = null;
    });

    document.addEventListener('DOMContentLoaded', function() {
      // If already in standalone mode, redirect
      if (isStandalone()) {
        window.location.replace(FALLBACK_URL);
      }
    });
  </script>
</body>
</html>`;
}

function buildManifest({ pkg, subdomain, domain, cmsBaseUrl = 'https://admin.pwaadminhub.xyz' }) {
  const iconPath = pkg.iconUrl ? `${pkg.iconUrl}` : '/assets/logo.png';
  const iconAbs = iconPath.startsWith('http') ? iconPath : `${cmsBaseUrl}${iconPath}`;
  const startUrl = pkg.targetUrl || 'https://www.pera57.pro';
  const langCode = pkg.lang || 'es';
  return {
    name: pkg.appName || 'App',
    short_name: pkg.appName || 'App',
    description: pkg.description ? pkg.description.substring(0, 200) : '',
    start_url: startUrl,
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    lang: langCode,
    categories: ['entertainment', 'games'],
    icons: [
      { src: iconAbs, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
    screenshots: (pkg.screenshotPaths || pkg.screenshots || []).map((s, i) => {
      const src = s.startsWith('http') ? s : `https://admin.xmx99juego.online${s}`;
      return { src, sizes: '1080x1920', type: 'image/jpeg', form_factor: 'narrow' };
    }),
    prefer_related_applications: false,
  };
}

module.exports = { buildDownloadPage, buildManifest, LANGS };
