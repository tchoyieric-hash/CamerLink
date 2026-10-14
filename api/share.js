// Fonction Vercel : pages partageables (aperçu WhatsApp / Facebook / Google) + plan du site.
//   /annonce/<id>   -> index.html avec les balises de l'annonce
//   /artisan/<uuid> -> index.html avec les balises de l'artisan
//   /sitemap.xml    -> plan du site généré depuis Supabase
// Les routes sont déclarées dans vercel.json.

const fs = require('fs');
const path = require('path');

const SITE_URL = (process.env.SITE_URL || 'https://camerlink.vercel.app').replace(/\/+$/, '');
const SB_URL = process.env.SUPABASE_URL || 'https://lviddipduhaelxcvyykc.supabase.co';
// Clé publique (anon) : la même que dans script.js, protégée par les règles RLS.
const SB_KEY = process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aWRkaXBkdWhhZWx4Y3Z5eWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1ODExMzcsImV4cCI6MjEwNjE1NzEzN30.L5iaUIW0IQ0hX5uOiOuK-lo_zkf926Xs6CDjCjrpffk';

const DEFAULT_IMAGE = SITE_URL + '/og-default.png';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ID_RE = /^\d{1,12}$/;

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]
));
const trunc = (s, n) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t;
};
const jsonLd = (obj) => '<script type="application/ld+json">' +
  JSON.stringify(obj).replace(/</g, '\\u003c') + '</script>';
const httpsOnly = (u) => (typeof u === 'string' && /^https:\/\//i.test(u)) ? u : null;
const fcfa = (n) => Number(n || 0).toLocaleString('fr-FR').replace(/[  ]/g, ' ');

async function sbGet(query) {
  const r = await fetch(SB_URL + '/rest/v1/' + query, {
    headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY },
    signal: AbortSignal.timeout(6000)
  });
  if (!r.ok) throw new Error('Supabase ' + r.status);
  return r.json();
}

async function loadIndexHtml() {
  const candidates = [
    path.join(process.cwd(), 'index.html'),
    path.join(__dirname, '..', 'index.html')
  ];
  for (const p of candidates) {
    try { return fs.readFileSync(p, 'utf8'); } catch (e) { /* suivant */ }
  }
  const r = await fetch(SITE_URL + '/index.html', { signal: AbortSignal.timeout(6000) });
  if (!r.ok) throw new Error('index.html introuvable');
  return r.text();
}

function injectSeo(html, headBlock, bodyBlock) {
  return html
    .replace(/<!--SEO-->[\s\S]*?<!--\/SEO-->/, '<!--SEO-->\n' + headBlock + '\n<!--/SEO-->')
    .replace('<!--SEO_BODY-->', bodyBlock || '');
}

function metaBlock({ title, description, url, image, imageAlt, type, extra = '', ld = '' }) {
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:site_name" content="CamerLink">`,
    `<meta property="og:locale" content="fr_CM">`,
    `<meta property="og:type" content="${esc(type)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta property="og:image:alt" content="${esc(imageAlt || title)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${esc(image)}">`,
    extra,
    ld
  ].filter(Boolean).join('\n');
}

function send(res, status, body, cache) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  res.end(body);
}

async function notFound(res, what) {
  const html = await loadIndexHtml();
  const head = metaBlock({
    title: what + ' introuvable · CamerLink',
    description: 'Cette page n’existe plus. Découvrez les annonces et commerces locaux sur CamerLink.',
    url: SITE_URL + '/', image: DEFAULT_IMAGE, type: 'website',
    extra: '<meta name="robots" content="noindex">'
  });
  send(res, 404, injectSeo(html, head, ''), 'public, s-maxage=60');
}

async function annoncePage(res, id) {
  const rows = await sbGet(
    'annonces?id=eq.' + id +
    '&select=id,title,description,price,city,quartier,category,image_url,created_at,note_moyenne,nb_avis,vendu&limit=1'
  );
  const ad = rows && rows[0];
  if (!ad) return notFound(res, 'Annonce');

  const url = SITE_URL + '/annonce/' + ad.id;
  const place = [ad.quartier, ad.city].filter(Boolean).join(', ');
  const priceTxt = fcfa(ad.price) + ' FCFA';
  const title = trunc(`${ad.title} · ${priceTxt}${ad.city ? ' · ' + ad.city : ''}`, 62) + ' | CamerLink';
  const description = trunc(
    (ad.description ? ad.description + ' — ' : '') + (place ? place + '. ' : '') + 'Contactez l’annonceur sur CamerLink.',
    158
  );
  const image = httpsOnly(ad.image_url) || DEFAULT_IMAGE;

  const offer = {
    '@type': 'Offer', url, price: Number(ad.price || 0), priceCurrency: 'XAF',
    availability: ad.vendu ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock'
  };
  if (ad.city) {
    offer.availableAtOrFrom = {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: ad.city, addressCountry: 'CM' }
    };
  }
  const product = {
    '@context': 'https://schema.org', '@type': 'Product', name: ad.title,
    description: trunc(ad.description || ad.title, 500), image: [image], category: ad.category || undefined, offers: offer
  };
  if (ad.nb_avis > 0 && ad.note_moyenne) {
    product.aggregateRating = { '@type': 'AggregateRating', ratingValue: Number(ad.note_moyenne), reviewCount: Number(ad.nb_avis) };
  }

  const head = metaBlock({
    title, description, url, image, imageAlt: ad.title, type: 'product',
    extra: `<meta property="product:price:amount" content="${esc(Number(ad.price || 0))}">\n<meta property="product:price:currency" content="XAF">`,
    ld: jsonLd(product)
  });
  const body = `<noscript><h1>${esc(ad.title)}</h1><p>${esc(priceTxt)} — ${esc(place)}</p><p>${esc(ad.description || '')}</p></noscript>`;

  const html = await loadIndexHtml();
  send(res, 200, injectSeo(html, head, body), 'public, s-maxage=300, stale-while-revalidate=86400');
}

