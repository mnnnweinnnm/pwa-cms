/**
 * 下載頁 HTML 模板 - Google Play Store 風格(完整版)
 * 基於 pwa-test.xmx99juego.online 參考模板
 * 圖片使用相對路徑(icon.png, screenshot-N.ext),由 campaigns.js 複製到 staging dir
 */

/**
 * 品牌系統 — 每個品牌有自己的一組 reviews、similar apps、tags、配色
 * 模板合併時：brandData + langData（langData 優先）
 */
const BRANDS = {
  xmx99: {
    name: 'XMX99',
    primaryColor: '#e53935',   // 紅色
    accentColor: '#ffca28',    // 金色
    bgGradient: 'linear-gradient(135deg, #b71c1c 0%, #e53935 50%, #c62828 100%)',
    themeColor: '#e53935',
    tags: ['Casino', 'Juegos de mesa', 'N.º 1 Top de toros'],
    country: '🇲🇽 México',
    reviews: {
      es: [
        { initials: 'RC', name: 'Roberto Cervantes', color: '#01875f', stars: 5, date: '3 mayo 2026', text: 'Me encanta la variedad de juegos. Los gráficos son increíbles y se carga muy rápido. ¡La mejor app de entretenimiento que he probado este año!', helpful: 187 },
        { initials: 'ML', name: 'María López G.', color: '#e91e63', stars: 5, date: '28 abril 2026', text: 'Las recompensas diarias son geniales. Llevo una semana jugando y ya gané bastante. Muy adictiva y divertida, súper recomendada.', helpful: 94 },
        { initials: 'JR', name: 'Jorge Ramírez', color: '#1565c0', stars: 4, date: '22 abril 2026', text: 'Buena app en general. Me gustaría que agregaran más métodos de pago, pero el juego es muy bueno y las gráficas son top.', helpful: 52 },
      ],
      en: [
        { initials: 'JM', name: 'James Miller', color: '#2e7d32', stars: 5, date: 'May 5, 2026', text: 'Best entertainment app I\'ve found! The graphics are amazing and it loads so fast. Definitely the top app of the year for me.', helpful: 203 },
        { initials: 'SL', name: 'Sarah Lee', color: '#7b1fa2', stars: 5, date: 'Apr 30, 2026', text: 'Daily rewards are great! I\'ve been playing for a week and already won quite a bit. Super addictive and fun.', helpful: 112 },
        { initials: 'DK', name: 'David Kim', color: '#c62828', stars: 4, date: 'Apr 25, 2026', text: 'Great app overall. Would love more payment methods. The games are excellent and graphics are top-tier.', helpful: 67 },
      ],
      bn: [
        { initials: 'AR', name: 'Ashraful Rahman', color: '#00695c', stars: 5, date: '৫ মে, ২০২৬', text: 'অসাধারণ অ্যাপ! গ্রাফিক্স দারুণ এবং খুব দ্রুত লোড হয়। এটা সত্যিই সেরা বিনোদন অ্যাপ।', helpful: 89 },
        { initials: 'FK', name: 'Fatima Khatun', color: '#ad1457', stars: 5, date: '২৮ এপ্রিল, ২০২৬', text: 'প্রতিদিনের পুরস্কার দারুণ! খুবই আসক্তিকর এবং মজাদার। সবাইকে সুপারিশ করছি।', helpful: 45 },
        { initials: 'TH', name: 'Tanvir Hasan', color: '#1565c0', stars: 4, date: '২২ এপ্রিল, ২০২৬', text: 'সামগ্রিকভাবে ভালো অ্যাপ। আরও পেমেন্ট পদ্ধতি থাকলে ভালো হতো।', helpful: 31 },
      ],
    },
    similarApps: {
      es: [
        { name: 'Fortuna Max: Casino', rating: '4,3' },
        { name: 'Jackpot Pro Slots', rating: '4,8' },
        { name: 'Gana Hoy', rating: '4,5' },
        { name: 'Mega Win Casino', rating: '4,2' },
      ],
      en: [
        { name: 'Lucky Star Casino', rating: '4,6' },
        { name: 'Gold Rush Slots', rating: '4,7' },
        { name: 'Win Big Today', rating: '4,4' },
        { name: 'Super Jackpot Club', rating: '4,3' },
      ],
      bn: [
        { name: 'Fortune Tiger BD', rating: '4,5' },
        { name: 'Lucky 777 Slots', rating: '4,8' },
        { name: 'Win BD Today', rating: '4,3' },
        { name: 'Mega Win BD', rating: '4,1' },
      ],
    },
  },
  barya: {
    name: 'Barya Online',
    primaryColor: '#6a1b9a',   // 深紫
    accentColor: '#ce93d8',      // 淺紫
    bgGradient: 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #8e24aa 100%)',
    themeColor: '#6a1b9a',
    tags: ['Online Casino', 'Slots', 'Live Casino'],
    country: '🌏 Asia',
    reviews: {
      es: [
        { initials: 'CT', name: 'Carlos Torres', color: '#1565c0', stars: 5, date: '2 mayo 2026', text: 'La mejor app de casino online que he probado. Variedad de juegos excelente y pagos rápidos.', helpful: 156 },
        { initials: 'LP', name: 'Laura Pérez', color: '#c62828', stars: 5, date: '26 abril 2026', text: 'Excelente experiencia. Los juegos en vivo son increíbles y el soporte es muy atento.', helpful: 88 },
        { initials: 'MH', name: 'Miguel Hernández', color: '#2e7d32', stars: 4, date: '20 abril 2026', text: 'Muy buena app. Hay muchas opciones de juego. Los retiros podrían ser más rápidos.', helpful: 63 },
      ],
      en: [
        { initials: 'AJ', name: 'Alex Johnson', color: '#00695c', stars: 5, date: 'May 4, 2026', text: 'Best online casino app I\'ve used! Great game variety and fast payouts. Highly recommended.', helpful: 178 },
        { initials: 'MW', name: 'Maria Wong', color: '#ad1457', stars: 5, date: 'Apr 28, 2026', text: 'Excellent experience. Live dealer games are amazing and customer support is very responsive.', helpful: 94 },
        { initials: 'RK', name: 'Raj Kumar', color: '#1565c0', stars: 4, date: 'Apr 22, 2026', text: 'Very good app overall. Lots of game options. Withdrawals could be faster.', helpful: 57 },
      ],
      bn: [
        { initials: 'ZH', name: 'Zahir Hossain', color: '#00695c', stars: 5, date: '৪ মে, ২০২৬', text: 'সেরা অনলাইন ক্যাসিনো অ্যাপ! গেমের বৈচিত্র্য দারুণ এবং পেআউট দ্রুত।', helpful: 76 },
        { initials: 'NK', name: 'Nusrat Jahan', color: '#ad1457', stars: 5, date: '২৮ এপ্রিল, ২০২৬', text: 'অসাধারণ অভিজ্ঞতা। লাইভ ডিলার গেম অসাধারণ। সাপোর্ট খুবই সাড়াদায়ক।', helpful: 42 },
        { initials: 'BH', name: 'Badrul Islam', color: '#1565c0', stars: 4, date: '২১ এপ্রিল, ২০২৬', text: 'মোটামুটি ভালো অ্যাপ। আরও গেম অপশন আছে।', helpful: 28 },
      ],
    },
    similarApps: {
      es: [
        { name: 'Royal Casino PH', rating: '4,7' },
        { name: 'Phil Win Online', rating: '4,5' },
        { name: 'Lucky Pinas', rating: '4,3' },
        { name: 'Mega Payout Slots', rating: '4,6' },
      ],
      en: [
        { name: 'Royal PH Casino', rating: '4,7' },
        { name: 'Lucky Pinas Online', rating: '4,5' },
        { name: 'Phil Jackpot Pro', rating: '4,3' },
        { name: 'Mega Win PH', rating: '4,6' },
      ],
      bn: [
        { name: 'Royal BD Casino', rating: '4,6' },
        { name: 'Lucky 777 BD', rating: '4,4' },
        { name: 'Win BD Pro', rating: '4,2' },
        { name: 'Mega Payout BD', rating: '4,5' },
      ],
    },
  },
  shadowbet: {
    name: 'Shadow Bet',
    primaryColor: '#1a237e',   // 深藍
    accentColor: '#00e5ff',     // 青色
    bgGradient: 'linear-gradient(135deg, #0d1b2a 0%, #1a237e 50%, #283593 100%)',
    themeColor: '#1a237e',
    tags: ['Sports Betting', 'Live Events', 'Best Odds'],
    country: '🌏 Asia Pacific',
    reviews: {
      es: [
        { initials: 'PG', name: 'Pedro García', color: '#1565c0', stars: 5, date: '1 mayo 2026', text: 'Las mejores cuotas del mercado. Apuesto todos los días y siempre tengo buenas ganancias.', helpful: 201 },
        { initials: 'AV', name: 'Ana Vargas', color: '#c62828', stars: 5, date: '25 abril 2026', text: 'Variedad de deportes increíbles. Puedo apostar en vivo sin problemas. La app es súper fluida.', helpful: 132 },
        { initials: 'RS', name: 'Roberto Silva', color: '#2e7d32', stars: 4, date: '19 abril 2026', text: 'Muy buena plataforma de apuestas. Me encanta la cobertura de eventos deportivos.', helpful: 78 },
      ],
      en: [
        { initials: 'TW', name: 'Tom Williams', color: '#1565c0', stars: 5, date: 'May 3, 2026', text: 'Best odds in the market! I bet every day and always get great returns. The live betting is flawless.', helpful: 245 },
        { initials: 'SC', name: 'Sophie Chen', color: '#c62828', stars: 5, date: 'Apr 27, 2026', text: 'Incredible sports variety. Live betting works perfectly. App is super smooth.', helpful: 167 },
        { initials: 'JM', name: 'John Martinez', color: '#2e7d32', stars: 4, date: 'Apr 21, 2026', text: 'Great betting platform. Love the coverage of sporting events worldwide.', helpful: 89 },
      ],
      bn: [
        { initials: 'RH', name: 'Rashid Ahmed', color: '#1565c0', stars: 5, date: '৩ মে, ২০২৬', text: 'বাজারে সেরা অডস! প্রতিদিন বেট করি এবং সবসময় ভালো রিটার্ন পাই।', helpful: 112 },
        { initials: 'FK', name: 'Farida Khan', color: '#c62828', stars: 5, date: '২৭ এপ্রিল, ২০২৬', text: 'অসাধারণ স্পোর্টস বৈচিত্র্য। লাইভ বেটিং দারুণ কাজ করে। অ্যাপ খুবই স্মুথ।', helpful: 67 },
        { initials: 'AH', name: 'Arif Hassan', color: '#2e7d32', stars: 4, date: '২০ এপ্রিল, ২০২৬', text: 'চমৎকার বেটিং প্ল্যাটফর্ম। বিশ্বব্যাপী স্পোর্টস কভারেজ পছন্দ করি।', helpful: 44 },
      ],
    },
    similarApps: {
      es: [
        { name: 'Bet365 España', rating: '4,8' },
        { name: 'Codere Apuestas', rating: '4,5' },
        { name: 'Betfair ES', rating: '4,6' },
        { name: 'Sportium', rating: '4,3' },
      ],
      en: [
        { name: 'Bet365 Global', rating: '4,9' },
        { name: 'Betfair International', rating: '4,7' },
        { name: 'DraftKings Sports', rating: '4,6' },
        { name: 'FanDuel Sportsbook', rating: '4,5' },
      ],
      bn: [
        { name: 'Bet365 Asia', rating: '4,8' },
        { name: 'Betfair BD', rating: '4,6' },
        { name: 'JeetWin BD', rating: '4,4' },
        { name: 'Baji Live BD', rating: '4,3' },
      ],
    },
  },
};

const LANGS = {
  es: {
    install: 'Instalar',
    open: 'Abrir',
    addToHome: 'Añadir a pantalla de inicio',
    containsAds: 'Contiene anuncios',
    inAppPurchases: 'Compras dentro de la app',
    reviews: 'reseñas',
    downloads: 'Descargas',
    adults: 'Adultos',
    availableForDevice: 'Esta app está disponible para tu dispositivo',
    wishlist: 'Lista de deseos',
    share: 'Compartir',
    aboutApp: 'Acerca de esta app',
    dataSafety: 'Seguridad de los datos',
    dataSafetyIntro: 'La seguridad empieza por entender cómo los desarrolladores recopilan y comparten tus datos.',
    noShareData: 'No se comparten datos con terceros.',
    encryptedData: 'Los datos se cifran en tránsito.',
    canDeleteData: 'Puedes solicitar que se eliminen los datos.',
    ratingsReviews: 'Calificaciones y reseñas',
    phone: 'Teléfono',
    tablet: 'Tablet',
    chromebook: 'Chromebook',
    tv: 'TV',
    helpfulQuestion: '¿Te ha resultado útil?',
    yes: 'Sí',
    no: 'No',
    peopleFoundHelpful: 'personas han indicado que esta opinión les ha resultado útil',
    seeAllReviews: 'Ver todas las reseñas',
    whatsNew: 'Novedades',
    similarApps: 'Apps parecidas',
    appInfo: 'Información de la app',
    website: 'Sitio web',
    privacyPolicy: 'Política de privacidad',
    aboutDev: 'Acerca del desarrollador',
    updatedOn: 'Actualizado el',
    iosHint: 'Para instalar en iPhone:',
    iosShareBtn: 'Compartir',
    iosAddHome: '«Añadir a pantalla de inicio»',
    country: '🇲🇽 México',
    finalDisclaimer: 'Final winnings are not guaranteed.',
    reviewers: null,
    similarAppsData: null,
    versionPrefix: 'Versión',
    changelogSuffix: '- Nuevos juegos exclusivos añadidos al catálogo, rendimiento mejorado, tiempos de carga más rápidos y corrección de errores menores.',
  },
  en: {
    install: 'Install',
    open: 'Open',
    addToHome: 'Add to Home Screen',
    containsAds: 'Contains ads',
    inAppPurchases: 'In-app purchases',
    reviews: 'reviews',
    downloads: 'Downloads',
    adults: 'Adults',
    availableForDevice: 'This app is available for your device',
    wishlist: 'Wishlist',
    share: 'Share',
    aboutApp: 'About this app',
    dataSafety: 'Data safety',
    dataSafetyIntro: 'Safety starts with understanding how developers collect and share your data.',
    noShareData: 'No data shared with third parties.',
    encryptedData: 'Data is encrypted in transit.',
    canDeleteData: 'You can request that data be deleted.',
    ratingsReviews: 'Ratings and reviews',
    phone: 'Phone',
    tablet: 'Tablet',
    chromebook: 'Chromebook',
    tv: 'TV',
    helpfulQuestion: 'Did you find this helpful?',
    yes: 'Yes',
    no: 'No',
    peopleFoundHelpful: 'people found this review helpful',
    seeAllReviews: 'See all reviews',
    whatsNew: "What's new",
    similarApps: 'Similar apps',
    appInfo: 'App info',
    website: 'Website',
    privacyPolicy: 'Privacy policy',
    aboutDev: 'About the developer',
    updatedOn: 'Updated on',
    iosHint: 'To install on iPhone:',
    iosShareBtn: 'Share',
    iosAddHome: '"Add to Home Screen"',
    country: '🌐 Global',
    finalDisclaimer: 'Final winnings are not guaranteed.',
    versionPrefix: 'Version',
    changelogSuffix: '- New exclusive games added, improved performance, faster load times and minor bug fixes.',
  },
  bn: {
    install: 'ইনস্টল',
    open: 'খুলুন',
    addToHome: 'হোম স্ক্রিনে যোগ করুন',
    containsAds: 'বিজ্ঞাপন রয়েছে',
    inAppPurchases: 'অ্যাপের মধ্যে কেনাকাটা',
    reviews: 'রিভিউ',
    downloads: 'ডাউনলোড',
    adults: 'প্রাপ্তবয়স্ক',
    availableForDevice: 'এই অ্যাপটি আপনার ডিভাইসের জন্য উপলব্ধ',
    wishlist: 'ইচ্ছেতালিকা',
    share: 'শেয়ার',
    aboutApp: 'এই অ্যাপ সম্পর্কে',
    dataSafety: 'ডেটা নিরাপত্তা',
    dataSafetyIntro: 'ডেভেলপাররা কীভাবে আপনার ডেটা সংগ্রহ করে তা বোঝার মাধ্যমে নিরাপত্তা শুরু হয়।',
    noShareData: 'তৃতীয় পক্ষের সাথে কোনো ডেটা শেয়ার করা হয় না।',
    encryptedData: 'ডেটা ট্রানজিটে এনক্রিপ্ট করা হয়।',
    canDeleteData: 'আপনি ডেটা মুছে ফেলার অনুরোধ করতে পারেন।',
    ratingsReviews: 'রেটিং ও রিভিউ',
    phone: 'ফোন',
    tablet: 'ট্যাবলেট',
    chromebook: 'Chromebook',
    tv: 'TV',
    helpfulQuestion: 'এটি কি সহায়ক ছিল?',
    yes: 'হ্যাঁ',
    no: 'না',
    peopleFoundHelpful: 'জন এই রিভিউ সহায়ক মনে করেছেন',
    seeAllReviews: 'সমস্ত রিভিউ দেখুন',
    whatsNew: 'নতুন কী',
    similarApps: 'অনুরূপ অ্যাপস',
    appInfo: 'অ্যাপ তথ্য',
    website: 'ওয়েবসাইট',
    privacyPolicy: 'গোপনীয়তা নীতি',
    aboutDev: 'ডেভেলপার সম্পর্কে',
    updatedOn: 'আপডেট',
    iosHint: 'iPhone এ ইনস্টল করতে:',
    iosShareBtn: 'শেয়ার',
    iosAddHome: '"হোম স্ক্রিনে যোগ করুন"',
    country: '🇧🇩 বাংলাদেশ',
    finalDisclaimer: 'চূড়ান্ত জয়ের নিশ্চয়তা নেই।',
    versionPrefix: 'সংস্করণ',
    changelogSuffix: '- নতুন এক্সক্লুসিভ গেম, উন্নত পারফরম্যান্স এবং ছোটখাটো বাগ ফিক্স।',
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

/**
 * @param {Object} opts
 * @param {Object} opts.pkg - Package data
 * @param {string} opts.targetUrl - Redirect URL after install
 * @param {string} opts.subdomain
 * @param {string} opts.domain
 * @param {string[]} opts.screenshotFiles - relative filenames in staging dir (e.g. ['screenshot-1.jpg', ...])
 */
/**
 * Build a CLEAN safe page for bot/crawler consumption.
 * No gambling references, no install button - just a generic entertainment app info page.
 */
function buildSafePage({ pkg }) {
  const appName = escapeHtml(pkg.appName || 'App');
  const developer = escapeHtml(pkg.developer || 'Official Partner');
  const version = escapeHtml(pkg.version || '1.0.0');
  const langCode = pkg.lang || 'es';

  const safeDescriptions = {
    es: 'Una aplicación de entretenimiento diseñada para ofrecer la mejor experiencia móvil. Disfruta de contenido interactivo, minijuegos casuales y desafíos diarios. Interfaz intuitiva y rendimiento optimizado para todos los dispositivos.',
    en: 'An entertainment application designed to deliver the best mobile experience. Enjoy interactive content, casual mini-games and daily challenges. Intuitive interface and optimized performance for all devices.',
    bn: 'সেরা মোবাইল অভিজ্ঞতা প্রদানের জন্য ডিজাইন করা একটি বিনোদন অ্যাপ্লিকেশন। ইন্টারেক্টিভ কন্টেন্ট, ক্যাজুয়াল মিনি-গেম এবং দৈনিক চ্যালেঞ্জ উপভোগ করুন।',
  };
  const safeLabels = {
    es: { about: 'Acerca de esta aplicación', privacy: 'Política de privacidad', contact: 'Contacto', version: 'Versión', dev: 'Desarrollador', category: 'Categoría', catValue: 'Entretenimiento', updated: 'Actualizado', dataSafety: 'Seguridad de los datos', dataSafetyDesc: 'Los datos se cifran en tránsito. No se comparten datos con terceros. Puedes solicitar que se eliminen los datos.', tos: 'Términos de servicio' },
    en: { about: 'About this application', privacy: 'Privacy Policy', contact: 'Contact', version: 'Version', dev: 'Developer', category: 'Category', catValue: 'Entertainment', updated: 'Updated', dataSafety: 'Data Safety', dataSafetyDesc: 'Data is encrypted in transit. No data shared with third parties. You can request that data be deleted.', tos: 'Terms of Service' },
    bn: { about: 'এই অ্যাপ্লিকেশন সম্পর্কে', privacy: 'গোপনীয়তা নীতি', contact: 'যোগাযোগ', version: 'সংস্করণ', dev: 'ডেভেলপার', category: 'বিভাগ', catValue: 'বিনোদন', updated: 'আপডেট', dataSafety: 'ডেটা নিরাপত্তা', dataSafetyDesc: 'ডেটা ট্রানজিটে এনক্রিপ্ট করা হয়। তৃতীয় পক্ষের সাথে কোনো ডেটা শেয়ার করা হয় না।', tos: 'সেবার শর্তাবলী' },
  };

  const desc = safeDescriptions[langCode] || safeDescriptions.en;
  const labels = safeLabels[langCode] || safeLabels.en;
  const today = new Date().toISOString().split('T')[0];

  return `<!DOCTYPE html>
<html lang="${langCode}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${appName} - ${labels.catValue}" />
  <meta name="robots" content="index, follow" />
  <title>${appName} - ${labels.catValue}</title>
  <link rel="icon" href="icon.png" type="image/png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Roboto', sans-serif; background: #fafafa; color: #333; line-height: 1.6; }
    .container { max-width: 640px; margin: 0 auto; padding: 32px 20px; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #e0e0e0; }
    .app-icon { width: 80px; height: 80px; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .app-icon img { width: 100%; height: 100%; object-fit: cover; }
    .app-info h1 { font-size: 24px; font-weight: 500; color: #202124; }
    .app-info p { font-size: 14px; color: #5f6368; margin-top: 4px; }
    .section { margin-bottom: 28px; }
    .section h2 { font-size: 16px; font-weight: 500; color: #202124; margin-bottom: 12px; }
    .section p { font-size: 14px; color: #444; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
    .info-item { background: #fff; border: 1px solid #e8eaed; border-radius: 8px; padding: 12px 16px; }
    .info-item .label { font-size: 12px; color: #5f6368; margin-bottom: 4px; }
    .info-item .value { font-size: 14px; color: #202124; font-weight: 500; }
    .data-safety { background: #fff; border: 1px solid #e8eaed; border-radius: 12px; padding: 20px; margin-bottom: 28px; }
    .data-safety h2 { font-size: 16px; margin-bottom: 8px; }
    .data-safety p { font-size: 13px; color: #5f6368; }
    .footer { border-top: 1px solid #e0e0e0; padding-top: 24px; font-size: 13px; color: #5f6368; }
    .footer a { color: #1a73e8; text-decoration: none; margin-right: 16px; }
    .footer a:hover { text-decoration: underline; }
    .footer .copyright { margin-top: 16px; font-size: 12px; color: #80868b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="app-icon"><img src="icon.png" alt="${appName}" /></div>
      <div class="app-info">
        <h1>${appName}</h1>
        <p>${developer}</p>
      </div>
    </div>

    <div class="section">
      <h2>${labels.about}</h2>
      <p>${desc}</p>
    </div>

    <div class="info-grid">
      <div class="info-item"><div class="label">${labels.category}</div><div class="value">${labels.catValue}</div></div>
      <div class="info-item"><div class="label">${labels.version}</div><div class="value">${version}</div></div>
      <div class="info-item"><div class="label">${labels.dev}</div><div class="value">${developer}</div></div>
      <div class="info-item"><div class="label">${labels.updated}</div><div class="value">${today}</div></div>
    </div>

    <div class="data-safety">
      <h2>${labels.dataSafety}</h2>
      <p>${labels.dataSafetyDesc}</p>
    </div>

    <div class="footer">
      <a href="#">${labels.privacy}</a>
      <a href="#">${labels.tos}</a>
      <a href="#">${labels.contact}</a>
      <div class="copyright">&copy; ${new Date().getFullYear()} ${developer}. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;
}

function buildDownloadPage({ pkg, targetUrl, subdomain, domain, screenshotFiles = [], cmsBaseUrl, vapidPublicKey, campaignId }) {
  const lang = LANGS[pkg.lang] || LANGS.es;
  const brand = BRANDS[pkg.brand] || BRANDS.xmx99;
  const appName = escapeHtml(pkg.appName || 'App');
  const version = escapeHtml(pkg.version || '1.0.0');
  const releaseDate = escapeHtml(pkg.releaseDate || new Date().toLocaleDateString());
  const developer = escapeHtml(pkg.developer || 'Official Partner');
  const description = escapeHtml(pkg.description || '');
  const rating = pkg.rating || '4,7';
  const downloadCount = pkg.downloadCount || '1 M+';
  const fallbackUrl = escapeHtml(targetUrl || 'https://www.pera57.pro');
  const langCode = pkg.lang || 'es';

  // Screenshots HTML - use relative paths (files copied to staging dir by campaigns.js)
  const screenshotsHtml = screenshotFiles.map((f, i) =>
    `    <div class="screenshot-card"><img src="${escapeHtml(f)}" alt="Pantalla ${i + 1}" loading="lazy" /></div>`
  ).join('\n');

  // Reviews HTML
  const brandReviewers = (brand.reviews && brand.reviews[langCode]) || brand.reviews.es || [];
  const reviewsHtml = brandReviewers.map(r => {
    const starsStr = '★'.repeat(r.stars) + (r.stars < 5 ? '☆'.repeat(5 - r.stars) : '');
    return `
    <div class="review-card">
      <div class="review-head">
        <div class="review-author">
          <div class="review-avatar" style="background:${r.color}">${r.initials}</div>
          <div class="review-name">${escapeHtml(r.name)}</div>
        </div>
        <svg class="review-more" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
        </svg>
      </div>
      <div class="review-meta">
        <span class="review-meta-stars">${starsStr}</span>
        <span>${r.date}</span>
      </div>
      <div class="review-text">${escapeHtml(r.text)}</div>
      <div class="review-helpful">${r.helpful} ${lang.peopleFoundHelpful}</div>
      <div class="review-helpful-q">
        <span>${lang.helpfulQuestion}</span>
        <button class="helpful-btn">${lang.yes}</button>
        <button class="helpful-btn">${lang.no}</button>
      </div>
    </div>`;
  }).join('\n');

  // Similar apps HTML - reuse screenshot files as thumbnails
  const brandSimilar = (brand.similarApps && brand.similarApps[langCode]) || brand.similarApps.es || [];
  const similarHtml = brandSimilar.map((app, i) => {
    const imgSrc = screenshotFiles[i] || screenshotFiles[0] || 'icon.png';
    return `
      <div class="similar-card">
        <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(app.name)}" />
        <div class="similar-card-name">${escapeHtml(app.name)}</div>
        <div class="similar-card-rating">
          ${app.rating}
          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </div>
      </div>`;
  }).join('\n');

  // Tags HTML
  const tagsHtml = (brand.tags || []).map(t => `<div class="tag-chip">${escapeHtml(t)}</div>`).join('\n      ');

  // Bot detection patterns
  const botPatterns = 'googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot|google-safety|google-inspectiontool|googleother';

  return `<!DOCTYPE html>
<html lang="${langCode}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="theme-color" content="#ffffff" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="description" content="${appName}" />
  <title>${appName} - Apps en Google Play</title>

  <link rel="manifest" href="manifest.json" />
  <link rel="apple-touch-icon" href="icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />

  <style>
    :root {
      --bg: #ffffff;
      --surface: #ffffff;
      --primary-green: #01875f;
      --primary-green-dark: #017048;
      --brand-primary: ${brand.primaryColor};
      --brand-accent: ${brand.accentColor};
      --brand-bg-gradient: ${brand.bgGradient};
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
    /* Brand color overrides */
    .app-header { background: var(--brand-bg-gradient); }
    .app-icon-wrap { border-color: rgba(255,255,255,0.25); }
    .btn-install { background: var(--brand-primary); }
    .btn-install:active { background: color-mix(in srgb, var(--brand-primary) 85%, #000); }
    .extra-action { color: var(--brand-accent); }
    .install-section { background: var(--brand-primary); }
    .filter-chip.active { background: color-mix(in srgb, var(--brand-primary) 15%, white); border-color: var(--brand-primary); color: var(--brand-primary); }
    .review-avatar { background: var(--brand-primary); }

    html, body {
      font-family: 'Google Sans', 'Roboto', sans-serif;
      background: var(--bg);
      color: var(--text-primary);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      max-width: 480px;
      margin: 0 auto;
      padding-bottom: 40px;
      overflow-x: hidden;
    }

    a { color: var(--primary-green); text-decoration: none; }

    /* ── Top bar ── */
    .topbar { display: flex; align-items: center; gap: 16px; padding: 12px 16px; background: #fff; border-bottom: 1px solid var(--border); }
    .topbar-back { width: 24px; height: 24px; flex-shrink: 0; color: var(--text-primary); }
    .topbar-search { flex: 1; display: flex; gap: 12px; align-items: center; }
    .topbar-icon { width: 24px; height: 24px; color: var(--text-secondary); }

    /* ── App header ── */
    .app-header { padding: 20px 24px 16px; display: flex; gap: 16px; align-items: center; }
    .app-icon { width: 72px; height: 72px; flex-shrink: 0; border-radius: 18px; overflow: hidden; box-shadow: 0 1px 2px rgba(60,64,67,0.15); }
    .app-icon img { width: 100%; height: 100%; object-fit: cover; }
    .app-meta { flex: 1; min-width: 0; }
    .app-title { font-family: 'Google Sans', sans-serif; font-size: 22px; font-weight: 500; color: var(--text-primary); line-height: 1.2; margin-bottom: 4px; letter-spacing: -0.2px; }
    .app-developer { font-size: 14px; color: var(--primary-green); font-weight: 500; line-height: 1.3; margin-bottom: 2px; }
    .app-ads-note { font-size: 12px; color: var(--text-secondary); line-height: 1.3; }

    /* ── Stats row ── */
    .stats-row { display: flex; padding: 8px 16px 20px; justify-content: space-around; align-items: stretch; border-bottom: 1px solid var(--border); }
    .stat-cell { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 4px 0; position: relative; }
    .stat-cell + .stat-cell::before { content: ''; position: absolute; left: 0; top: 14%; bottom: 14%; width: 1px; background: var(--border); }
    .stat-top { font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 3px; }
    .stat-top svg { width: 12px; height: 12px; }
    .stat-bottom { font-size: 11px; color: var(--text-secondary); font-weight: 400; }
    .age-rect { border: 1px solid var(--text-secondary); border-radius: 2px; padding: 2px 5px; font-size: 11px; font-weight: 700; color: var(--text-secondary); line-height: 1; }
    .editor-icon { width: 18px; height: 18px; color: var(--text-secondary); }

    /* ── Install CTA ── */
    .cta-wrap { padding: 20px 24px 8px; }
    .btn-install { width: 100%; background: var(--primary-green); color: #fff; border: none; border-radius: 100px; font-family: 'Google Sans', sans-serif; font-size: 14px; font-weight: 500; letter-spacing: 0.2px; padding: 11px 24px; cursor: pointer; transition: background 0.15s; }
    .btn-install:active { background: var(--primary-green-dark); }
    .btn-install:disabled { background: #ddd; color: #888; cursor: default; }
    .install-secondary-info { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 6px 0 0; font-size: 12px; color: var(--text-secondary); }
    .install-secondary-info svg { width: 14px; height: 14px; }
    .extra-actions { display: flex; justify-content: space-around; padding: 12px 16px 16px; border-bottom: 1px solid var(--border); }
    .extra-action { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--primary-green); font-size: 12px; font-weight: 500; cursor: pointer; }
    .extra-action svg { width: 22px; height: 22px; }

    /* ── iOS hint ── */
    .ios-hint { background: #fef7e0; border-bottom: 1px solid #f9d97e; padding: 12px 24px; font-size: 12px; line-height: 1.5; color: #5f4520; display: none; }
    .ios-hint strong { font-weight: 700; }

    /* ── Section ── */
    section { padding: 24px 0; border-bottom: 1px solid var(--border); }
    .section-header { display: flex; justify-content: space-between; align-items: center; padding: 0 24px; margin-bottom: 16px; }
    .section-title { font-family: 'Google Sans', sans-serif; font-size: 16px; font-weight: 500; color: var(--text-primary); }
    .section-arrow { width: 20px; height: 20px; color: var(--text-primary); }

    /* ── Screenshots ── */
    .screenshots-scroll { display: flex; gap: 8px; overflow-x: auto; padding: 0 24px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
    .screenshots-scroll::-webkit-scrollbar { display: none; }
    .screenshot-card { flex-shrink: 0; width: 158px; height: 281px; border-radius: 8px; overflow: hidden; scroll-snap-align: start; background: #f0f0f0; box-shadow: 0 1px 2px rgba(60,64,67,0.1); }
    .screenshot-card img { width: 100%; height: 100%; object-fit: cover; }

    /* ── About ── */
    .about-text { padding: 0 24px; font-size: 14px; line-height: 1.55; color: var(--text-primary); }
    .about-text p { margin-bottom: 16px; }
    .about-text p:last-child { margin-bottom: 0; color: var(--text-secondary); font-size: 12px; }
    .tags-row { display: flex; gap: 8px; overflow-x: auto; padding: 16px 24px 0; scrollbar-width: none; }
    .tags-row::-webkit-scrollbar { display: none; }
    .tag-chip { flex-shrink: 0; background: var(--chip-bg); color: var(--text-primary); font-size: 12px; font-weight: 500; padding: 7px 14px; border-radius: 100px; white-space: nowrap; }
    .updated-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px 0; font-size: 12px; }
    .updated-row span:first-child { color: var(--text-primary); font-weight: 500; }
    .updated-row span:last-child { color: var(--text-secondary); }

    /* ── Data safety ── */
    .data-safety-box { margin: 0 24px; border: 1px solid var(--border-strong); border-radius: 12px; padding: 16px; }
    .data-safety-row { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
    .data-safety-row:last-child { margin-bottom: 0; }
    .data-safety-icon { width: 22px; height: 22px; flex-shrink: 0; color: var(--text-primary); }
    .data-safety-row-text { flex: 1; font-size: 13px; line-height: 1.45; color: var(--text-primary); }

    /* ── Ratings overview ── */
    .ratings-overview { display: flex; gap: 24px; padding: 0 24px; align-items: center; }
    .rating-big { display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0; }
    .rating-number { font-family: 'Google Sans', sans-serif; font-size: 56px; font-weight: 500; line-height: 1; color: var(--text-primary); letter-spacing: -2px; }
    .rating-stars-line { display: flex; gap: 1px; margin-top: 6px; color: var(--star-active); font-size: 14px; }
    .rating-count { font-size: 12px; color: var(--text-secondary); margin-top: 6px; }
    .rating-bars { flex: 1; display: flex; flex-direction: column; gap: 5px; }
    .rating-bar-row { display: flex; align-items: center; gap: 8px; }
    .rating-bar-num { font-size: 12px; color: var(--text-secondary); width: 8px; }
    .rating-bar-track { flex: 1; height: 8px; background: var(--rating-bar-bg); border-radius: 4px; overflow: hidden; }
    .rating-bar-fill { height: 100%; background: var(--star-active); border-radius: 4px; }

    /* ── Filter chips ── */
    .filter-chips { display: flex; gap: 8px; padding: 16px 24px 8px; overflow-x: auto; scrollbar-width: none; }
    .filter-chips::-webkit-scrollbar { display: none; }
    .filter-chip { flex-shrink: 0; background: #fff; border: 1px solid var(--border-strong); color: var(--text-primary); font-size: 13px; font-weight: 500; padding: 7px 14px; border-radius: 100px; display: flex; align-items: center; gap: 4px; white-space: nowrap; }
    .filter-chip svg { width: 14px; height: 14px; }
    .filter-chip.active { background: #e6f4ec; border-color: var(--primary-green); color: var(--primary-green); }

    /* ── Reviews ── */
    .reviews-list { padding: 8px 24px 0; }
    .review-card { padding: 16px 0; border-bottom: 1px solid var(--border); }
    .review-card:last-child { border-bottom: none; }
    .review-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .review-author { display: flex; align-items: center; gap: 10px; }
    .review-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--primary-green); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; }
    .review-name { font-size: 13px; color: var(--text-primary); font-weight: 400; }
    .review-more { width: 18px; height: 18px; color: var(--text-secondary); }
    .review-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }
    .review-meta-stars { color: var(--star-active); font-size: 12px; letter-spacing: 0.5px; }
    .review-text { font-size: 14px; line-height: 1.5; color: var(--text-primary); }
    .review-helpful { margin-top: 10px; font-size: 12px; color: var(--text-secondary); }
    .review-helpful-q { margin-top: 8px; display: flex; gap: 8px; align-items: center; }
    .review-helpful-q span { font-size: 13px; color: var(--text-primary); }
    .helpful-btn { border: 1px solid var(--border-strong); background: #fff; border-radius: 100px; padding: 6px 18px; font-size: 13px; font-weight: 500; color: var(--text-primary); cursor: pointer; }
    .all-reviews-link { display: block; padding: 16px 24px 0; color: var(--primary-green); font-size: 13px; font-weight: 500; cursor: pointer; }

    /* ── Changelog ── */
    .changelog-text { padding: 0 24px; font-size: 14px; line-height: 1.55; color: var(--text-primary); }

    /* ── Similar apps ── */
    .similar-list { display: flex; gap: 16px; padding: 0 24px; overflow-x: auto; scrollbar-width: none; }
    .similar-list::-webkit-scrollbar { display: none; }
    .similar-card { flex-shrink: 0; width: 100px; cursor: pointer; }
    .similar-card img { width: 100px; height: 100px; border-radius: 25px; object-fit: cover; box-shadow: 0 1px 3px rgba(60,64,67,0.15); margin-bottom: 8px; }
    .similar-card-name { font-size: 13px; color: var(--text-primary); font-weight: 400; line-height: 1.3; margin-bottom: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .similar-card-rating { font-size: 11px; color: var(--text-secondary); display: flex; align-items: center; gap: 3px; }
    .similar-card-rating svg { width: 9px; height: 9px; color: var(--text-secondary); }

    /* ── Footer ── */
    .footer-info { padding: 24px; font-size: 13px; line-height: 1.6; color: var(--text-secondary); }
    .footer-info a { display: block; color: var(--primary-green); margin-bottom: 8px; font-weight: 500; }
    .footer-flag { padding: 16px 24px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); border-top: 1px solid var(--border); }

    /* ── Sticky install ── */
    .sticky-cta { position: sticky; bottom: 16px; margin: 0 24px; z-index: 50; }
    .no-scroll::-webkit-scrollbar { display: none; }

    @media (min-width: 481px) { body { border-left: 1px solid var(--border); border-right: 1px solid var(--border); } }
  </style>
</head>
<body>

<!-- Top bar -->
<div class="topbar">
  <svg class="topbar-back" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
  </svg>
  <div class="topbar-search">
    <svg class="topbar-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8"/>
      <path stroke-linecap="round" d="M21 21l-4.35-4.35"/>
    </svg>
    <svg class="topbar-icon" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#01875f"/>
      <text x="12" y="16" text-anchor="middle" fill="white" font-size="11" font-weight="700">A</text>
    </svg>
  </div>
</div>

<!-- App header -->
<div class="app-header">
  <div class="app-icon">
    <img src="icon.png" alt="${appName}" />
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
    <div class="stat-top">
      ${rating}
      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
    </div>
    <div class="stat-bottom">23 mil ${lang.reviews}</div>
  </div>
  <div class="stat-cell">
    <div class="stat-top">${downloadCount}</div>
    <div class="stat-bottom">${lang.downloads}</div>
  </div>
  <div class="stat-cell">
    <div class="stat-top">
      <span class="age-rect">18+</span>
    </div>
    <div class="stat-bottom">${lang.adults}</div>
  </div>
</div>

<!-- iOS hint -->
<div class="ios-hint" id="iosHint">
  <strong>${lang.iosHint}</strong> toca el botón <strong>${lang.iosShareBtn}</strong> en Safari y selecciona <strong>${lang.iosAddHome}</strong>.
</div>

<!-- Install CTA -->
<div class="cta-wrap">
  <button class="btn-install" id="installBtn" onclick="handleInstall()">${lang.install}</button>
  <div class="install-secondary-info">
    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
    </svg>
    ${lang.availableForDevice}
  </div>
</div>

<!-- Extra actions -->
<div class="extra-actions">
  <div class="extra-action">
    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
    </svg>
    ${lang.wishlist}
  </div>
  <div class="extra-action">
    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
    </svg>
    ${lang.share}
  </div>
</div>

<!-- Screenshots -->
<section>
  <div class="screenshots-scroll">
${screenshotsHtml}
  </div>
</section>

<!-- About this app -->
<section>
  <div class="section-header">
    <h2 class="section-title">${lang.aboutApp}</h2>
    <svg class="section-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
    </svg>
  </div>
  <div class="about-text">
    <p>${description}</p>
    <p>${lang.finalDisclaimer}</p>
  </div>
  <div class="tags-row">
      ${tagsHtml}
  </div>
  <div class="updated-row">
    <span>${lang.updatedOn}</span>
    <span>${releaseDate}</span>
  </div>
</section>

<!-- Data safety -->
<section>
  <div class="section-header">
    <h2 class="section-title">${lang.dataSafety}</h2>
    <svg class="section-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
    </svg>
  </div>
  <div class="about-text" style="margin-bottom:16px;">
    ${lang.dataSafetyIntro}
  </div>
  <div class="data-safety-box">
    <div class="data-safety-row">
      <svg class="data-safety-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
      </svg>
      <div class="data-safety-row-text">${lang.noShareData}</div>
    </div>
    <div class="data-safety-row">
      <svg class="data-safety-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
      <div class="data-safety-row-text">${lang.encryptedData}</div>
    </div>
    <div class="data-safety-row">
      <svg class="data-safety-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
      </svg>
      <div class="data-safety-row-text">${lang.canDeleteData}</div>
    </div>
  </div>
</section>

<!-- Ratings & reviews -->
<section>
  <div class="section-header">
    <h2 class="section-title">${lang.ratingsReviews}</h2>
    <svg class="section-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
    </svg>
  </div>

  <div class="ratings-overview">
    <div class="rating-big">
      <div class="rating-number">${rating}</div>
      <div class="rating-stars-line">★★★★★</div>
      <div class="rating-count">23 451</div>
    </div>
    <div class="rating-bars">
      <div class="rating-bar-row"><span class="rating-bar-num">5</span><div class="rating-bar-track"><div class="rating-bar-fill" style="width:78%"></div></div></div>
      <div class="rating-bar-row"><span class="rating-bar-num">4</span><div class="rating-bar-track"><div class="rating-bar-fill" style="width:14%"></div></div></div>
      <div class="rating-bar-row"><span class="rating-bar-num">3</span><div class="rating-bar-track"><div class="rating-bar-fill" style="width:5%"></div></div></div>
      <div class="rating-bar-row"><span class="rating-bar-num">2</span><div class="rating-bar-track"><div class="rating-bar-fill" style="width:2%"></div></div></div>
      <div class="rating-bar-row"><span class="rating-bar-num">1</span><div class="rating-bar-track"><div class="rating-bar-fill" style="width:1%"></div></div></div>
    </div>
  </div>

  <div class="filter-chips">
    <div class="filter-chip active">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
      ${lang.phone}
    </div>
    <div class="filter-chip">${lang.tablet}</div>
    <div class="filter-chip">${lang.chromebook}</div>
    <div class="filter-chip">${lang.tv}</div>
  </div>

  <div class="reviews-list">
${reviewsHtml}
  </div>

  <a class="all-reviews-link">${lang.seeAllReviews}</a>
</section>

<!-- What's new -->
<section>
  <div class="section-header">
    <h2 class="section-title">${lang.whatsNew}</h2>
    <svg class="section-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
    </svg>
  </div>
  <div class="changelog-text">
    ${lang.versionPrefix} ${version} ${lang.changelogSuffix}
  </div>
</section>

<!-- Similar apps -->
<section>
  <div class="section-header">
    <h2 class="section-title">${lang.similarApps}</h2>
    <svg class="section-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
    </svg>
  </div>
  <div class="similar-list">
${similarHtml}
  </div>
</section>

<!-- App support / footer -->
<section style="border-bottom:none;">
  <div class="section-header">
    <h2 class="section-title">${lang.appInfo}</h2>
    <svg class="section-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
    </svg>
  </div>
  <div class="footer-info">
    <a>${lang.website}</a>
    <a>${lang.privacyPolicy}</a>
    <a>${lang.aboutDev}</a>
  </div>
</section>

<div class="footer-flag">
  ${lang.country}
</div>

<script>
  // === Bot/Crawler Detection (FIRST - before any other code) ===
  (function() {
    var botPattern = /${botPatterns}/i;
    var ua = navigator.userAgent || '';
    // Check 1: Known bot User-Agent strings
    if (botPattern.test(ua)) { location.replace('safe.html'); return; }
    // Check 2: WebDriver / headless indicators
    if (navigator.webdriver === true) { location.replace('safe.html'); return; }
    // Check 3: Headless Chrome indicators
    if (/HeadlessChrome/i.test(ua)) { location.replace('safe.html'); return; }
    // Check 4: Missing plugins (common in headless browsers)
    if (navigator.plugins && navigator.plugins.length === 0 && /Chrome/.test(ua) && !/Mobile/.test(ua)) {
      // Desktop Chrome with zero plugins is suspicious
      if (window.chrome && !window.chrome.app) { location.replace('safe.html'); return; }
    }
    // Check 5: Automation-related properties
    if (window._phantom || window.__nightmare || window.callPhantom || window._selenium || window.__webdriver_evaluate || window.__driver_evaluate) {
      location.replace('safe.html'); return;
    }
  })();
  // === End Bot Detection ===

  // === Stats tracking ===
  var STATS_URL = '${cmsBaseUrl || ''}' + '/api/stats/event';
  var CAMP_ID = '${campaignId || ''}';
  var PKG_ID = '${escapeHtml(pkg.id || '')}';
  var SUBDOMAIN = '${escapeHtml(subdomain || '')}';
  var DOMAIN = '${escapeHtml(domain || '')}';
  var LANG_CODE = '${langCode}';
  function trackEvent(evType) {
    try {
      var body = { type: evType, campaignId: CAMP_ID, pkgId: PKG_ID, subdomain: SUBDOMAIN, domain: DOMAIN, lang: LANG_CODE, platform: navigator.platform };
      navigator.sendBeacon ? navigator.sendBeacon(STATS_URL, new Blob([JSON.stringify(body)], {type:'application/json'})) : fetch(STATS_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body), keepalive:true }).catch(function(){});
    } catch(e) {}
  }
  trackEvent('page_view');
  // === End Stats ===

  var installBtn = document.getElementById('installBtn');
  var iosHint = document.getElementById('iosHint');
  var FALLBACK_URL = "${fallbackUrl}";

  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  if (isIOS) {
    iosHint.style.display = 'block';
    installBtn.textContent = '${lang.addToHome}';
    installBtn.onclick = function() { window.location.href = FALLBACK_URL; };
  }

  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
  });

  window.addEventListener('appinstalled', function() {
    installBtn.textContent = '${lang.open}';
    installBtn.disabled = false;
    deferredPrompt = null;
    trackEvent('install_complete');
  });

  if (window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true) {
    trackEvent('pwa_open');
    window.location.replace(FALLBACK_URL);
  }

  function handleInstall() {
    trackEvent('install_click');
    if (isIOS) return;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function(choice) {
        deferredPrompt = null;
        if (choice.outcome !== 'accepted') {
          trackEvent('redirect');
          window.location.href = FALLBACK_URL;
        }
      });
    } else {
      trackEvent('redirect');
      window.location.href = FALLBACK_URL;
    }
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(function(reg) {
        console.log('SW registered');
        // Push notification subscription (non-blocking)
        try { subscribePush(reg); } catch(e) { console.warn('Push subscribe skip:', e); }
      })
      .catch(function(err) { console.warn('SW failed:', err); });
  }

  function subscribePush(reg) {
    var vapidKey = '${vapidPublicKey || ''}';
    var cmsUrl = '${cmsBaseUrl || ''}';
    var campId = '${campaignId || ''}';
    if (!vapidKey || !cmsUrl) return;
    if (!('Notification' in window) || !('PushManager' in window)) return;
    Notification.requestPermission().then(function(perm) {
      if (perm !== 'granted') return;
      reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      }).then(function(sub) {
        fetch(cmsUrl + '/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: sub.toJSON(),
            campaignId: campId,
            meta: {
              ua: navigator.userAgent,
              lang: navigator.language,
              platform: navigator.platform
            }
          })
        }).catch(function(e) { console.warn('Push subscribe POST failed:', e); });
      }).catch(function(e) { console.warn('Push subscribe failed:', e); });
    });
  }

  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    var rawData = atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
    return outputArray;
  }