const BUSINESS_TYPES = {
  'Restaurant': 'Restaurant', 'Boutique': 'Store', 'Supermarché': 'GroceryStore',
  'Hôtel': 'Hotel', 'Services': 'ProfessionalService', 'Autre': 'LocalBusiness'
};

async function artisanPage(res, id) {
  const rows = await sbGet(
    'etablissements?user_id=eq.' + id +
    '&select=user_id,name,type,city,address,description,logo_url,hours&limit=1'
  );
  const shop = rows && rows[0];
  if (!shop) return notFound(res, 'Artisan');

  const url = SITE_URL + '/artisan/' + shop.user_id;
  const kind = [shop.type, shop.city].filter(Boolean).join(' à ');
  const title = trunc(`${shop.name}${kind ? ' · ' + kind : ''}`, 62) + ' | CamerLink';
  const description = trunc(
    (shop.description ? shop.description + ' — ' : '') + (shop.address ? shop.address + '. ' : '') + 'Contact et annonces sur CamerLink.',
    158
  );
  const image = httpsOnly(shop.logo_url) || DEFAULT_IMAGE;

  const business = {
    '@context': 'https://schema.org', '@type': BUSINESS_TYPES[shop.type] || 'LocalBusiness',
    name: shop.name, url, image,
    description: trunc(shop.description || shop.name, 500),
    address: { '@type': 'PostalAddress', streetAddress: shop.address || undefined, addressLocality: shop.city || undefined, addressCountry: 'CM' }
  };

  const head = metaBlock({ title, description, url, image, imageAlt: shop.name, type: 'profile', ld: jsonLd(business) });
  const body = `<noscript><h1>${esc(shop.name)}</h1><p>${esc(kind)}</p><p>${esc(shop.description || '')}</p></noscript>`;

  const html = await loadIndexHtml();
  send(res, 200, injectSeo(html, head, body), 'public, s-maxage=300, stale-while-revalidate=86400');
}

async function sitemap(res) {
  const [ads, shops] = await Promise.all([
    sbGet('annonces?select=id,created_at&vendu=eq.false&order=created_at.desc&limit=2000'),
    sbGet('etablissements?select=user_id,created_at&limit=2000')
  ]);
  const day = (d) => (d ? String(d).slice(0, 10) : null);
  const entry = (loc, lastmod, freq, prio) =>
    `  <url><loc>${esc(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>${freq}</changefreq><priority>${prio}</priority></url>`;

  const urls = [entry(SITE_URL + '/', new Date().toISOString().slice(0, 10), 'daily', '1.0')]
    .concat(ads.map(a => entry(`${SITE_URL}/annonce/${a.id}`, day(a.created_at), 'weekly', '0.7')))
    .concat(shops.map(s => entry(`${SITE_URL}/artisan/${s.user_id}`, day(s.created_at), 'weekly', '0.6')));

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.end('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join('\n') + '\n</urlset>\n');
}

module.exports = async (req, res) => {
  try {
    const q = req.query || {};
    const type = String(q.type || '');
    const id = String(q.id || '');

    if (type === 'sitemap') return await sitemap(res);
    if (type === 'annonce') return ID_RE.test(id) ? await annoncePage(res, id) : await notFound(res, 'Annonce');
    if (type === 'artisan') return UUID_RE.test(id) ? await artisanPage(res, id) : await notFound(res, 'Artisan');
    return await notFound(res, 'Page');
  } catch (err) {
    // En cas d'erreur (base indisponible…) on sert quand même le site, sans balises spécifiques.
    try {
      const html = await loadIndexHtml();
      send(res, 200, injectSeo(html, '<title>CamerLink · Annonces et commerces locaux au Cameroun</title>', ''), 'no-store');
    } catch (e) {
      res.statusCode = 500;
      res.end('Erreur temporaire');
    }
  }
};