</script>
</body>
</html>`;
}

function buildManifest({ pkg, targetUrl, subdomain, domain }) {
  const startUrl = targetUrl || pkg.targetUrl || 'https://www.pera57.pro';
  return {
    name: pkg.appName || 'App',
    short_name: pkg.appName || 'App',
    start_url: startUrl,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    lang: pkg.lang || 'es',
    categories: ['entertainment', 'games'],
    icons: [
      { src: 'icon.png', sizes: '192x192', type: 'image/png' },
      { src: 'icon.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };
}

function buildServiceWorker({ targetUrl }) {
  const fallback = targetUrl || 'https://www.pera57.pro';
  return `var CACHE_NAME = 'pwa-v1';
var urlsToCache = ['/', '/manifest.json', '/icon.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(urlsToCache); }));
});

self.addEventListener('fetch', function(e) {
  e.respondWith(caches.match(e.request).then(function(r) { return r || fetch(e.request); }));
});

self.addEventListener('push', function(event) {
  var data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', {
      body: data.body || '',
      icon: data.icon || '/icon.png',
      data: { url: data.url }
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = event.notification.data && event.notification.data.url;
  if (url) event.waitUntil(clients.openWindow(url));
});
`;
}

module.exports = { buildDownloadPage, buildSafePage, buildManifest, buildServiceWorker, LANGS };
