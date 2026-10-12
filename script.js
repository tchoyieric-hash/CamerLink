(() => {
  'use strict';
  const SB_URL = 'https://lviddipduhaelxcvyykc.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aWRkaXBkdWhhZWx4Y3Z5eWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1ODExMzcsImV4cCI6MjEwNjE1NzEzN30.L5iaUIW0IQ0hX5uOiOuK-lo_zkf926Xs6CDjCjrpffk';
  const STORY_BUCKET = 'artisan-stories';
  const AD_BUCKET = 'annonces-images';
  const VIDEO_BUCKET = 'annonces-videos';
  const MAX_STORY_MB = 50;
  const MAX_AD_IMG_MB = 2;
  const MAX_AD_VIDEO_MB = 50;
  const REELS_MAX = 12;
  const FETCH_TIMEOUT = 8000;
  const STORY_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
  const AD_IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const AD_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
  const VIDEO_EXT_TYPE = { mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' };
  const VIDEO_TYPE_EXT = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };

  const CATEGORIES = [
    { value: 'Services', chip: '🛠 Services' },
    { value: 'Restaurants', chip: '🍽 Gastronomie' },
    { value: 'Boutiques', chip: '🛍 Boutiques' },
    { value: 'Immobilier', chip: '🏠 Immobilier' }
  ];

  // Valeurs strictement autorisées par public.etablissements_type_check dans Supabase.
  // Le champ métier libre est normalisé vers l'une de ces valeurs avant l'enregistrement.
  const ESTABLISHMENT_TYPES = [
    'Restaurant', 'Boutique', 'Supermarché', 'Hôtel', 'Services', 'Autre',
    'Pharmacie', 'Salon de coiffure', 'Institut de beauté',
    'Boulangerie / Pâtisserie', 'Bar / Snack', 'Hôtellerie',
    'Hôtellerie-Restauration', 'Électricité / Plomberie', 'Menuiserie',
    'Couture / Mode', 'Informatique / Téléphonie', 'Transport / Livraison',
    'Immobilier', 'Garage / Mécanique', 'Agriculture / Élevage',
    'Banque / Microfinance', 'Éducation / Formation', 'Santé / Clinique',
    'Quincaillerie / Matériaux', 'Pressing / Blanchisserie',
    'Photographie / Événementiel', 'Supermarché / Alimentation',
    'Autre service professionnel'
  ];
  const normalizeEstablishmentType = value => {
    const raw = String(value || '').trim();
    const fold = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const key = fold(raw);
    const aliases = [
      [/\b(electricien|electricite|plombier|plomberie)\b/, 'Électricité / Plomberie'],
      [/\b(couturier|couturiere|couture|styliste)\b/, 'Couture / Mode'],
      [/\b(coiffeur|coiffeuse|salon de coiffure|barbier)\b/, 'Salon de coiffure'],
      [/\b(pharmacien|pharmacie)\b/, 'Pharmacie'],
      [/\b(hotel|hotellerie)\b/, 'Hôtellerie'],
      [/\b(restaurant|restauration|cuisinier)\b/, 'Restaurant'],
      [/\b(boutique|vendeur|vente)\b/, 'Boutique'],
      [/\b(informaticien|informatique|telephone|telephonie|reparateur de telephone)\b/, 'Informatique / Téléphonie'],
      [/\b(mecanicien|mecanique|garage)\b/, 'Garage / Mécanique'],
      [/\b(chauffeur|transport|livraison|moto taxi)\b/, 'Transport / Livraison'],
      [/\b(infirmier|medecin|clinique|sante)\b/, 'Santé / Clinique'],
      [/\b(banque|microfinance)\b/, 'Banque / Microfinance'],
      [/\b(agriculteur|agriculture|eleveur|elevage)\b/, 'Agriculture / Élevage'],
      [/\b(menuisier|menuiserie)\b/, 'Menuiserie'],
      [/\b(boulanger|boulangere|patisserie|patisserie)\b/, 'Boulangerie / Pâtisserie'],
      [/\b(pressing|blanchisserie)\b/, 'Pressing / Blanchisserie'],
      [/\b(photographe|photographie|evenementiel)\b/, 'Photographie / Événementiel'],
      [/\b(immobilier|agent immobilier)\b/, 'Immobilier'],
      [/\b(enseignant|ecole|education|formation|formateur)\b/, 'Éducation / Formation'],
      [/\b(beauty|beaute|estheticien|estheticienne|institut)\b/, 'Institut de beauté'],
      [/\b(supermarche|alimentation|epicerie)\b/, 'Supermarché / Alimentation'],
      [/\b(quincaillerie|materiaux)\b/, 'Quincaillerie / Matériaux'],
      [/\b(bar|snack|debit de boisson)\b/, 'Bar / Snack']
    ];
    for (const [pattern, category] of aliases) if (pattern.test(key)) return category;
    const exact = ESTABLISHMENT_TYPES.find(type => fold(type) === key);
    if (exact) return exact;
    if (/\b(service|services|artisan|artisanal|prestataire)\b/.test(key)) return 'Services';
    return raw ? 'Autre service professionnel' : 'Autre';
  };
  // Villes principales : les 10 chefs-lieux de région du Cameroun, plus Kribi.
  // "value" est enregistré dans l'annonce ; "label" indique la région dans les listes.
  const CITIES = [
    { value: 'Yaoundé', label: 'Yaoundé (Centre)' },
    { value: 'Douala', label: 'Douala (Littoral)' },
    { value: 'Bafoussam', label: 'Bafoussam (Ouest)' },
    { value: 'Bamenda', label: 'Bamenda (Nord-Ouest)' },
    { value: 'Buea', label: 'Buea (Sud-Ouest)' },
    { value: 'Garoua', label: 'Garoua (Nord)' },
    { value: 'Maroua', label: 'Maroua (Extrême-Nord)' },
    { value: 'Ngaoundéré', label: 'Ngaoundéré (Adamaoua)' },
    { value: 'Bertoua', label: 'Bertoua (Est)' },
    { value: 'Ebolowa', label: 'Ebolowa (Sud)' },
    { value: 'Kribi', label: 'Kribi (Sud)' }
  ];

  // Suggestions de quartiers (le vendeur peut aussi écrire librement un autre quartier)
  const QUARTIERS = {
    'Yaoundé': ['Bastos', 'Biyem-Assi', 'Briqueterie', 'Efoulan', 'Ekounou', 'Elig-Essono', 'Emana', 'Essos', 'Etoudi', 'Melen', 'Mendong', 'Messa', 'Mfandena', 'Mimboman', 'Mokolo', 'Mvan', 'Mvog-Ada', 'Mvog-Mbi', 'Ngousso', 'Nkolbisson', 'Nlongkak', 'Nsimeyong', 'Obili', 'Odza', 'Omnisports', 'Simbock', 'Tsinga'],
    'Douala': ['Akwa', 'Bali', 'Bassa', 'Bepanda', 'Bonabéri', 'Bonamoussadi', 'Bonanjo', 'Bonapriso', 'Cité des Palmiers', 'Deido', 'Japoma', 'Kotto', 'Logbessou', 'Logpom', 'Makepe', 'Ndokoti', 'New Bell', 'Nyalla', 'PK8', 'PK14', 'Yassa'],
    'Bafoussam': ['Banengo', 'Djeleng', 'Famla', 'Kamkop', 'Tamdja'],
    'Bamenda': ['Commercial Avenue', 'Mankon', 'Nkwen', 'Ntarikon', 'Up Station'],
    'Buea': ['Bonduma', 'Great Soppo', 'Molyko', 'Muea']
  };
  const MAX_QUARTIER = 80;
  // clé de comparaison : sans accents, sans majuscules (Bonabéri = bonaberi)
  const qKey = (v) => String(v || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normQuartier = (v) => String(v || '').trim().replace(/\s+/g, ' ')
    .replace(/(^|[\s'’-])([a-zà-ÿ])/g, (m, p, c) => p + c.toUpperCase());

  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]
  ));
  const withTimeout = (p, ms = FETCH_TIMEOUT) => Promise.race([
    p, new Promise((_, rej) => setTimeout(() => rej(new Error('Délai dépassé, vérifiez votre connexion.')), ms))
  ]);
  const isVideo = (url) => /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(String(url || '').trim());
  const fmtDate = (d) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  const sb = window.supabase.createClient(SB_URL, SB_KEY);
  // Expose le client unique aux modules complémentaires chargés après script.js.
  window.camerlinkSupabase = sb;

  let allListings = [], videos = {}, currentUser = null, currentCategory = '', favOnly = false;
  let storyGroups = [];
  let likeCounts = {};
  let reelObserver = null;
  const viewedNow = new Set();
  const likeBusy = new Set();
  const shopCache = {};
  const detail = { id: null, shop: null };

  const waNumber = (raw) => {
    const d = String(raw || '').replace(/\D/g, '');
    if (!d) return '';
    return d.startsWith('237') ? d : '237' + d;
  };
  const viewer = { g: 0, i: 0 };

  function toast(msg) {
    const t = $('toast');
    if (!t) { alert(msg); return; }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 3500);
  }

  const openModal = (id) => $(id).classList.add('active');
  const closeModal = (id) => {
    $(id).classList.remove('active');
    if (id === 'adDetailModal' || id === 'artisanModal') resetUrl();
  };

  /* ===== LIENS PARTAGEABLES : /annonce/<id> et /artisan/<id> ===== */
  const BASE_TITLE = 'CamerLink · Annonces et commerces locaux au Cameroun';
  function setUrl(p, title) {
    try { if (location.pathname !== p) history.replaceState(null, '', p); } catch (e) { /* ignoré */ }
    document.title = title || BASE_TITLE;
  }
  function resetUrl() {
    if (/^\/(annonce|artisan)\//.test(location.pathname)) setUrl('/');
    else document.title = BASE_TITLE;
  }

  async function copyLink(p) {
    const url = location.origin + p;
    try {
      await navigator.clipboard.writeText(url);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e2) { /* ignoré */ }
      ta.remove();
    }
    toast('Lien copié !');
  }

  async function shareLink(title, text, p) {
    const url = location.origin + p;
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text + '\n' + url), '_blank', 'noopener');
  }

  /* ===== THÈME ===== */
  $('themeBtn').addEventListener('click', () => {
    const html = document.documentElement;
    html.setAttribute('data-theme', html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ===== FILTRES ===== */
  $('cityFilter').innerHTML = '<option value="">Toutes les villes</option>' + CITIES.map(c => `<option value="${esc(c.value)}">${esc(c.label)}</option>`).join('');
  $('adCity').innerHTML = CITIES.map(c => `<option value="${esc(c.value)}">${esc(c.label)}</option>`).join('');
  $('adCategory').innerHTML = CATEGORIES.map(c => `<option value="${c.value}">${c.value}</option>`).join('');

  /* ===== QUARTIER : filtre et champ de publication (ajoutés ici, sans modifier le HTML) ===== */
  let currentQuartier = '';

  function quartierSuggestions(city) {
    const m = new Map();
    [...(QUARTIERS[city] || []), ...allListings.filter(a => a.city === city && a.quartier).map(a => a.quartier)]
      .forEach(q => { const k = qKey(q); if (k && !m.has(k)) m.set(k, q); });
    return m;
  }

  function fillQuartierSuggestions() {
    const dl = $('quartiersList');
    if (!dl) return;
    const list = [...quartierSuggestions($('adCity') ? $('adCity').value : '').values()]
      .sort((a, b) => a.localeCompare(b, 'fr'));
    dl.innerHTML = list.map(q => `<option value="${esc(q)}"></option>`).join('');
  }

  // si le quartier existe déjà (même sans accents/majuscules), on garde son orthographe
  function canonicalQuartier(city, input) {
    const k = qKey(input);
    if (!k) return '';
    const known = quartierSuggestions(city).get(k);
    return (known || normQuartier(input)).slice(0, MAX_QUARTIER);
  }

  function refreshQuartierFilter() {
    const sel = $('quartierFilter');
    if (!sel) return;
    const city = $('cityFilter').value;
    const m = new Map();
    allListings.forEach(a => {
      if (a.quartier && (!city || a.city === city)) {
        const k = qKey(a.quartier);
        if (k && !m.has(k)) m.set(k, a.quartier);
      }
    });
    if (m.size === 0) { sel.style.display = 'none'; sel.innerHTML = ''; currentQuartier = ''; return; }
    if (currentQuartier && !m.has(currentQuartier)) currentQuartier = '';
    const list = [...m.entries()].sort((x, y) => x[1].localeCompare(y[1], 'fr'));
    sel.innerHTML = '<option value="">Tous les quartiers</option>' +
      list.map(([k, label]) => `<option value="${esc(k)}"${k === currentQuartier ? ' selected' : ''}>${esc(label)}</option>`).join('');
    sel.style.display = '';
  }

  (function injectQuartierUi() {
    const cf = $('cityFilter');
    if (cf && !$('quartierFilter')) {
      const sel = document.createElement('select');
      sel.id = 'quartierFilter';
      sel.className = 'city-select form-el';
      sel.style.display = 'none';
      sel.setAttribute('aria-label', 'Quartier');
      cf.insertAdjacentElement('afterend', sel);
      sel.addEventListener('change', () => { currentQuartier = sel.value; renderListings(); });
    }
    const adCity = $('adCity');
    if (adCity && !$('adQuartier')) {
      const grp = document.createElement('div');
      grp.className = 'form-group';
      grp.innerHTML = '<label for="adQuartier">Quartier (facultatif)</label>' +
        '<input class="form-sheet-el" id="adQuartier" type="text" maxlength="' + MAX_QUARTIER + '" list="quartiersList" placeholder="Ex : Bastos, Akwa…" autocomplete="off">' +
        '<datalist id="quartiersList"></datalist>' +
        '<small class="form-hint">Aide les acheteurs à vous trouver. N’indiquez pas votre adresse exacte.</small>';
      const holder = adCity.closest('.form-group');
      if (holder) holder.insertAdjacentElement('afterend', grp);
      adCity.addEventListener('change', fillQuartierSuggestions);
    }
    fillQuartierSuggestions();
  })();
  $('categoryChips').innerHTML = '<button class="cat-chip active" data-cat="">✨ Tout voir</button>' +
    CATEGORIES.map(c => `<button class="cat-chip" data-cat="${c.value}">${c.chip}</button>`).join('');

  $('categoryChips').addEventListener('click', (e) => {
    const chip = e.target.closest('.cat-chip');
    if (!chip) return;
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentCategory = chip.dataset.cat;
    renderListings();
  });

  $('searchInput').addEventListener('input', () => renderListings());
  $('cityFilter').addEventListener('change', () => { refreshQuartierFilter(); renderListings(); });
  $('priceFilter').addEventListener('change', () => renderListings());

  // CamerLink Smart Discovery: raccourcis de recherche légers, sans dépendance IA payante.
  function ensureSmartDiscovery() {
    if (document.getElementById('cl-smart-discovery')) return;
    const bar = document.querySelector('.search-filter-bar');
    if (!bar) return;
    const panel = document.createElement('section');
    panel.id = 'cl-smart-discovery';
    panel.className = 'cl-smart-discovery';
    panel.setAttribute('aria-label', 'Suggestions de recherche');
    panel.innerHTML = '<div class="cl-smart-discovery-heading"><span>✦ RECHERCHE INTELLIGENTE</span><small>Essayez une recherche ou choisissez un raccourci</small></div><div class="cl-smart-chips"><button type="button" data-smart-search="Services">🛠 Services</button><button type="button" data-smart-city="Douala">📍 Douala</button><button type="button" data-smart-city="Yaoundé">📍 Yaoundé</button><button type="button" data-smart-price="10000">💰 Moins de 10 000 FCFA</button><button type="button" data-smart-search="coiffure">💇 Coiffure</button><button type="button" data-smart-search="électricité">⚡ Électricité</button></div>';
    bar.insertAdjacentElement('afterend', panel);
    panel.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.smartCity) {
        $('cityFilter').value = button.dataset.smartCity;
        refreshQuartierFilter();
      } else if (button.dataset.smartPrice) {
        $('priceFilter').value = button.dataset.smartPrice;
      } else if (button.dataset.smartSearch) {
        $('searchInput').value = button.dataset.smartSearch;
      }
      renderListings();
      document.getElementById('listings-grid')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }
  ensureSmartDiscovery();

  /* ===== FAVORIS ===== */
  // Cache local séparé par compte : un utilisateur ne voit jamais les favoris
  // laissés en cache par un autre compte sur le même téléphone.
  function favoritesStorageKey() {
    return currentUser && currentUser.id
      ? 'camerlink_favorites:' + currentUser.id
      : 'camerlink_favorites:guest';
  }

  window.getFavorites = function () {
    try {
      const value = JSON.parse(localStorage.getItem(favoritesStorageKey()));
      return Array.isArray(value) ? value.map(String) : [];
    } catch (e) { return []; }
  };

  function setFavs(arr) {
    try {
      localStorage.setItem(favoritesStorageKey(), JSON.stringify([...new Set((arr || []).map(String))]));
    } catch (e) { /* stockage indisponible */ }
    $('favCount').textContent = window.getFavorites().length;
  }

  function bumpLike(id, d) {
    likeCounts[id] = Math.max(0, (likeCounts[id] || 0) + d);
  }

  function refreshOpenDetail() {
    if ($('adDetailModal') && $('adDetailModal').classList.contains('active')) renderAdDetail();
  }

  // "J'aime" : enregistré dans la table favoris (compte obligatoire), compteur public par annonce
  window.toggleFavorite = async function (id) {
    id = String(id);
    if (!currentUser) { toast('Connectez-vous pour aimer une annonce'); openModal('authModal'); return; }
    if (likeBusy.has(id)) return;
    const actorId = currentUser.id;
    likeBusy.add(id);

    const before = window.getFavorites();
    const had = before.includes(id);
    setFavs(had ? before.filter(x => x !== id) : [...before, id]);
    bumpLike(id, had ? -1 : 1);
    renderListings(); refreshOpenDetail();

    try {
      const r = had
        ? await sb.from('favoris').delete().eq('annonce_id', Number(id)).eq('user_id', actorId)
        : await sb.from('favoris').insert({ annonce_id: Number(id), user_id: actorId });
      if (r.error) {
        if (r.error.code === '23505') { loadLikeCounts(); } // déjà aimé
        else throw r.error;
      }
      toast(had ? 'Retiré de vos favoris' : 'Ajouté à vos favoris');
    } catch (ex) {
      // Ne jamais modifier le cache du compte qui s'est connecté entre-temps.
      if (currentUser && currentUser.id === actorId) {
        const now = window.getFavorites();
        setFavs(had ? [...now, id] : now.filter(x => x !== id));
        bumpLike(id, had ? 1 : -1);
        renderListings(); refreshOpenDetail();
        toast('Action impossible : ' + (ex && ex.message ? ex.message : 'réessayez.'));
      }
    } finally {
      likeBusy.delete(id);
    }
  };
  $('favCount').textContent = window.getFavorites().length;

  async function syncFavorites() {
    if (!currentUser) { setFavs([]); renderListings(); return; }
    const actorId = currentUser.id;
    try {
      const { data, error } = await withTimeout(
        sb.from('favoris').select('annonce_id').eq('user_id', actorId)
      );
      if (error) throw error;
      // Une réponse réseau tardive ne doit pas remplacer les favoris d'un autre compte.
      if (!currentUser || currentUser.id !== actorId) return;
      setFavs((data || []).map(r => String(r.annonce_id)));
      renderListings(); refreshOpenDetail();
    } catch (e) { /* on garde le cache local */ }
  }

  async function loadLikeCounts() {
  try {
    const ids = [...new Set(
      (allListings || [])
        .map(ad => Number(ad.id))
        .filter(id => Number.isSafeInteger(id) && id > 0)
    )];

    if (!ids.length) {
      likeCounts = {};
      renderListings();
      refreshOpenDetail();
      return;
    }

    const { data, error } = await withTimeout(
      sb.rpc('reel_likes_count', {
        p_annonce_ids: ids
      })
    );

    if (error) return;

    likeCounts = {};

    (data || []).forEach(r => {
      likeCounts[r.annonce_id] = Number(r.nb) || 0;
    });

    renderListings();
    refreshOpenDetail();
  } catch (e) {
    console.error('Erreur chargement des likes :', e);
  }
  }
   
      
     
    
  

  // Compteur de vues : 1 vue par visiteur, par annonce et par heure (limite côté base)
  async function registerView(id) {
    id = String(id);
    if (viewedNow.has(id)) return;
    viewedNow.add(id);
    try {
      const { data, error } = await withTimeout(sb.rpc('increment_views', { annonce_id: Number(id) }));
      if (!error && typeof data === 'number') {
        const ad = allListings.find(a => String(a.id) === id);
        if (ad) { ad.views = data; renderListings(); refreshOpenDetail(); }
      }
    } catch (e) { /* silencieux */ }
  }

  $('favToggleBtn').addEventListener('click', () => {
    favOnly = !favOnly;
    $('favToggleBtn').classList.toggle('active', favOnly);
    renderListings();
  });

  /* ===== NUMÉROS +237 ===== */
  function normPhone(raw) {
    const s = String(raw || '').trim();
    let d = s.replace(/\D/g, '');
    const intl = s.startsWith('+') || d.startsWith('00');
    if (d.startsWith('00')) d = d.slice(2);
    if (/^237\d{9}$/.test(d)) return '+' + d;
    if (/^6\d{8}$/.test(d)) return '+237' + d;
    if (/^06\d{8}$/.test(d)) return '+237' + d.slice(1);
    if (intl && /^\d{8,15}$/.test(d) && !d.startsWith('237')) return '+' + d;
    return null;
  }

  function guardPhone(formId, inputId, errId) {
    const form = $(formId), input = $(inputId);
    if (!form || !input) return;
    input.addEventListener('change', () => {
      const n = normPhone(input.value);
      if (n) input.value = n;
    });
    form.addEventListener('submit', (e) => {
      const n = normPhone(input.value);
      if (!n) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const er = $(errId);
        if (er) er.textContent = 'Numéro invalide. Exemple : 6 91 23 45 67';
        return;
      }
      input.value = n;
    }, true);
  }
  guardPhone('adForm', 'adContact', 'pubError');

  /* ===== CHARGEMENT DES ANNONCES ===== */
  async function loadListings() {
    let failed = false;
    let loadError = '';
    try {
      const res = await withTimeout(sb.from('annonces').select('*').order('created_at', { ascending: false }));
      if (res.error) {
        failed = true;
        loadError = res.error.message || res.error.code || 'Erreur Supabase inconnue';
        console.error('[CamerLink] Impossible de charger les annonces:', res.error);
      } else {
        allListings = res.data || [];
      }
    } catch (err) {
      failed = true;
      loadError = err && err.message ? err.message : 'Vérifiez votre connexion Internet.';
      console.error('[CamerLink] Échec du chargement des annonces:', err);
    }

    videos = {};
    allListings.forEach(a => {
      if (a.video_url && /^https:\/\//i.test(a.video_url)) videos[a.id] = a.video_url;
    });
    refreshQuartierFilter();
    fillQuartierSuggestions();
    renderListings();
    if (failed && allListings.length === 0) {
      const grid = $('listings-grid');
      if (grid) {
        grid.innerHTML = `<div class="state-msg" role="alert" style="padding:20px;text-align:center;">
          <strong>Impossible de charger les annonces.</strong>
          <p style="margin:8px 0;color:var(--color-text-muted);">La connexion au service d’annonces a échoué. Vérifiez Internet puis réessayez.</p>
          <button type="button" id="cl-retry-listings" style="padding:10px 16px;border-radius:10px;background:var(--a1);color:#07111b;font-weight:700;">Réessayer</button>
        </div>`;
        const retry = $('cl-retry-listings');
        if (retry) retry.addEventListener('click', () => { retry.disabled = true; retry.textContent = 'Chargement…'; loadListings(); });
      }
      const count = $('resultsCount');
      if (count) count.textContent = 'Chargement en échec';
    }
    renderReels(failed);
  }


  /* Photo de profil artisan */
  const artisanPhotoCss = document.createElement('style');
  artisanPhotoCss.textContent = '.cl-space-photo-editor{display:flex;align-items:center;gap:14px;padding:14px;border:1px solid #22d3ee44;border-radius:16px;background:linear-gradient(120deg,#22d3ee12,#8b5cf612)}.cl-space-photo-preview{width:92px;height:92px;flex:0 0 92px;border-radius:50%;overflow:hidden;border:3px solid #22d3ee;display:grid;place-items:center;background:#e2e8f0;color:#334155;font-size:2rem;font-weight:800}.cl-space-photo-preview img{width:100%;height:100%;object-fit:cover}.cl-space-photo-editor input{display:block;max-width:100%;margin-top:8px}.cl-space-photo-clear{margin-top:8px;border:1px solid #94a3b855;border-radius:8px;padding:6px 9px;background:transparent;color:inherit;cursor:pointer;font-size:.8rem}';
  document.head.appendChild(artisanPhotoCss);

  /* ===== VITRINE DES ARTISANS VÉRIFIÉS ===== */
  async function loadVerifiedArtisans() {
    const grid = $('verified-artisans-grid');
    const section = $('verified-artisans');
    if (!grid || !section) return;
    try {
      const result = await withTimeout(
        sb.from('etablissements').select('user_id, name, type, city, description, logo_url, verified').eq('verified', true).limit(8), 10000
      );
      if (result.error) throw result.error;
      const profiles = (result.data || []).filter(p => p && p.user_id && p.verified);
      if (!profiles.length) { section.hidden = true; return; }
      section.hidden = false;
      grid.innerHTML = profiles.map((p) => {
        const name = p.name || 'Artisan CamerLink';
        const avatar = p.logo_url
          ? '<img src="' + esc(p.logo_url) + '" alt="" loading="lazy">'
          : '<span class="cl-verified-initial">' + esc(name.trim().charAt(0).toUpperCase() || 'C') + '</span>';
        return '<button type="button" class="cl-verified-card" data-verified-uid="' + esc(p.user_id) + '" aria-label="Voir le profil vérifié de ' + esc(name) + '">' +
          '<span class="cl-verified-avatar">' + avatar + '<span class="cl-verified-check" aria-label="Profil vérifié" title="Profil vérifié">✓</span></span>' +
          '<span class="cl-verified-name">' + esc(name) + ' <span class="cl-verified-inline-check" title="Profil vérifié">✓</span></span>' +
          '<span class="cl-verified-meta">' + esc([p.type, p.city].filter(Boolean).join(' · ') || 'Professionnel CamerLink') + '</span>' +
          '<span class="cl-verified-description">' + esc(p.description || 'Découvrez ses services et ses réalisations.') + '</span>' +
          '<span class="cl-verified-cta">Voir le profil <span aria-hidden="true">↗</span></span>' +
        '</button>';
      }).join('');
    } catch (error) {
      console.warn('Profils vérifiés indisponibles pour le moment.', error && error.message);
      section.hidden = true;
    }
  }
  $('verified-artisans-grid')?.addEventListener('click', (event) => {
    const card = event.target.closest('[data-verified-uid]');
    if (card) openArtisan(card.dataset.verifiedUid);
  });

  async function loadData() {
    await loadListings();
    loadVerifiedArtisans();
    openRoute();
    loadLikeCounts();
    loadStoriesSafely(); // en arrière-plan, ne bloque jamais la page
  }

  /* ===== CSS REELS VERTICAUX (mobile) : injecté ici pour ne déployer qu'un seul fichier ===== */
  (function injectReelsCss() {
    if (document.getElementById('reels-vertical-fix')) return;
    const st = document.createElement('style');
    st.id = 'reels-vertical-fix';
    st.textContent = `
@media screen and (max-width: 700px) {
  .reels-section, .reels-section > * { box-sizing: border-box !important; }
  .reels-section {
    display: block !important; width: 100% !important; max-width: 100% !important;
    min-width: 0 !important; overflow: visible !important; padding-left: 12px !important; padding-right: 12px !important;
  }
  #reels-feed, #reels-feed.reels-feed {
    display: flex !important; flex-direction: column !important; flex-wrap: nowrap !important;
    align-items: stretch !important; justify-content: flex-start !important;
    width: 100% !important; max-width: none !important; min-width: 0 !important;
    max-height: 78svh !important; box-sizing: border-box !important;
    overflow-x: hidden !important; overflow-y: auto !important; scroll-snap-type: y mandatory !important;
    margin: 0 !important; padding: 0 !important;
  }
  #reels-feed > article.reel-card, #reels-feed > .reel-card {
    display: block !important; position: relative !important; flex: 0 0 72svh !important;
    width: 100% !important; max-width: none !important; min-width: 0 !important;
    height: 72svh !important; min-height: 420px !important; max-height: 760px !important;
    margin: 0 0 12px !important; box-sizing: border-box !important;
    scroll-snap-align: start !important; border-radius: 16px !important; overflow: hidden !important;
  }
  #reels-feed > article.reel-card > video, #reels-feed > .reel-card > video {
    display: block !important; width: 100% !important; height: 100% !important; max-width: none !important;
    object-fit: cover !important;
  }
}`;
    document.head.appendChild(st);
  })();

  /* ===== REELS : fil vertical des annonces qui ont une vidéo ===== */
  function reelsMessage(text) {
    return '<div class="reels-placeholder"><span class="reels-placeholder-icon">▶</span><span>' + esc(text) + '</span></div>';
  }

  let reelCommentsModal = null;
  function ensureReelCommentsModal() {
    if (reelCommentsModal) return reelCommentsModal;
    const wrap = document.createElement('div');
    wrap.id = 'camerlink-reel-comments';
    wrap.style.cssText = 'display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.65);align-items:flex-end;justify-content:center;';
    wrap.innerHTML = '<section role="dialog" aria-modal="true" aria-label="Commentaires du Reel" style="width:100%;max-width:620px;max-height:78vh;background:#111827;color:#fff;border-radius:18px 18px 0 0;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="display:flex;justify-content:space-between;align-items:center;"><strong>Commentaires</strong><button type="button" data-comments-close aria-label="Fermer" style="background:transparent;color:#fff;font-size:24px;border:0;">×</button></div><div data-comments-list style="overflow:auto;min-height:100px;max-height:48vh;"></div><form data-comments-form style="display:flex;gap:8px;"><input name="content" maxlength="1000" required placeholder="Écrire un commentaire…" style="flex:1;min-width:0;padding:12px;border-radius:10px;color:#111;"><button type="submit" style="padding:10px 14px;border-radius:10px;background:#16a34a;color:white;font-weight:700;">Envoyer</button></form><small style="color:#cbd5e1;">Votre commentaire est publié immédiatement.</small></section>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function(e) { if (e.target === wrap || e.target.closest('[data-comments-close]')) wrap.style.display = 'none'; });
    wrap.querySelector('[data-comments-form]').addEventListener('submit', submitReelComment);
    reelCommentsModal = wrap;
    return wrap;
  }
  async function fetchApprovedReelComments(reelId) {
    const result = await withTimeout(sb.from('reel_comments').select('id,reel_id,user_id,content,status,created_at').eq('reel_id', Number(reelId)).eq('status', 'approved').order('created_at', { ascending: true }).limit(200));
    if (result.error) throw result.error;
    return result.data || [];
  }
  async function updateReelCommentCount(reelId) {
    try {
      const rows = await fetchApprovedReelComments(reelId);
      document.querySelectorAll('[data-reel-comments][data-reel-id="' + String(reelId) + '"]').forEach(function(btn) { btn.textContent = '💬 Commentaires (' + rows.length + ')'; });
    } catch (err) { console.warn('CamerLink: chargement compteur commentaires impossible', err); }
  }
  async function openReelComments(reelId) {
    const modal = ensureReelCommentsModal();
    modal.dataset.reelId = String(reelId);
    modal.style.display = 'flex';
    const list = modal.querySelector('[data-comments-list]');
    list.textContent = 'Chargement des commentaires…';
    try {
      const rows = await fetchApprovedReelComments(reelId);
      if (!rows.length) { list.innerHTML = '<p style="color:#cbd5e1;text-align:center;padding:18px;">Aucun commentaire publié pour le moment.</p>'; }
      else {
        list.innerHTML = '';
        rows.forEach(function(row) {
          const item = document.createElement('div');
          item.style.cssText = 'padding:10px 0;border-bottom:1px solid #374151;overflow-wrap:anywhere;';
          const body = document.createElement('div'); body.textContent = row.content || '';
          const date = document.createElement('small'); date.style.color = '#9ca3af'; date.textContent = row.created_at ? new Date(row.created_at).toLocaleString('fr-FR') : '';
          item.append(body, date); list.appendChild(item);
        });
      }
      modal.querySelector('[data-comments-form] input').focus();
      modal.querySelector('[data-comments-form] button[type="submit"]').disabled = !currentUser;
      modal.querySelector('[data-comments-form] input').placeholder = currentUser ? 'Écrire un commentaire…' : 'Connectez-vous pour commenter';
      await updateReelCommentCount(reelId);
    } catch (err) { list.textContent = 'Impossible de charger les commentaires. Réessayez plus tard.'; console.error('CamerLink commentaires:', err); }
  }
  async function submitReelComment(event) {
    event.preventDefault();
    const modal = ensureReelCommentsModal();
    const input = modal.querySelector('[name="content"]');
    const content = String(input.value || '').trim();
    const reelId = Number(modal.dataset.reelId);
    if (!currentUser || !currentUser.id) { toast('Connectez-vous pour commenter.'); return; }
    if (!content || !reelId) return;
    const button = modal.querySelector('button[type="submit"]'); button.disabled = true;
    try {
      const result = await withTimeout(sb.from('reel_comments').insert({ reel_id: reelId, user_id: currentUser.id, content: content, status: 'approved' }));
      if (result.error) throw result.error;
      input.value = ''; toast('Commentaire publié !'); await openReelComments(reelId);
    } catch (err) { console.error('CamerLink envoi commentaire:', err); toast('Envoi impossible : ' + (err && err.message ? err.message : 'réessayez.')); }
    finally { button.disabled = false; }
  }
  function renderReels(failed) {
    const feed = $('reels-feed');
    if (!feed) return;
    if (reelObserver) { reelObserver.disconnect(); reelObserver = null; }

    const list = allListings.filter(a => videos[a.id]).slice(0, REELS_MAX);
    if (list.length === 0) {
      feed.innerHTML = reelsMessage(failed
        ? 'Vidéos indisponibles pour le moment. Réessayez plus tard.'
        : 'Aucune vidéo pour le moment. Publiez une annonce avec vidéo !');
      return;
    }

    // défilement vertical, une vidéo à la fois
    feed.style.maxHeight = '78vh';
    feed.style.overflowY = 'auto';
    feed.style.scrollSnapType = 'y mandatory';

    feed.innerHTML = list.map(ad => {
      const wa = waNumber(ad.contact);
      const price = Number(ad.price || 0).toLocaleString('fr-FR');
      const poster = ad.image_url ? ` poster="${esc(ad.image_url)}"` : '';
      return `
      <article class="reel-card" data-reel="${esc(ad.id)}" style="position:relative;scroll-snap-align:start;background:#000;border-radius:16px;overflow:hidden;margin-bottom:12px;height:72vh;max-height:640px;">
        <video src="${esc(videos[ad.id])}"${poster} muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;"></video>
        <button type="button" data-reel-sound aria-label="Activer ou couper le son" style="position:absolute;top:10px;right:10px;width:38px;height:38px;border-radius:50%;background:rgba(0,0,0,0.6);color:#fff;font-size:1.1rem;cursor:pointer;">🔇</button>
        <div style="position:absolute;left:0;right:0;bottom:0;padding:14px;background:linear-gradient(transparent,rgba(0,0,0,0.85));color:#fff;">
          <strong style="display:block;font-size:1.05rem;">${esc(ad.title)}</strong>
          <div style="margin:2px 0 10px;font-size:0.9rem;"><span style="color:#34d399;font-weight:800;">${price} FCFA</span>${(ad.quartier || ad.city) ? ' · 📍 ' + esc([ad.quartier, ad.city].filter(Boolean).join(', ')) : ''}</div>
          <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:8px;">
            <button type="button" data-reel-like style="flex:1;min-width:90px;padding:9px 7px;border-radius:9px;background:rgba(255,255,255,.18);color:#fff;font-weight:700;font-size:.85rem;cursor:pointer;">❤️ J’aime (${Number(likeCounts[ad.id] || 0)})</button>
            <span data-reel-views style="flex:1;min-width:70px;padding:9px 7px;border-radius:9px;background:rgba(255,255,255,.12);text-align:center;font-size:.85rem;">👁️ ${Number(ad.views || 0)} vues</span>
            <button type="button" data-reel-share style="flex:1;min-width:90px;padding:9px 7px;border-radius:9px;background:rgba(255,255,255,.18);color:#fff;font-weight:700;font-size:.85rem;cursor:pointer;">↗ Partager</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <button type="button" data-reel-comments data-reel-id="${esc(ad.id)}" style="flex:1;padding:10px;border-radius:8px;background:rgba(255,255,255,0.2);color:#fff;font-weight:700;font-size:0.85rem;cursor:pointer;">💬 Commentaires</button>
            <button type="button" data-reel-open style="flex:1;padding:10px;border-radius:8px;background:rgba(255,255,255,0.2);color:#fff;font-weight:700;font-size:0.85rem;cursor:pointer;">Voir l’annonce</button>
            ${wa ? `<a href="https://api.whatsapp.com/send?phone=${esc(wa)}" target="_blank" rel="noopener" style="flex:1;padding:10px;border-radius:8px;background:#22C55E;color:#fff;font-weight:700;font-size:0.85rem;text-align:center;">WhatsApp</a>` : ''}
          </div>
        </div>
      </article>`;
    }).join('');

    // Afficher immédiatement le nombre de commentaires publics de chaque Reel.
    // Les commentaires restent filtrés côté serveur sur status='approved'.
    list.forEach(function(ad) {
      updateReelCommentCount(ad.id);
    });

    // lecture automatique (sans son) de la vidéo visible, pause des autres
    if ('IntersectionObserver' in window) {
      reelObserver = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          const v = en.target.querySelector('video');
          if (!v) return;
          if (en.isIntersecting && en.intersectionRatio >= 0.6) {
            registerView(en.target.dataset.reel);
            const p = v.play();
            if (p && p.catch) p.catch(() => {});
          } else {
            v.pause();
          }
        });
      }, { threshold: [0, 0.6, 1] });
      feed.querySelectorAll('.reel-card').forEach(c => reelObserver.observe(c));
    }
  }

  const reelsFeed = $('reels-feed');
  if (reelsFeed) {
    reelsFeed.addEventListener('click', (e) => {
      const card = e.target.closest('.reel-card');
      if (!card) return;
      const v = card.querySelector('video');
      const snd = e.target.closest('[data-reel-sound]');
      if (snd) {
        if (v) { v.muted = !v.muted; snd.textContent = v.muted ? '🔇' : '🔊'; }
        return;
      }
      if (e.target.closest('[data-reel-comments]')) { openReelComments(card.dataset.reel); return; }
      if (e.target.closest('[data-reel-like]')) {
        const id = String(card.dataset.reel);
        if (!currentUser) { toast('Connectez-vous pour aimer un Reel'); openModal('authModal'); return; }
        const before = window.getFavorites().includes(id);
        window.toggleFavorite(id);
        const likeBtn = card.querySelector('[data-reel-like]');
        if (likeBtn) likeBtn.textContent = (before ? '🤍 J’aime' : '❤️ J’aime') + ' (' + Math.max(0, Number(likeCounts[id] || 0) + (before ? -1 : 1)) + ')';
        return;
      }
      if (e.target.closest('[data-reel-share]')) {
        const ad = allListings.find(item => String(item.id) === String(card.dataset.reel));
        if (ad) shareLink(ad.title || 'CamerLink', 'Découvrez cette annonce sur CamerLink : ' + (ad.title || ''), '/?annonce=' + encodeURIComponent(ad.id));
        return;
      }
      if (e.target.closest('[data-reel-open]')) { openAdDetail(card.dataset.reel); return; }
      if (e.target.closest('a')) return;
      if (v) {
        if (v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
        else v.pause();
      }
    });
  }

  /* ===== STATUTS DES ARTISANS ===== */
  async function loadStoriesSafely() {
    if (!$('shops-container')) return;
    renderShopsHTML(); // le bouton "Mon statut" s'affiche toujours

    try {
      const { data, error } = await withTimeout(
        sb.from('artisan_stories')
          .select('id, media_url, caption, created_at, artisan_id')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
      );
      if (error || !data || data.length === 0) { storyGroups = []; renderShopsHTML(); return; }

      const ids = [...new Set(data.map(s => s.artisan_id))];
      const shops = await shopInfo(ids);

      const map = new Map();
      data.forEach(s => {
        if (!map.has(s.artisan_id)) map.set(s.artisan_id, []);
        map.get(s.artisan_id).push(s);
      });
      storyGroups = [...map.entries()]
  .map(([uid, items]) => ({
    uid,
    shop: shops[uid] || null,
    items: items.slice().sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    )
  }))
  .filter(
    g => String(g.shop && g.shop.name || '')
      .trim()
      .toLowerCase() !== 'barbara shop'
  );
    renderShopsHTML();    
       
        
    
      
    } catch (e) {
      console.warn('Statuts indisponibles pour le moment.', e && e.message);
    }
  }

  async function shopInfo(ids) {
    const out = {};
    if (!ids.length) return out;
    try {
      const r = await withTimeout(sb.from('etablissements').select('user_id, name, logo_url, owner_name').in('user_id', ids));
      if (!r.error) (r.data || []).forEach(e => { out[e.user_id] = e; });
      else {
        // Compatibilité temporaire si la migration owner_name n'est pas encore appliquée.
        const legacy = await withTimeout(sb.from('etablissements').select('user_id, name, logo_url').in('user_id', ids));
        if (!legacy.error) (legacy.data || []).forEach(e => { out[e.user_id] = e; });
      }
    } catch (e) { /* on garde "Artisan" */ }
    return out;
  }

  function renderShopsHTML() {
    const container = $('shops-container');
    if (!container) return;

    let html = `
      <div class="shop-story-card cta-card" data-action="add" role="button" tabindex="0">
        <div class="story-ring"><div class="story-avatar-wrap">+</div></div>
        <div class="shop-story-name">Mon statut</div>
      </div>`;

    storyGroups.forEach((g, gi) => {
      const name = (g.shop && g.shop.owner_name && g.shop.owner_name.trim()) || 'Compte CamerLink';
      const logo = g.shop && g.shop.logo_url;
      const latest = g.items && g.items[g.items.length - 1];
      const media = latest && latest.media_url ? latest.media_url : '';
      const videoStory = media && isVideo(media);
      const avatar = videoStory
        ? '<span class="cl-story-video-icon" aria-hidden="true">▶</span>'
        : media
          ? `<img src="${esc(media)}" alt="" loading="lazy" class="cl-story-preview">`
          : logo
            ? `<img src="${esc(logo)}" alt="" loading="lazy" class="cl-story-preview">`
            : esc(name.charAt(0).toUpperCase());
      html += `
        <div class="shop-story-card cl-story-card" data-group="${gi}" role="button" tabindex="0" aria-label="Voir les statuts de ${esc(name)}">
          <div class="story-ring cl-story-ring"><div class="story-avatar-wrap cl-story-avatar-wrap">${avatar}</div><span class="cl-story-count">${g.items.length}</span></div>
          <div class="shop-story-name">${esc(name)}</div>
          <div class="cl-story-kind">${videoStory ? '▶ Vidéo' : '▧ Photo'} · 24 h</div>
        </div>`;
    });
    container.innerHTML = html;
  }

  function activateCard(card) {
    if (!card) return;
    if (card.dataset.action === 'add') { window.openAddStoryModal(); return; }
    const g = storyGroups[Number(card.dataset.group)];
    if (g) openViewer(Number(card.dataset.group));
  }
  $('shops-container').addEventListener('click', (e) => activateCard(e.target.closest('.shop-story-card')));
  $('shops-container').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.shop-story-card');
      if (card) { e.preventDefault(); activateCard(card); }
    }
  });

  function getViewerVideo() {
    let v = $('viewerVideo');
    if (!v) {
      v = document.createElement('video');
      v.id = 'viewerVideo';
      v.controls = true;
      v.playsInline = true;
      v.style.cssText = 'width:100%;max-height:70vh;display:none;border-radius:12px;';
      v.addEventListener('ended', nextStory);
      $('viewerMedia').parentNode.appendChild(v);
    }
    return v;
  }

  function openViewer(gi) {
    if (!storyGroups[gi]) return;
    viewer.g = gi; viewer.i = 0;
    showStory();
    openModal('storyViewerModal');
  }

  function showStory() {
    const g = storyGroups[viewer.g];
    const s = g && g.items[viewer.i];
    if (!s) { window.closeStoryViewer(); return; }

    const name = (g.shop && g.shop.owner_name && g.shop.owner_name.trim()) || 'Compte CamerLink';
    const logo = g.shop && g.shop.logo_url;
    const avatar = $('viewerAvatar');
    if (logo) { avatar.src = logo; avatar.style.display = ''; }
    else { avatar.removeAttribute('src'); avatar.style.display = 'none'; }
    $('viewerShopName').textContent = name + ' ›';
    $('viewerCaption').textContent = s.caption || '';

    const img = $('viewerMedia'), vid = getViewerVideo();
    vid.pause();
    if (isVideo(s.media_url)) {
      img.style.display = 'none';
      vid.style.display = '';
      vid.src = s.media_url;
      const p = vid.play();
      if (p && p.catch) p.catch(() => {});
    } else {
      vid.style.display = 'none';
      vid.removeAttribute('src');
      img.style.display = '';
      img.src = s.media_url;
    }
  }

  function nextStory() {
    const g = storyGroups[viewer.g];
    if (!g) return;
    if (viewer.i + 1 < g.items.length) { viewer.i++; showStory(); }
    else window.closeStoryViewer();
  }
  $('viewerMedia').addEventListener('click', nextStory);

  // Clic sur le nom de l'artisan dans la visionneuse : ouvre sa fiche
  const viewerHeader = document.querySelector('.story-header-info');
  if (viewerHeader) {
    viewerHeader.style.cursor = 'pointer';
    viewerHeader.addEventListener('click', () => {
      const g = storyGroups[viewer.g];
      if (!g) return;
      window.closeStoryViewer();
      openArtisan(g.uid);
    });
  }

  window.closeStoryViewer = function () {
    const vid = $('viewerVideo');
    if (vid) { vid.pause(); vid.removeAttribute('src'); }
    closeModal('storyViewerModal');
  };

  window.openAddStoryModal = function () {
    if (!currentUser) {
      toast('Connectez-vous pour publier un statut');
      openModal('authModal');
      return;
    }
    openModal('publishStoryModal');
  };

  const storyForm = $('storyForm');
  if (storyForm) {
    storyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentUser) { toast('Non connecté'); return; }

      const fileInput = $('storyFile');
      const captionInput = $('storyCaption');
      const errBox = $('storyError');
      const submitBtn = $('storySubmitBtn');
      const file = fileInput.files[0];

      if (!file) { if (errBox) errBox.textContent = 'Veuillez choisir un fichier.'; return; }
      if (!STORY_TYPES.includes(file.type)) {
        if (errBox) errBox.textContent = 'Format non accepté (jpg, png, webp, mp4, webm, mov).';
        return;
      }
      if (file.size > MAX_STORY_MB * 1024 * 1024) {
        if (errBox) errBox.textContent = `Fichier trop lourd (max ${MAX_STORY_MB} Mo).`;
        return;
      }

      if (errBox) errBox.textContent = '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Publication...'; }

      let uploadedPath = null, saved = false;
      try {
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const filePath = `${currentUser.id}/${Date.now()}.${ext}`;

        const { error: upErr } = await sb.storage.from(STORY_BUCKET).upload(filePath, file, { contentType: file.type });
        if (upErr) throw upErr;
        uploadedPath = filePath;

        const { data: { publicUrl } } = sb.storage.from(STORY_BUCKET).getPublicUrl(filePath);
        const caption = captionInput ? captionInput.value.trim() : '';

        // expires_at est rempli par la base (24 h)
        const { error: dbErr } = await sb.from('artisan_stories').insert({
          artisan_id: currentUser.id,
          media_url: publicUrl,
          caption: caption || null
        });
        if (dbErr) throw dbErr;
        saved = true;

        closeModal('publishStoryModal');
        fileInput.value = '';
        if (captionInput) captionInput.value = '';
        toast('Statut publié ! (visible 24 h)');
        loadStoriesSafely();
      } catch (ex) {
        console.error(ex);
        if (errBox) errBox.textContent = 'Erreur lors de la publication : ' + (ex && ex.message ? ex.message : 'réessayez.');
      } finally {
        // fichier envoyé mais statut non enregistré : on le supprime pour ne pas laisser d'orphelin
        if (uploadedPath && !saved) { try { await sb.storage.from(STORY_BUCKET).remove([uploadedPath]); } catch (e) { /* ignoré */ } }
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Publier le statut'; }
      }
    });
  }

  /* ===== PUBLICATION D'UNE ANNONCE (photo + vidéo facultative) ===== */
  let videoPreviewUrl = null;
  function resetVideoPreview() {
    if (videoPreviewUrl) { URL.revokeObjectURL(videoPreviewUrl); videoPreviewUrl = null; }
    const pv = $('adVideoPreview'), nm = $('adVideoSelected');
    if (pv) { pv.pause(); pv.removeAttribute('src'); pv.hidden = true; }
    if (nm) nm.textContent = 'Aucune vidéo sélectionnée (optionnel).';
  }

  const adVideoInput = $('adVideoFile');
  if (adVideoInput) {
    adVideoInput.addEventListener('change', () => {
      resetVideoPreview();
      const f = adVideoInput.files[0];
      if (!f) return;
      const nm = $('adVideoSelected'), pv = $('adVideoPreview');
      const mb = (f.size / (1024 * 1024)).toFixed(1);
      if (f.size > MAX_AD_VIDEO_MB * 1024 * 1024) {
        if (nm) nm.textContent = `Vidéo trop lourde (${mb} Mo, max ${MAX_AD_VIDEO_MB} Mo).`;
        return;
      }
      if (nm) nm.textContent = `${f.name} (${mb} Mo)`;
      if (pv) {
        videoPreviewUrl = URL.createObjectURL(f);
        pv.src = videoPreviewUrl;
        pv.hidden = false;
      }
    });
  }

  const adForm = $('adForm');
  if (adForm) {
    adForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = $('pubError');
      const btn = adForm.querySelector('button[type="submit"]');
      const setErr = (m) => { if (errBox) errBox.textContent = m; };
      setErr('');

      if (!currentUser) { toast('Connectez-vous pour publier'); openModal('authModal'); return; }

      const title = $('adTitle').value.trim();
      const description = $('adDesc').value.trim();
      const price = Math.round(Number($('adPrice').value));
      const contact = $('adContact').value.trim();
      const quartier = canonicalQuartier($('adCity').value, $('adQuartier') ? $('adQuartier').value : '');
      const file = $('adImage').files[0];
      const vFile = adVideoInput ? adVideoInput.files[0] : null;

      if (title.length < 3 || title.length > 120) return setErr('Le titre doit faire entre 3 et 120 caractères.');
      if (description.length > 2000) return setErr('La description est trop longue (2000 caractères max).');
      if (!Number.isFinite(price) || price < 0) return setErr('Prix invalide.');
      if ($('adQuartier') && $('adQuartier').value.trim().length > MAX_QUARTIER) return setErr(`Le quartier est trop long (${MAX_QUARTIER} caractères max).`);
      if (!file) return setErr('Ajoutez une photo.');
      if (!AD_IMG_TYPES.includes(file.type)) return setErr('Photo : jpg, png ou webp uniquement.');
      if (file.size > MAX_AD_IMG_MB * 1024 * 1024) return setErr(`Photo trop lourde (max ${MAX_AD_IMG_MB} Mo).`);

      let vType = '';
      if (vFile) {
        const rawExt = (vFile.name.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        vType = vFile.type || VIDEO_EXT_TYPE[rawExt] || '';
        if (!AD_VIDEO_TYPES.includes(vType)) return setErr('Vidéo : mp4, webm ou mov uniquement.');
        if (vFile.size > MAX_AD_VIDEO_MB * 1024 * 1024) return setErr(`Vidéo trop lourde (max ${MAX_AD_VIDEO_MB} Mo).`);
      }

      if (btn) { btn.disabled = true; btn.textContent = 'Publication...'; }
      const uploaded = []; // fichiers envoyés : [bucket, chemin]
      let saved = false;
      try {
        const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
        const path = `${currentUser.id}/${Date.now()}.${ext}`;
        const up = await sb.storage.from(AD_BUCKET).upload(path, file, { contentType: file.type });
        if (up.error) throw up.error;
        uploaded.push([AD_BUCKET, path]);
        const { data: { publicUrl } } = sb.storage.from(AD_BUCKET).getPublicUrl(path);

        let videoUrl = null;
        if (vFile) {
          if (btn) btn.textContent = 'Envoi de la vidéo...';
          const vPath = `${currentUser.id}/${Date.now()}.${VIDEO_TYPE_EXT[vType]}`;
          const vu = await sb.storage.from(VIDEO_BUCKET).upload(vPath, vFile, { contentType: vType });
          if (vu.error) throw vu.error;
          uploaded.push([VIDEO_BUCKET, vPath]);
          videoUrl = sb.storage.from(VIDEO_BUCKET).getPublicUrl(vPath).data.publicUrl;
        }

        const row = {
          title,
          category: $('adCategory').value,
          city: $('adCity').value,
          price,
          description,
          contact,
          image_url: publicUrl
        };
        if (videoUrl) row.video_url = videoUrl;
        if (quartier) row.quartier = quartier;

        const { error } = await sb.from('annonces').insert(row);
        if (error) throw error;
        saved = true;

        closeModal('publishModal');
        adForm.reset();
        resetVideoPreview();
        toast(videoUrl ? 'Annonce publiée avec sa vidéo !' : 'Annonce publiée !');
        await loadListings();
      } catch (ex) {
        console.error(ex);
        setErr('Erreur : ' + (ex && ex.message ? ex.message : 'réessayez.'));
      } finally {
        // échec après envoi : on supprime les fichiers pour ne pas laisser d'orphelins
        if (!saved && uploaded.length) {
          for (const [bucket, p] of uploaded) {
            try { await sb.storage.from(bucket).remove([p]); } catch (e) { /* ignoré */ }
          }
        }
        if (btn) { btn.disabled = false; btn.textContent = 'Publier'; }
      }
    });
  }

  /* ===== AFFICHAGE DES ANNONCES ===== */
  /* CAMERLINK_NEARBY_V1 — localisation facultative, conservée uniquement en mémoire */
  let nearbyPosition = null;
  let nearbyNotice = '';
  const getAdCoordinates = (ad) => {
    const lat = Number(ad.latitude ?? ad.lat ?? ad.latitud);
    const lon = Number(ad.longitude ?? ad.lng ?? ad.lon ?? ad.longitud);
    return Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180
      ? { lat, lon } : null;
  };
  const distanceKm = (a, b) => {
    const rad = n => n * Math.PI / 180;
    const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(Math.max(0, 1 - x)));
  };
  const ensureNearbyPanel = () => {
    const grid = $('listings-grid');
    if (!grid || $('cl-nearby-panel')) return;
    const panel = document.createElement('section');
    panel.id = 'cl-nearby-panel';
    panel.className = 'cl-nearby-panel';
    panel.innerHTML = '<div><strong>📍 CamerLink Autour de moi</strong><p id="cl-nearby-status">Trouvez des artisans à proximité. Votre position ne sera pas publiée.</p></div><button id="cl-nearby-enable" type="button">Trouver près de moi</button><button id="cl-nearby-map" type="button" hidden>Explorer la carte</button>';
    grid.parentNode.insertBefore(panel, grid);
    $('cl-nearby-enable').addEventListener('click', () => {
      if (!navigator.geolocation) {
        nearbyNotice = 'La géolocalisation n’est pas prise en charge par ce navigateur.';
        updateNearbyStatus();
        return;
      }
      const button = $('cl-nearby-enable');
      button.disabled = true;
      button.textContent = 'Localisation…';
      navigator.geolocation.getCurrentPosition(position => {
        nearbyPosition = { lat: position.coords.latitude, lon: position.coords.longitude };
        button.disabled = false;
        button.textContent = 'Actualiser ma position';
        const count = allListings.filter(ad => getAdCoordinates(ad)).length;
        nearbyNotice = count
          ? 'Position activée. Les annonces avec coordonnées sont classées par distance. Votre position reste dans cet onglet.'
          : 'Position activée. Les annonces actuelles ne contiennent pas de coordonnées GPS vérifiables ; utilisez la carte pour explorer les artisans près de vous.';
        updateNearbyStatus();
        renderListings();
      }, error => {
        button.disabled = false;
        button.textContent = 'Réessayer';
        nearbyNotice = error.code === 1
          ? 'Autorisation refusée. Autorisez la localisation dans les paramètres du navigateur pour utiliser cette fonction.'
          : 'Position indisponible. Vérifiez le GPS et réessayez.';
        updateNearbyStatus();
      }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 });
    });
    $('cl-nearby-map').addEventListener('click', () => {
      if (!nearbyPosition) return;
      const url = 'https://www.google.com/maps/search/' + encodeURIComponent('artisan près de moi') +
        '/@' + nearbyPosition.lat + ',' + nearbyPosition.lon + ',13z';
      window.open(url, '_blank', 'noopener,noreferrer');
    });
    updateNearbyStatus();
  };
  function updateNearbyStatus() {
    const status = $('cl-nearby-status');
    const mapButton = $('cl-nearby-map');
    if (status) status.textContent = nearbyNotice || 'Activez la localisation pour rechercher les services proches. Votre position ne sera pas publiée.';
    if (mapButton) mapButton.hidden = !nearbyPosition;
  }
  ensureNearbyPanel();

  function renderListings() {
    const grid = $('listings-grid');
    if (!grid) return;

    const term = $('searchInput').value.trim();
    const city = $('cityFilter').value;
    const maxPrice = Number($('priceFilter').value) || 0;
    const favorites = window.getFavorites();
    // Recherche tolérante : accents, casse et mots-clés métier/localisation.
    const normalizeSearch = value => String(value ?? '').normalize('NFD')
      .replace(/[\\u0300-\\u036f]/g, '').toLowerCase().trim();
    const ignoredWords = new Set(['a','au','aux','de','des','du','la','le','les','un','une','pour','dans','avec','et','en','sur','moi','je','cherche','trouve','besoin','aide','svp','s il','il']);
    const queryWords = normalizeSearch(term).split(/[^a-z0-9]+/).filter(word => word.length > 1 && !ignoredWords.has(word));
    const filtered = allListings.filter(ad => {
      const haystack = normalizeSearch([
        ad.title, ad.description, ad.category, ad.city, ad.quartier,
        ad.type, ad.metier, ad.name, ad.contact
      ].filter(Boolean).join(' '));
      const matchesWords = !queryWords.length || queryWords.every(word => haystack.includes(word));
      return (!favOnly || favorites.includes(String(ad.id))) &&
        (!currentCategory || ad.category === currentCategory) &&
        (!city || ad.city === city) &&
        (!currentQuartier || qKey(ad.quartier) === currentQuartier) &&
        (!maxPrice || Number(ad.price) <= maxPrice) &&
        matchesWords;
    });
    if (nearbyPosition) {
      filtered.sort((a, b) => {
        const ca = getAdCoordinates(a), cb = getAdCoordinates(b);
        if (ca && cb) return distanceKm(nearbyPosition, ca) - distanceKm(nearbyPosition, cb);
        if (ca) return -1;
        if (cb) return 1;
        return 0;
      });
    }

    $('resultsCount').textContent = `${filtered.length} annonce(s)`;
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="state-msg">' +
        (favOnly ? 'Aucun favori pour le moment.' : 'Aucune annonce disponible pour le moment.') + '</div>';
      return;
    }

    grid.innerHTML = filtered.map(ad => {
      const isFav = favorites.includes(String(ad.id));
      const rating = Number(ad.note_moyenne || 0).toFixed(1);
      const reviewCount = ad.nb_avis || 0;
      const cleanContact = String(ad.contact || '').replace(/\D/g, '');
      const whatsappNumber = waNumber(ad.contact);
      const viewsCount = ad.views || ad.vues || 0;
      const likes = likeCounts[ad.id] || 0;
      const vUrl = videos[ad.id];

      return `
      <article class="ad-card" data-id="${esc(ad.id)}">
        <div class="card-img-container">
          <span class="card-badge-top">${esc(ad.category)}</span>
          <span class="card-views">👁 ${viewsCount} · ❤️ ${likes}</span>
          <button type="button" class="btn-fav ${isFav ? 'active' : ''}" data-fav="${esc(ad.id)}" aria-label="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}" aria-pressed="${isFav}" style="position:absolute; top:8px; right:8px; width:32px; height:32px; border-radius:50%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:3;">${isFav ? '❤️' : '🤍'}</button>
          ${ad.image_url ? `<img src="${esc(ad.image_url)}" loading="lazy" alt="">` : ''}
        </div>
        <div class="card-body">
          <h3 class="ad-title">${esc(ad.title)}</h3>
          <div class="ad-price">${Number(ad.price || 0).toLocaleString('fr-FR')} FCFA</div>
          <p class="ad-desc">${esc(ad.description)}</p>
          <div class="ad-rating">⭐ ${rating} <span>(${reviewCount} avis)</span></div>
          <div class="card-meta"><span class="ad-city">📍 ${esc([ad.quartier, ad.city].filter(Boolean).join(', '))}</span>${nearbyPosition && getAdCoordinates(ad) ? `<span class="cl-distance">${distanceKm(nearbyPosition, getAdCoordinates(ad)).toFixed(1)} km</span>` : ''}</div>

          ${vUrl ? `<button type="button" data-video="${esc(vUrl)}" style="width:100%; margin-bottom:8px; padding:8px; background:var(--a1); color:#05060D; border-radius:8px; font-weight:700; font-size:0.85rem; cursor:pointer;">▶ Voir la vidéo</button>` : ''}

          ${ad.user_id ? `<button type="button" data-msg="${esc(ad.user_id)}" data-ad="${esc(ad.id)}" style="width:100%; margin-bottom:8px; padding:8px; background:rgba(127,127,127,0.2); border-radius:8px; font-weight:700; font-size:0.85rem; cursor:pointer;">💬 Envoyer un message</button>` : ''}

          ${cleanContact ? `
            <div style="display: flex; gap: 8px;">
              <a href="https://api.whatsapp.com/send?phone=${esc(whatsappNumber)}" target="_blank" rel="noopener" style="flex: 1; background: #22C55E; color: white; padding: 10px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">WhatsApp</a>
              <a href="tel:+${esc(whatsappNumber)}" style="flex: 1; background: #10B981; color: white; padding: 10px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">Appel</a>
            </div>` : ''}
        </div>
      </article>`;
    }).join('');
  }

  $('listings-grid').addEventListener('click', (e) => {
    const fav = e.target.closest('[data-fav]');
    if (fav) { window.toggleFavorite(fav.dataset.fav); return; }
    const vid = e.target.closest('[data-video]');
    if (vid) { window.showVideoPlayer(vid.dataset.video); return; }
    const msg = e.target.closest('[data-msg]');
    if (msg) { window.openChat(msg.dataset.msg, msg.dataset.ad ? Number(msg.dataset.ad) : null); return; }
    if (e.target.closest('a,button')) return;
    const card = e.target.closest('.ad-card');
    if (card) openAdDetail(card.dataset.id);
  });

  /* ===== LECTEUR VIDÉO DES ANNONCES ===== */
  if (!$('videoModalOverlay')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="videoModalOverlay" class="modal-overlay">
        <div class="modal-sheet" style="padding:10px; background:#000; max-width:400px;">
          <button type="button" class="modal-close" id="videoCloseBtn" style="color:#fff; float:right; margin:5px;">×</button>
          <video id="activeVideoPlayer" controls playsinline style="width:100%; border-radius:12px; max-height:70vh;"></video>
        </div>
      </div>`);
    $('videoModalOverlay').addEventListener('click', (e) => { if (e.target.id === 'videoModalOverlay') window.closeVideoPlayer(); });
    $('videoCloseBtn').addEventListener('click', () => window.closeVideoPlayer());
  }

  window.showVideoPlayer = function (url) {
    const p = $('activeVideoPlayer');
    p.src = url;
    $('videoModalOverlay').classList.add('active');
    const pr = p.play();
    if (pr && pr.catch) pr.catch(() => {});
  };

  window.closeVideoPlayer = function () {
    const p = $('activeVideoPlayer');
    p.pause();
    p.removeAttribute('src');
    $('videoModalOverlay').classList.remove('active');
  };

  /* ===== MESSAGERIE ===== */
  const MSG_SEEN_KEY = 'camerlink_msg_seen';
  const chat = { other: null, ad: null };
  let msgChannel = null;

  if (!$('inboxModal')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="inboxModal" class="modal-overlay">
        <div class="modal-sheet">
          <div class="modal-header"><h3 id="inboxTitle">Messages</h3><button type="button" class="modal-close" id="inboxClose">×</button></div>
          <button type="button" id="inboxBack" style="display:none;margin-bottom:8px;background:none;color:var(--a1);font-weight:700;cursor:pointer;">← Conversations</button>
          <div id="inboxBody" style="max-height:60vh;overflow-y:auto;"></div>
          <form id="chatForm" style="display:none;gap:8px;margin-top:10px;">
            <input id="chatInput" class="form-sheet-el" type="text" maxlength="2000" placeholder="Votre message..." autocomplete="off" required>
            <button type="submit" class="btn-submit-modal" style="width:auto;padding:0 16px;">Envoyer</button>
          </form>
        </div>
      </div>`);
  }

  const adTitleOf = (id) => {
    const a = allListings.find(x => String(x.id) === String(id));
    return a ? a.title : null;
  };

  async function fetchMessages() {
    const { data, error } = await withTimeout(
      sb.from('messages')
        .select('id, sender_id, receiver_id, ad_id, content, created_at')
        .order('created_at', { ascending: false })
        .limit(500)
    );
    if (error) throw error;
    return data || [];
  }

  async function shopNames(ids) {
    const info = await shopInfo(ids);
    const names = {};
    Object.keys(info).forEach(k => { names[k] = info[k].name; });
    return names;
  }

  async function refreshBadge() {
    const badge = $('msgBadge');
    if (!badge) return;
    if (!currentUser) { badge.textContent = ''; return; }
    try {
      const seen = localStorage.getItem(MSG_SEEN_KEY) || '1970-01-01T00:00:00Z';
      const { count, error } = await withTimeout(
        sb.from('messages').select('id', { count: 'exact', head: true })
          .eq('receiver_id', currentUser.id).gt('created_at', seen)
      );
      badge.textContent = (!error && count > 0) ? String(count) : '';
    } catch (e) { /* silencieux */ }
  }

  function setView(mode) {
    const thread = mode === 'thread';
    $('inboxBack').style.display = thread ? '' : 'none';
    $('chatForm').style.display = thread ? 'flex' : 'none';
    if (!thread) $('inboxTitle').textContent = 'Messages';
  }

  async function renderInbox() {
    setView('list');
    const body = $('inboxBody');
    body.innerHTML = '<div class="state-msg">Chargement...</div>';
    try {
      const msgs = await fetchMessages();
      const me = currentUser.id;
      const convs = new Map();
      msgs.forEach(m => {
        const other = m.sender_id === me ? m.receiver_id : m.sender_id;
        const key = other + '|' + (m.ad_id || '');
        if (!convs.has(key)) convs.set(key, { other, ad: m.ad_id, last: m });
      });
      if (convs.size === 0) {
        body.innerHTML = '<div class="state-msg">Aucun message pour le moment.</div>';
        return;
      }
      const names = await shopNames([...new Set([...convs.values()].map(c => c.other))]);
      body.innerHTML = [...convs.values()].map(c => `
        <button type="button" data-other="${esc(c.other)}" data-ad="${esc(c.ad || '')}"
          style="display:block;width:100%;text-align:left;padding:10px;margin-bottom:6px;border-radius:10px;background:rgba(127,127,127,0.12);cursor:pointer;">
          <strong>${esc(names[c.other] || 'Utilisateur')}</strong>
          ${c.ad && adTitleOf(c.ad) ? `<small style="opacity:.7"> · ${esc(adTitleOf(c.ad))}</small>` : ''}
          <div style="opacity:.8;font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${c.last.sender_id === me ? 'Vous : ' : ''}${esc(c.last.content)}
          </div>
          <small style="opacity:.6">${fmtDate(c.last.created_at)}</small>
        </button>`).join('');
    } catch (e) {
      body.innerHTML = '<div class="state-msg">Messagerie indisponible. Réessayez.</div>';
    }
  }

  async function renderThread() {
    setView('thread');
    const body = $('inboxBody');
    try {
      const me = currentUser.id;
      const msgs = (await fetchMessages())
        .filter(m => (m.sender_id === chat.other || m.receiver_id === chat.other) &&
                     String(m.ad_id || '') === String(chat.ad || ''))
        .reverse();
      const names = await shopNames([chat.other]);
      $('inboxTitle').textContent = (names[chat.other] || 'Utilisateur') + (chat.ad && adTitleOf(chat.ad) ? ' · ' + adTitleOf(chat.ad) : '');
      body.innerHTML = msgs.length ? msgs.map(m => `
        <div style="display:flex;justify-content:${m.sender_id === me ? 'flex-end' : 'flex-start'};margin-bottom:6px;">
          <div style="max-width:80%;padding:8px 12px;border-radius:12px;background:${m.sender_id === me ? 'var(--a1)' : 'rgba(127,127,127,0.2)'};color:${m.sender_id === me ? '#05060D' : 'inherit'};">
            ${esc(m.content)}<div style="font-size:.7rem;opacity:.6;margin-top:2px;">${fmtDate(m.created_at)}</div>
          </div>
        </div>`).join('') : '<div class="state-msg">Écrivez le premier message.</div>';
      body.scrollTop = body.scrollHeight;
    } catch (e) {
      body.innerHTML = '<div class="state-msg">Messagerie indisponible. Réessayez.</div>';
    }
  }

  function markSeen() {
    try { localStorage.setItem(MSG_SEEN_KEY, new Date().toISOString()); } catch (e) { /* ignoré */ }
    if ($('msgBadge')) $('msgBadge').textContent = '';
  }

  function openInbox() {
    if (!currentUser) { toast('Connectez-vous pour voir vos messages'); openModal('authModal'); return; }
    openModal('inboxModal');
    markSeen();
    renderInbox();
  }

  window.openChat = function (otherId, adId) {
    if (!currentUser) { toast('Connectez-vous pour envoyer un message'); openModal('authModal'); return; }
    if (otherId === currentUser.id) { toast('C’est votre propre annonce'); return; }
    chat.other = otherId; chat.ad = adId || null;
    openModal('inboxModal');
    markSeen();
    renderThread();
  };

  $('msgInboxBtn').addEventListener('click', openInbox);
  $('inboxClose').addEventListener('click', () => closeModal('inboxModal'));
  $('inboxBack').addEventListener('click', renderInbox);

  $('inboxBody').addEventListener('click', (e) => {
    const c = e.target.closest('[data-other]');
    if (!c) return;
    chat.other = c.dataset.other;
    chat.ad = c.dataset.ad ? Number(c.dataset.ad) : null;
    renderThread();
  });

  $('chatForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = $('chatInput');
    const content = input.value.trim();
    if (!content || !currentUser || !chat.other) return;
    input.disabled = true;
    try {
      const { error } = await sb.from('messages').insert({
        sender_id: currentUser.id,
        receiver_id: chat.other,
        ad_id: chat.ad || null,
        content
      });
      if (error) throw error;
      input.value = '';
      await renderThread();
    } catch (ex) {
      toast('Message non envoyé : ' + (ex && ex.message ? ex.message : 'réessayez.'));
    } finally {
      input.disabled = false;
      input.focus();
    }
  });

  function subscribeMessages() {
    if (msgChannel) { sb.removeChannel(msgChannel); msgChannel = null; }
    refreshBadge();
    if (!currentUser) return;
    msgChannel = sb.channel('messages-' + currentUser.id)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: 'receiver_id=eq.' + currentUser.id },
        () => {
          if ($('inboxModal').classList.contains('active')) {
            markSeen();
            if ($('chatForm').style.display === 'flex') renderThread(); else renderInbox();
          } else {
            toast('💬 Nouveau message');
            refreshBadge();
          }
        })
      .subscribe();
  }

  /* ===== AUTHENTIFICATION ===== */
  let authInit = false;
  /* CAMERLINK PRO — espace artisan lié au compte connecté */
  const spaceMoney = value => Number(value || 0).toLocaleString('fr-FR') + ' FCFA';
  async function renderArtisanSpace() {
    const body = $('artisanSpaceBody');
    if (!body) return;
    if (!currentUser) { body.innerHTML = '<div class="state-msg">Connectez-vous pour accéder à votre espace artisan.</div>'; return; }
    body.innerHTML = '<div class="state-msg">Chargement de votre espace…</div>';
    const uid = currentUser.id;
    const shop = await fetchShop(uid);
    const mine = allListings.filter(ad => String(ad.user_id) === String(uid));
    const totalViews = mine.reduce((sum, ad) => sum + Number(ad.views || ad.vues || 0), 0);
    let receivedLikes = null;
    if (mine.length) {
      try {
        const likesResult = await withTimeout(sb.rpc('reel_likes_count', { p_annonce_ids: mine.map(ad => Number(ad.id)) }), 10000);
        if (!likesResult.error) receivedLikes = (likesResult.data || []).reduce((sum, row) => sum + Number(row.nb || 0), 0);
      } catch (_) { /* le tableau de bord reste utilisable si la statistique est indisponible */ }
    } else {
      receivedLikes = 0;
    }
    body.innerHTML = `
      <section class="cl-space-welcome">
        <div class="cl-space-avatar">${avatarHTML(shop, 58)}</div>
        <div class="cl-space-welcome-copy"><span class="cl-space-eyebrow">VOTRE VITRINE</span><h4>${esc(shop?.name || currentUser.user_metadata?.full_name || 'Mon activité')}</h4><p>${esc([shop?.type, shop?.city].filter(Boolean).join(' · ') || 'Complétez vos informations professionnelles')}</p></div>
        <button type="button" class="cl-space-share" id="cl-space-share">Partager ma page</button>
      </section>
      <div class="cl-space-stats">
        <article><span>Offres publiées</span><strong>${mine.length}</strong></article>
        <article><span>Vues enregistrées</span><strong>${totalViews}</strong></article>
        <article><span>J’aime reçus</span><strong>${receivedLikes === null ? '—' : receivedLikes}</strong><small>${receivedLikes === null ? 'Statistique indisponible' : 'Sur vos annonces et Reels'}</small></article>
      </div>
      <section class="cl-space-section">
        <div class="cl-space-section-head"><div><span class="cl-space-eyebrow">BOUTIQUE NUMÉRIQUE</span><h4>Informations professionnelles</h4></div><span class="cl-space-lock">🔒 Votre compte</span></div>
        <form id="cl-space-profile-form" class="cl-space-form">
          <div class="cl-space-photo-editor cl-space-wide"><div class="cl-space-photo-preview" id="cl-space-photo-preview">${shop?.logo_url ? '<img src="' + esc(shop.logo_url) + '" alt="Photo de profil artisan">': '<span>' + esc((shop?.name || currentUser.user_metadata?.full_name || 'A').trim().charAt(0).toUpperCase()) + '</span>'}</div><div><strong>Photo de profil professionnelle</strong><p class="cl-space-hint">Choisissez une photo nette de vous ou de votre logo (JPG, PNG ou WebP, 3 Mo maximum).</p><input id="cl-space-photo" name="profile_photo" type="file" accept="image/jpeg,image/png,image/webp"><button type="button" class="cl-space-photo-clear" id="cl-space-photo-clear">Retirer la nouvelle sélection</button></div></div>
          <label>Nom de l’activité<input name="name" maxlength="100" required value="${esc(shop?.name || '')}" placeholder="Ex. Atelier Eric"></label>
          <label>Métier / type d’activité<select name="type" required>${ESTABLISHMENT_TYPES.map(type => '<option value="' + esc(type) + '"' + (normalizeEstablishmentType(shop?.type) === type ? ' selected' : '') + '>' + esc(type) + '</option>').join('')}</select></label>
          <label>Ville<input name="city" maxlength="80" value="${esc(shop?.city || '')}" placeholder="Ex. Douala"></label>
          <label>Adresse ou quartier<input name="address" maxlength="180" value="${esc(shop?.address || '')}" placeholder="Ex. Bonamoussadi (pas obligatoire)"></label>
          <label>Contact professionnel<input name="contact" maxlength="30" type="tel" value="${esc(shop?.contact || '')}" placeholder="Téléphone / WhatsApp"></label>
          <label>Horaires<input name="hours" maxlength="120" value="${esc(shop?.hours || '')}" placeholder="Ex. Lun–sam, 8h–18h"></label>
          <label class="cl-space-wide">Présentation<textarea name="description" rows="3" maxlength="800" placeholder="Présentez votre activité, votre expérience et vos services…">${esc(shop?.description || '')}</textarea></label>
          <label class="cl-space-wide">Lien vidéo de présentation (URL HTTPS)<input name="video_url" type="url" maxlength="500" value="${esc(shop?.video_url || '')}" placeholder="https://…"></label>
          <label class="cl-space-wide">Description de la vidéo<input name="reel_desc" maxlength="180" value="${esc(shop?.reel_desc || '')}" placeholder="Une courte phrase pour votre Reel"></label>
          <p class="cl-space-hint cl-space-wide">Votre photo sera enregistrée dans votre fiche professionnelle et affichée sur votre vitrine publique.</p>
          <p id="cl-space-error" class="form-error cl-space-wide" role="status"></p>
          <button type="submit" class="btn-submit-modal cl-space-wide" id="cl-space-save">Enregistrer ma vitrine</button>
        </form>
      </section>
      <section class="cl-space-section">
        <div class="cl-space-section-head"><div><span class="cl-space-eyebrow">VOTRE CATALOGUE</span><h4>Mes offres (${mine.length})</h4></div><button type="button" class="cl-space-publish" id="cl-space-publish">＋ Ajouter une offre</button></div>
        <div class="cl-space-offers">${mine.length ? mine.map(ad => `<article class="cl-space-offer"><div class="cl-space-offer-thumb">${ad.image_url ? `<img src="${esc(ad.image_url)}" alt="" loading="lazy">` : '🏷️'}</div><div class="cl-space-offer-info"><strong>${esc(ad.title || 'Offre sans titre')}</strong><span>${spaceMoney(ad.price)}</span><small>${esc([ad.category, ad.city].filter(Boolean).join(' · '))}</small></div><button type="button" class="cl-space-open-offer" data-space-ad="${esc(ad.id)}">Voir</button><button type="button" class="cl-space-delete-offer" data-delete-ad="${esc(ad.id)}" aria-label="Supprimer cette publication" title="Supprimer cette publication" style="padding:8px 10px;border:1px solid #ef4444;border-radius:9px;background:rgba(239,68,68,.1);color:#ef4444;font-size:.82rem;font-weight:800;cursor:pointer;">🗑️ Supprimer</button></article>`).join('') : '<div class="cl-space-empty">Votre catalogue est vide. Publiez votre première offre pour être découvert par les clients.</div>'}</div>
      </section>
      <section class="cl-space-section cl-space-danger"><div class="cl-space-section-head"><div><span class="cl-space-eyebrow">ZONE DE GESTION</span><h4>Supprimer ma vitrine</h4></div></div><p>Cette action retire votre fiche professionnelle de CamerLink. Elle ne supprime pas votre compte de connexion ni vos publications.</p><button type="button" id="cl-space-delete-profile" style="padding:12px 16px;border:1px solid #ef4444;border-radius:10px;background:rgba(239,68,68,.12);color:#ef4444;font-weight:800;cursor:pointer;">🗑️ Supprimer mon profil professionnel</button><p id="cl-space-delete-error" class="form-error" role="status"></p></section><p class="cl-space-footer">Votre espace est lié à votre compte connecté. Seules les offres associées à votre identifiant de compte sont affichées ici.</p>`;
    body.querySelectorAll('[data-delete-ad]').forEach(button => button.addEventListener('click', async () => {
      const id = String(button.dataset.deleteAd || '');
      const ad = allListings.find(item => String(item.id) === id);
      if (!currentUser || currentUser.id !== uid || !ad || String(ad.user_id) !== String(uid)) {
        toast('Suppression refusée : cette publication ne vous appartient pas.'); return;
      }
      if (!window.confirm('Supprimer définitivement cette publication ? Cette action est irréversible.')) return;
      button.disabled = true; button.textContent = 'Suppression…';
      try {
        const result = await withTimeout(sb.from('annonces').delete().eq('id', ad.id).eq('user_id', uid).select('id'), 12000);
        if (result.error) throw result.error;
        if (!result.data || !result.data.length) throw new Error('Suppression refusée par les règles de sécurité Supabase.');

        // Nettoyage best-effort des médias de cette annonce, uniquement dans le dossier du propriétaire.
        // La suppression en base reste prioritaire ; un échec du stockage ne restaure pas l'annonce.
        const ownedStoragePath = (url, bucket) => {
          try {
            const parsed = new URL(String(url || ''));
            const marker = '/storage/v1/object/public/' + bucket + '/';
            const at = parsed.pathname.indexOf(marker);
            if (at < 0) return null;
            const path = decodeURIComponent(parsed.pathname.slice(at + marker.length));
            return path.startsWith(uid + '/') && !path.split('/').includes('..') ? path : null;
          } catch (e) { return null; }
        };
        const mediaToRemove = [
          [AD_BUCKET, ownedStoragePath(ad.image_url, AD_BUCKET)],
          [VIDEO_BUCKET, ownedStoragePath(ad.video_url, VIDEO_BUCKET)]
        ].filter((item) => item[1]);
        for (const [bucket, path] of mediaToRemove) {
          try {
            const cleanup = await withTimeout(sb.storage.from(bucket).remove([path]), 10000);
            if (cleanup.error) console.warn('[CamerLink] Média non supprimé du stockage :', bucket, cleanup.error.message);
          } catch (cleanupError) {
            console.warn('[CamerLink] Nettoyage du média échoué :', bucket, cleanupError);
          }
        }

        allListings = allListings.filter(item => String(item.id) !== id);
        delete videos[id]; delete likeCounts[id];
        if (String(detail.id) === id) closeModal('adDetailModal');
        renderListings(); renderReels(false); await renderArtisanSpace();
        toast('Publication supprimée.');
      } catch (error) {
        toast(/row-level security|permission|policy|42501/i.test(String(error.message || error))
          ? 'Suppression bloquée par Supabase. Vérifiez la migration de sécurité CamerLink.'
          : 'Impossible de supprimer cette publication. Réessayez.');
        button.disabled = false; button.textContent = '🗑️ Supprimer';
      }
    }));
    $('cl-space-delete-profile')?.addEventListener('click', async () => {
      const error = $('cl-space-delete-error');
      if (!currentUser || currentUser.id !== uid) { if (error) error.textContent = 'Session expirée. Reconnectez-vous.'; return; }
      if (!window.confirm('Supprimer votre fiche professionnelle de CamerLink ? Vos publications et votre compte de connexion seront conservés.')) return;
      const button = $('cl-space-delete-profile'); button.disabled = true; button.textContent = 'Suppression…';
      if (error) error.textContent = '';
      try {
        const result = await withTimeout(sb.from('etablissements').delete().eq('user_id', uid).select('user_id'), 12000);
        if (result.error) throw result.error;
        delete shopCache[uid];
        toast(result.data && result.data.length ? 'Profil professionnel supprimé.' : 'Aucune fiche professionnelle à supprimer.');
        await renderArtisanSpace();
      } catch (ex) {
        if (error) error.textContent = /row-level security|permission|policy|42501/i.test(String(ex.message || ex))
          ? 'Supabase bloque la suppression. Vérifiez la migration de sécurité CamerLink.'
          : 'Suppression impossible. Réessayez.';
        button.disabled = false; button.textContent = '🗑️ Supprimer mon profil professionnel';
      }
    });
    $('cl-space-share')?.addEventListener('click', () => shareLink(shop?.name || 'Mon artisan CamerLink', 'Découvrez ma vitrine sur CamerLink', '/artisan/' + encodeURIComponent(uid)));
    $('cl-space-publish')?.addEventListener('click', () => { closeModal('artisanSpaceModal'); $('pubBtn').click(); });
    body.querySelectorAll('[data-space-ad]').forEach(button => button.addEventListener('click', () => { closeModal('artisanSpaceModal'); openAdDetail(button.dataset.spaceAd); }));
    const photoInput = $('cl-space-photo');
    const photoPreview = $('cl-space-photo-preview');
    let selectedProfilePhoto = null;
    photoInput?.addEventListener('change', () => {
      const file = photoInput.files && photoInput.files[0];
      selectedProfilePhoto = null;
      if (!file) return;
      if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
        photoInput.value = '';
        const error = $('cl-space-error');
        if (error) error.textContent = 'Choisissez une image JPG, PNG ou WebP de 3 Mo maximum.';
        return;
      }
      selectedProfilePhoto = file;
      if (photoPreview) photoPreview.innerHTML = '<img src="' + URL.createObjectURL(file) + '" alt="Aperçu de la photo de profil">';
      const error = $('cl-space-error'); if (error) error.textContent = '';
    });
    $('cl-space-photo-clear')?.addEventListener('click', () => {
      selectedProfilePhoto = null;
      if (photoInput) photoInput.value = '';
      if (photoPreview) photoPreview.innerHTML = shop?.logo_url ? '<img src="' + esc(shop.logo_url) + '" alt="Photo de profil artisan">' : '<span>' + esc((shop?.name || currentUser.user_metadata?.full_name || 'A').trim().charAt(0).toUpperCase()) + '</span>';
    });
    $('cl-space-profile-form')?.addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget, button = $('cl-space-save'), error = $('cl-space-error');
      if (!currentUser || currentUser.id !== uid) { error.textContent = 'Votre session a changé. Rechargez la page et reconnectez-vous.'; return; }
      const data = Object.fromEntries(new FormData(form).entries());
      for (const key of Object.keys(data)) data[key] = String(data[key] || '').trim();
      if (!data.name) { error.textContent = 'Le nom de votre activité est obligatoire.'; return; }
      if (data.video_url && (!/^https:\/\//i.test(data.video_url))) { error.textContent = 'Le lien vidéo doit commencer par https://'; return; }
      button.disabled = true; button.textContent = 'Enregistrement…'; error.textContent = '';
      try {
        let profilePhotoUrl = shop?.logo_url || null;
        if (selectedProfilePhoto) {
          button.textContent = 'Envoi de la photo…';
          const ext = selectedProfilePhoto.type === 'image/png' ? 'png' : selectedProfilePhoto.type === 'image/webp' ? 'webp' : 'jpg';
          const path = uid + '/profile/avatar-' + Date.now() + '.' + ext;
          const upload = await withTimeout(sb.storage.from(AD_BUCKET).upload(path, selectedProfilePhoto, { upsert: false, contentType: selectedProfilePhoto.type, cacheControl: '3600' }), 15000);
          if (upload.error) throw upload.error;
          const publicUrl = sb.storage.from(AD_BUCKET).getPublicUrl(path);
          profilePhotoUrl = publicUrl?.data?.publicUrl || null;
          if (!profilePhotoUrl) throw new Error('URL publique de la photo indisponible.');
        }
        const payload = { user_id: uid, name: data.name, type: normalizeEstablishmentType(data.type), city: data.city, address: data.address, contact: data.contact, hours: data.hours, description: data.description, video_url: data.video_url || null, reel_desc: data.reel_desc, logo_url: profilePhotoUrl };
        const result = await withTimeout(sb.from('etablissements').upsert(payload, { onConflict: 'user_id' }).select('user_id,name,type,city,address,contact,hours,description,logo_url,verified,video_url,reel_desc').single(), 12000);
        if (result.error) throw result.error;
        shopCache[uid] = result.data;
        toast('Votre vitrine a été enregistrée.');
        renderArtisanSpace();
      } catch (ex) {
        error.textContent = /row-level security|permission|policy|42501/i.test(String(ex.message || ex))
          ? 'Enregistrement refusé par les règles de sécurité Supabase. Il faut autoriser chaque utilisateur à modifier uniquement sa propre fiche.'
          : 'Impossible d’enregistrer. Vérifiez la connexion et réessayez. (' + String(ex.message || 'erreur').slice(0,120) + ')';
        button.disabled = false; button.textContent = 'Réessayer';
      }
    });
  }
  $('artisanSpaceBtn')?.addEventListener('click', () => { if (!currentUser) { toast('Connectez-vous pour accéder à votre espace artisan et à votre catalogue.'); openModal('authModal'); return; } openModal('artisanSpaceModal'); renderArtisanSpace(); });

  sb.auth.onAuthStateChange((_, session) => {
    const prev = currentUser && currentUser.id;
    currentUser = session ? session.user : null;
    $('authBtn').textContent = currentUser ? 'Déconnexion' : 'Connexion';
    $('artisanSpaceBtn').style.display = ''; // Le bouton reste visible même déconnecté : il ouvre la connexion si nécessaire.
    $('claimBtn').style.display = currentUser ? '' : 'none';
    if (!authInit || prev !== (currentUser && currentUser.id)) {
      authInit = true;
      setTimeout(subscribeMessages, 0);
      setTimeout(syncFavorites, 0); // charge (ou vide) les favoris du compte
      if (currentUser && $('artisanSpaceModal')?.classList.contains('active')) setTimeout(renderArtisanSpace, 0);
    }
  });

  $('authBtn').addEventListener('click', async () => {
    if (currentUser) { await sb.auth.signOut(); toast('Déconnecté'); }
    else { openModal('authModal'); }
  });

  // Création de compte via la fonction "phone-signup" (sans SMS ni e-mail de confirmation)
  async function createAccount(phone, password) {
    const r = await withTimeout(fetch(`${SB_URL}/functions/v1/phone-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY },
      body: JSON.stringify({ phone, password })
    }), 12000);
    let body = {};
    try { body = await r.json(); } catch (e) { /* réponse vide */ }
    return { ok: r.ok && body.ok, code: body.error || null };
  }

  const phoneForm = $('phoneForm');
  if (phoneForm) {
    phoneForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = $('authPhone'), err = $('phoneError'), btn = $('phoneSubmit');
      const phone = normPhone(input.value);
      const password = $('phonePassword').value;
      err.textContent = '';
      if (!phone) { err.textContent = 'Numéro invalide. Exemple : 6 91 23 45 67'; return; }
      if (password.length < 6) { err.textContent = 'Mot de passe : 6 caractères minimum.'; return; }

      const email = phone.slice(1) + '@phone.camerlink.app';
      if (btn) btn.disabled = true;
      try {
        let { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
          const created = await createAccount(phone, password);
          if (!created.ok) {
            err.textContent = created.code === 'already_registered'
              ? 'Mot de passe incorrect.'
              : created.code === 'invalid_password'
                ? 'Mot de passe : 6 à 72 caractères.'
                : 'Connexion impossible pour le moment. Réessayez.';
            return;
          }
          ({ error } = await sb.auth.signInWithPassword({ email, password }));
          if (error) { err.textContent = 'Compte créé, mais connexion impossible. Réessayez.'; return; }
          toast('Compte créé, bienvenue !');
        } else {
          toast('Connexion réussie !');
        }
        closeModal('authModal');
        $('phonePassword').value = '';
      } catch (ex) {
        err.textContent = (ex && ex.message) || 'Erreur réseau. Réessayez.';
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  // ===== BOUTON « AJOUTER UNE VIDÉO » (zone Reels) =====
  const addVideoBtn = $('addVideoBtn');
  if (addVideoBtn) {
    addVideoBtn.addEventListener('click', () => {
      if (!currentUser) {
        toast('Connectez-vous pour ajouter une vidéo');
        openModal('authModal');
        return;
      }
      openModal('publishModal');
      const videoInput = $('adVideoFile');
      if (videoInput) videoInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast('Ajoutez une photo et votre vidéo, puis cliquez sur Publier.');
    });
  }

  $('pubBtn').addEventListener('click', () => {
    if (!currentUser) { toast('Connectez-vous pour publier'); openModal('authModal'); return; }
    openModal('publishModal');
  });

  /* ===== DÉTAILS D'UNE ANNONCE ET FICHE ARTISAN ===== */
  document.body.insertAdjacentHTML('beforeend', `
    <div id="adDetailModal" class="modal-overlay">
      <div class="modal-sheet" style="max-width:520px;">
        <div class="modal-header"><h3>Détails de l'annonce</h3><button type="button" class="modal-close" data-close="adDetailModal" aria-label="Fermer">×</button></div>
        <div id="adDetailBody"></div>
      </div>
    </div>
    <div id="artisanModal" class="modal-overlay cl-artisan-page-overlay">
      <div class="modal-sheet cl-artisan-page-sheet" style="max-width:1040px;">
        <div class="modal-header"><h3>Fiche artisan</h3><button type="button" class="modal-close" data-close="artisanModal" aria-label="Fermer">×</button></div>
        <div id="artisanBody"></div>
      </div>
    </div>`);

  const btnStyle = 'flex:1;min-width:120px;padding:10px;border-radius:8px;font-weight:700;font-size:0.85rem;text-align:center;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;';
  const softStyle = btnStyle + 'background:rgba(127,127,127,0.2);';

  async function fetchShop(uid) {
    if (!uid) return null;
    if (uid in shopCache) return shopCache[uid];
    try {
      const r = await withTimeout(sb.from('etablissements')
        .select('user_id, name, type, city, address, contact, hours, description, logo_url, verified, video_url, reel_desc')
        .eq('user_id', uid).limit(1));
      shopCache[uid] = (!r.error && r.data && r.data[0]) || null;
    } catch (e) { return null; }
    return shopCache[uid];
  }

  const avatarHTML = (shop, size) => {
    const name = (shop && shop.name) || 'A';
    const base = `width:${size}px;height:${size}px;border-radius:50%;flex-shrink:0;`;
    return shop && shop.logo_url
      ? `<img src="${esc(shop.logo_url)}" alt="" style="${base}object-fit:cover;">`
      : `<div style="${base}display:flex;align-items:center;justify-content:center;background:var(--color-bg);border:1px solid var(--color-border);font-weight:700;">${esc(name.charAt(0).toUpperCase())}</div>`;
  };

  function renderAdDetail() {
    const body = $('adDetailBody');
    const ad = allListings.find(a => String(a.id) === String(detail.id));
    if (!body || !ad) return;
    const shop = detail.shop;
    const isFav = window.getFavorites().includes(String(ad.id));
    const likes = likeCounts[ad.id] || 0;
    const views = ad.views || ad.vues || 0;
    const wa = waNumber(ad.contact);
    const vUrl = videos[ad.id];
    const rating = Number(ad.note_moyenne || 0).toFixed(1);
    const place = [ad.quartier, ad.city].filter(Boolean).join(', ');

    body.innerHTML = `
      ${ad.image_url ? `<img src="${esc(ad.image_url)}" alt="" style="width:100%;max-height:300px;object-fit:cover;border-radius:12px;margin-bottom:12px;">` : ''}
      ${vUrl ? `<video src="${esc(vUrl)}" controls playsinline preload="metadata" style="width:100%;max-height:300px;border-radius:12px;margin-bottom:12px;background:#000;"></video>` : ''}
      <span style="display:inline-block;padding:3px 10px;border-radius:999px;background:rgba(34,211,238,0.12);color:var(--a1);font-size:0.75rem;font-weight:600;">${esc(ad.category)}</span>
      <h3 style="font-size:1.25rem;margin:8px 0 4px;">${esc(ad.title)}</h3>
      <div style="font-size:1.3rem;font-weight:800;color:#10b981;margin-bottom:8px;">${Number(ad.price || 0).toLocaleString('fr-FR')} FCFA</div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;font-size:0.85rem;color:var(--color-text-muted);margin-bottom:12px;">
        <span>📍 ${esc(place || '—')}</span>
        <span>👁 ${views} vue(s)</span>
        <span>❤️ ${likes} j'aime</span>
        <span>⭐ ${rating} (${ad.nb_avis || 0} avis)</span>
        ${ad.created_at ? `<span>🕒 ${fmtDate(ad.created_at)}</span>` : ''}
      </div>
      <p style="white-space:pre-wrap;line-height:1.5;margin-bottom:14px;">${esc(ad.description || 'Pas de description.')}</p>

      ${ad.user_id ? `
      <button type="button" data-act="artisan" style="display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:10px;margin-bottom:12px;border-radius:12px;border:1px solid var(--color-border);cursor:pointer;">
        ${avatarHTML(shop, 40)}
        <span style="flex:1;min-width:0;">
          <strong>${esc((shop && shop.name) || 'Annonceur')}${shop && shop.verified ? ' ✔️' : ''}</strong>
          <small style="display:block;color:var(--color-text-muted);">${esc(shop ? [shop.type, shop.city].filter(Boolean).join(' · ') : 'Voir ses annonces')}</small>
        </span>
        <span style="color:var(--a1);font-weight:700;">Voir ›</span>
      </button>` : ''}

      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        <button type="button" data-act="fav" style="${softStyle}">${isFav ? '❤️ Aimé' : '🤍 J’aime'} (${likes})</button>
        ${ad.user_id ? `<button type="button" data-act="msg" style="${softStyle}">💬 Message</button><button type="button" data-act="quote" style="${softStyle}background:linear-gradient(100deg,#67e8f9,#a5b4fc);color:#07111b;border-color:transparent;">🧾 Demander un devis</button>` : ''}
        ${wa ? `<a href="https://api.whatsapp.com/send?phone=${esc(wa)}" target="_blank" rel="noopener" style="${btnStyle}background:#22C55E;color:#fff;">WhatsApp</a>
        <a href="tel:+${esc(wa)}" style="${btnStyle}background:#10B981;color:#fff;">Appel</a>` : ''}
        <button type="button" data-act="share" style="${softStyle}">📤 Partager</button>
        <button type="button" data-act="copy" style="${softStyle}">🔗 Copier le lien</button>
      </div>`;
  }

  async function openAdDetail(id) {
    const ad = allListings.find(a => String(a.id) === String(id));
    if (!ad) return;
    detail.id = String(ad.id);
    detail.shop = ad.user_id && shopCache[ad.user_id] ? shopCache[ad.user_id] : null;
    renderAdDetail();
    openModal('adDetailModal');
    setUrl('/annonce/' + ad.id, ad.title + ' · CamerLink');
    registerView(ad.id);
    if (ad.user_id && !detail.shop) {
      const shop = await fetchShop(ad.user_id);
      if (detail.id === String(ad.id)) { detail.shop = shop; renderAdDetail(); }
    }
  }

  $('adDetailBody').addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]');
    if (!act) return;
    const ad = allListings.find(a => String(a.id) === String(detail.id));
    if (!ad) return;
    if (act.dataset.act === 'fav') window.toggleFavorite(ad.id);
    else if (act.dataset.act === 'share') {
      shareLink(ad.title, `${ad.title} — ${Number(ad.price || 0).toLocaleString('fr-FR')} FCFA${ad.city ? ' à ' + ad.city : ''} sur CamerLink`, '/annonce/' + ad.id);
    }
    else if (act.dataset.act === 'copy') copyLink('/annonce/' + ad.id);
    else if (act.dataset.act === 'msg') { closeModal('adDetailModal'); window.openChat(ad.user_id, ad.id); }
    else if (act.dataset.act === 'quote') {
      closeModal('adDetailModal');
      window.openChat(ad.user_id, ad.id);
      const input = $('chatInput');
      if (input) input.value = `Bonjour, je souhaite demander un devis pour : ${ad.title}.\\n\\nTravail souhaité : \\nVille/quartier : ${[ad.quartier, ad.city].filter(Boolean).join(', ') || 'à préciser'}\\nBudget prévu : à préciser\\nDélai souhaité : à préciser\\n\\nPouvez-vous me donner une estimation et vos disponibilités ?`;
      if (input) input.focus();
      toast('Demande de devis préparée : vérifiez le message puis envoyez-le.');
    }
    else if (act.dataset.act === 'artisan') { closeModal('adDetailModal'); openArtisan(ad.user_id); }
  });

  async function openArtisan(uid) {
    if (!uid) return;
    const body = $('artisanBody');
    body.innerHTML = '<div class="state-msg">Chargement...</div>';
    openModal('artisanModal');
    setUrl('/artisan/' + uid, 'Artisan · CamerLink');
    try {
    profileCategory = 'all';
    const shop = await fetchShop(uid);
    if (shop && shop.name && $('artisanModal').classList.contains('active')) document.title = shop.name + ' · CamerLink';
    const ads = allListings.filter(a => String(a.user_id) === String(uid));
    const wa = waNumber(shop && shop.contact);
    const reel = shop && shop.video_url && /^https:\/\//i.test(shop.video_url) ? shop.video_url : null;
    const mine = currentUser && currentUser.id === uid;
    const gi = storyGroups.findIndex(g => g.uid === uid);
    const nStories = gi >= 0 ? storyGroups[gi].items.length : 0;

    body.innerHTML = `
  <div class="cl-artisan-profile">

    <div class="cl-artisan-cover">
      <div class="cl-profile-kicker">CAMERLINK • ARTISAN</div>
      <div class="cl-profile-identity">
        <div class="cl-profile-avatar">
          ${avatarHTML(shop, 76)}
        </div>
        <div class="cl-profile-name">
          <h3>${esc((shop && shop.name) || 'Artisan')}${shop && shop.verified ? ' <span class="cl-profile-verified-badge" title="Profil vérifié par CamerLink">✓ Vérifié</span>' : ''}</h3>
          <p>${esc(shop ? [shop.type, shop.city].filter(Boolean).join(' • ') : '')}</p>
        </div>
      </div>
      <div class="cl-profile-stats">
        <div><strong>${ads.length}</strong><span>Annonces</span></div>
        <div><strong>${nStories}</strong><span>Statuts</span></div>
        <div><strong>${reel ? '1' : '0'}</strong><span>Vidéo</span></div>
      </div>
      <div class="cl-profile-trust-row">
        ${shop && shop.verified ? '<span class="cl-profile-trust-chip is-verified">✓ Profil vérifié</span>' : '<span class="cl-profile-trust-chip">Profil professionnel</span>'}
        ${shop && shop.city ? '<span class="cl-profile-trust-chip">📍 ' + esc(shop.city) + '</span>' : ''}
        ${shop && shop.type ? '<span class="cl-profile-trust-chip">✦ ' + esc(shop.type) + '</span>' : ''}
      </div>
      <p class="cl-profile-cover-note">${shop && shop.verified ? 'Un profil vérifié par CamerLink : découvrez ses services et contactez-le en toute confiance.' : 'Découvrez les services, les réalisations et les offres de ce professionnel.'}</p>
    </div>

    ${shop && shop.description ? `
      <section class="cl-profile-section">
        <div class="cl-profile-label">À PROPOS</div>
        <p class="cl-profile-description">${esc(shop.description)}</p>
      </section>
    ` : ''}

    <section class="cl-profile-section cl-profile-details">
      ${shop && shop.address ? `<div>📍 <span>${esc(shop.address)}</span></div>` : ''}
      ${shop && shop.city ? `<div>🌍 <span>${esc(shop.city)}</span></div>` : ''}
      ${shop && shop.hours ? `<div>🕒 <span>${esc(shop.hours)}</span></div>` : ''}
      ${shop && shop.contact ? `<div>📞 <span>${esc(shop.contact)}</span></div>` : ''}
    </section>

    ${reel ? `
      <section class="cl-profile-section">
        <div class="cl-profile-label">VIDÉO DE L'ARTISAN</div>
        <video class="cl-profile-reel"
          src="${esc(reel)}"
          controls
          playsinline
          preload="metadata"></video>
        ${shop && shop.reel_desc ? `<p class="cl-profile-description">${esc(shop.reel_desc)}</p>` : ''}
      </section>
    ` : ''}

    ${nStories ? `
      <button type="button"
        class="cl-profile-button cl-primary"
        data-act="stories"
        data-gi="${gi}">
        ▶ Voir ses statuts (${nStories})
      </button>
    ` : ''}

    <section class="cl-profile-actions">
      ${wa ? `
        <a class="cl-profile-button cl-whatsapp"
          href="https://api.whatsapp.com/send?phone=${esc(wa)}"
          target="_blank" rel="noopener">
          WhatsApp
        </a>
        <a class="cl-profile-button cl-call"
          href="tel:+${esc(wa)}">
          Appeler
        </a>
      ` : ''}

      ${!mine ? `
        <button type="button"
          class="cl-profile-button cl-primary"
          data-act="msg">
          💬 Message
        </button>
      ` : ''}

      <button type="button"
        class="cl-profile-button"
        data-act="share">
        📤 Partager
      </button>

      <button type="button"
        class="cl-profile-button"
        data-act="copy">
        🔗 Copier le lien
      </button>
    </section>

    <section class="cl-profile-section cl-profile-catalogue">
      <div class="cl-profile-catalogue-head">
        <div>
          <div class="cl-profile-label">CATALOGUE PROFESSIONNEL</div>
          <h4 class="cl-profile-catalogue-title">Les offres de cet artisan <span>${ads.length}</span></h4>
        </div>
        <label class="cl-profile-sort-label">Trier
          <select class="cl-profile-sort" id="cl-profile-sort">
            <option value="recent">Récentes</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="name">Nom A–Z</option>
          </select>
        </label>
      </div>
      ${ads.length ? `
        <label class="cl-profile-search-label" for="cl-profile-search">Rechercher dans son catalogue</label>
        <input id="cl-profile-search" class="cl-profile-search" type="search" placeholder="Ex. réparation, coiffure, livraison…" autocomplete="off">
        <div class="cl-profile-category-list" id="cl-profile-categories" aria-label="Filtrer par catégorie">
          <button type="button" class="is-active" data-profile-category="all">Tout</button>
          ${[...new Set(ads.map(a => String(a.category || '').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr')).map(category => `<button type="button" data-profile-category="${esc(category)}">${esc(category)}</button>`).join('')}
        </div>
      ` : ''}
      <div class="cl-profile-grid" id="cl-profile-grid">
        ${ads.length ? ads.map(a => `
          <button type="button"
            class="cl-profile-listing"
            data-ad="${esc(a.id)}"
            data-title="${esc(a.title || '')}"
            data-category="${esc(a.category || '')}"
            data-price="${Number(a.price || 0)}"
            data-created="${esc(a.created_at || '')}">
            ${a.image_url ? `
              <img src="${esc(a.image_url)}" alt="${esc(a.title || 'Photo de l’offre')}" loading="lazy">
            ` : `<div class="cl-profile-no-image">CAMERLINK</div>`}
            <span class="cl-profile-listing-info">
              <strong>${esc(a.title || 'Annonce')}</strong>
              <small>${Number(a.price || 0).toLocaleString('fr-FR')} FCFA</small>
              <em>${esc(a.category || 'Service')}</em>
            </span>
          </button>
        `).join('') : `
          <div class="state-msg">Ce professionnel prépare encore son catalogue. Revenez bientôt ou contactez-le directement.</div>
        `}
      </div>
      ${ads.length ? '<p id="cl-profile-empty" class="state-msg" hidden>Aucune offre ne correspond à votre recherche.</p>' : ''}
    </section>

  </div>
`;
    body.dataset.uid = uid;
    } catch (err) {
      console.error(err);
      body.innerHTML = '<div class="state-msg">Impossible d’afficher la fiche. Réessayez.</div>';
    }
  }

  // Catalogue interactif : recherche, filtres et tri sans requête supplémentaire ni modification des annonces.
  let profileCategory = 'all';
  const filterProfileCatalog = () => {
    const grid = $('cl-profile-grid');
    if (!grid) return;
    const query = String($('cl-profile-search')?.value || '').trim().toLocaleLowerCase('fr');
    const sort = $('cl-profile-sort')?.value || 'recent';
    const cards = [...grid.querySelectorAll('[data-ad]')];
    const visible = cards.filter(card => {
      const matchesQuery = !query || (card.dataset.title + ' ' + card.dataset.category).toLocaleLowerCase('fr').includes(query);
      const matchesCategory = profileCategory === 'all' || card.dataset.category === profileCategory;
      card.hidden = !(matchesQuery && matchesCategory);
      return !card.hidden;
    });
    visible.sort((a, b) => {
      if (sort === 'price-asc') return Number(a.dataset.price) - Number(b.dataset.price);
      if (sort === 'price-desc') return Number(b.dataset.price) - Number(a.dataset.price);
      if (sort === 'name') return a.dataset.title.localeCompare(b.dataset.title, 'fr');
      return String(b.dataset.created || '').localeCompare(String(a.dataset.created || ''));
    }).forEach(card => grid.appendChild(card));
    const empty = $('cl-profile-empty');
    if (empty) empty.hidden = visible.length > 0;
  };
  $('artisanBody').addEventListener('input', (e) => {
    if (e.target.id === 'cl-profile-search') filterProfileCatalog();
  });
  $('artisanBody').addEventListener('change', (e) => {
    if (e.target.id === 'cl-profile-sort') filterProfileCatalog();
  });
  $('artisanBody').addEventListener('click', (e) => {
    const category = e.target.closest('[data-profile-category]');
    if (category) {
      profileCategory = category.dataset.profileCategory || 'all';
      $('cl-profile-categories')?.querySelectorAll('[data-profile-category]').forEach(button => {
        button.classList.toggle('is-active', button === category);
        button.setAttribute('aria-pressed', button === category ? 'true' : 'false');
      });
      filterProfileCatalog();
      return;
    }
    const st = e.target.closest('[data-act="stories"]');
    if (st) { closeModal('artisanModal'); openViewer(Number(st.dataset.gi)); return; }
    const ad = e.target.closest('[data-ad]');
    if (ad) { closeModal('artisanModal'); openAdDetail(ad.dataset.ad); return; }
    const uid = $('artisanBody').dataset.uid;
    if (e.target.closest('[data-act="share"]')) {
      const shop = shopCache[uid];
      const name = (shop && shop.name) || 'Artisan';
      shareLink(name, `${name} sur CamerLink`, '/artisan/' + uid);
      return;
    }
    if (e.target.closest('[data-act="copy"]')) { copyLink('/artisan/' + uid); return; }
    if (e.target.closest('[data-act="msg"]')) {
      closeModal('artisanModal');
      window.openChat(uid, null);
    }
  });

  // Ouvre directement la page demandée par le lien (/annonce/<id> ou /artisan/<id>)
  async function openRoute() {
    const m = location.pathname.match(/^\/(annonce|artisan)\/([A-Za-z0-9-]+)\/?$/);
    if (!m) return;
    if (m[1] === 'annonce') {
      if (!/^\d{1,12}$/.test(m[2])) { resetUrl(); return; }
      if (!allListings.some(a => String(a.id) === m[2])) {
        try { // la liste n'a pas chargé ou l'annonce est ancienne : on la demande seule
          const r = await withTimeout(sb.from('annonces').select('*').eq('id', Number(m[2])).limit(1));
          if (!r.error && r.data && r.data[0]) { allListings.push(r.data[0]); renderListings(); }
        } catch (e) { /* ignoré */ }
      }
      if (allListings.some(a => String(a.id) === m[2])) openAdDetail(m[2]);
      else { toast('Cette annonce n’existe plus.'); resetUrl(); }
    } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(m[2])) {
      openArtisan(m[2].toLowerCase());
    } else { resetUrl(); }
  }

  /* ===== RÉCUPÉRATION DES ANNONCES PAR NUMÉRO (validation par l'administrateur) ===== */
  const last9 = (v) => String(v || '').replace(/\D/g, '').slice(-9);
  const CLAIM_LABEL = { pending: '⏳ En attente de validation', approved: '✅ Acceptée', rejected: '❌ Refusée' };

  function updateClaimMatch() {
    const el = $('claimMatch'); if (!el) return;
    const n = normPhone($('claimPhone').value);
    if (!n) { el.textContent = ''; return; }
    const k = last9(n);
    const ads = allListings.filter(a => last9(a.contact) === k).length;
    el.textContent = ads
      ? `📌 ${ads} annonce${ads > 1 ? 's' : ''} utilise${ads > 1 ? 'nt' : ''} ce numéro.`
      : 'Aucune annonce trouvée avec ce numéro pour le moment.';
  }

  async function loadMyClaims() {
    const box = $('claimMine'); if (!box || !currentUser) return;
    try {
      const { data } = await withTimeout(
        sb.from('claim_requests').select('phone,status,created_at').order('created_at', { ascending: false }).limit(5), FETCH_TIMEOUT);
      box.innerHTML = (data && data.length)
        ? '<strong>Mes demandes</strong>' + data.map(c =>
            `<div style="padding:6px 0;border-bottom:1px solid var(--color-border);">${esc(c.phone)} · ${CLAIM_LABEL[c.status] || esc(c.status)} <small>(${esc(fmtDate(c.created_at))})</small></div>`).join('')
        : '';
    } catch (e) { box.innerHTML = ''; }
  }

  async function loadAdminClaims() {
    const box = $('claimAdmin'); if (!box) return;
    box.innerHTML = '';
    if (!currentUser) return;
    try {
      const { data, error } = await withTimeout(sb.rpc('admin_list_claims'), FETCH_TIMEOUT);
      if (error || !Array.isArray(data)) return; // pas administrateur
      const pend = data.filter(c => c.status === 'pending');
      box.innerHTML = `<h4 style="margin-bottom:8px;">🛡️ Demandes à valider (${pend.length})</h4>` +
        (pend.length ? pend.map(c => `
          <div style="border:1px solid var(--color-border);border-radius:12px;padding:10px;margin-bottom:8px;">
            <div><strong>${esc(c.requested_phone)}</strong> · compte ${esc(c.requester_login)}</div>
            <div style="font-size:.82rem;opacity:.8;">${c.matching_count} annonce(s) : ${esc((c.matching_titles || []).slice(0, 4).join(', '))}</div>
            ${c.note ? `<div style="font-size:.82rem;font-style:italic;">« ${esc(c.note)} »</div>` : ''}
            <div style="display:flex;gap:8px;margin-top:8px;">
              <button type="button" data-claim="approve" data-id="${esc(c.id)}" class="btn-submit-modal" style="flex:1;">Accepter</button>
              <button type="button" data-claim="reject" data-id="${esc(c.id)}" class="btn-submit-modal" style="flex:1;background:#666;">Refuser</button>
            </div>
          </div>`).join('') : '<p style="opacity:.7;">Aucune demande en attente.</p>');
    } catch (e) { box.innerHTML = ''; }
  }

  $('claimBtn').addEventListener('click', () => {
    if (!currentUser) { openModal('authModal'); return; }
    const login = String((currentUser.email || '').split('@')[0]).replace(/\D/g, '');
    if (!$('claimPhone').value && login) $('claimPhone').value = '+' + login;
    $('claimError').textContent = '';
    updateClaimMatch();
    openModal('claimModal');
    loadMyClaims();
    loadAdminClaims();
  });
  $('claimPhone').addEventListener('input', updateClaimMatch);

  $('claimForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('claimError'), btn = $('claimSubmit');
    err.textContent = '';
    const phone = normPhone($('claimPhone').value);
    if (!phone) { err.textContent = 'Numéro invalide. Exemple : 6 91 23 45 67'; return; }
    if (!currentUser) { err.textContent = 'Connectez-vous d’abord.'; return; }
    btn.disabled = true;
    try {
      const { error } = await withTimeout(
        sb.from('claim_requests').insert({ phone, note: $('claimNote').value.trim() || null }), FETCH_TIMEOUT);
      if (error) throw error;
      $('claimNote').value = '';
      toast('Demande envoyée. Vous serez prévenu après validation.');
      loadMyClaims();
    } catch (ex) {
      err.textContent = 'Envoi impossible pour le moment. Réessayez.';
    } finally { btn.disabled = false; }
  });

  $('claimAdmin').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-claim]'); if (!b) return;
    b.disabled = true;
    try {
      const fn = b.dataset.claim === 'approve' ? 'admin_approve_claim' : 'admin_reject_claim';
      const { data, error } = await withTimeout(sb.rpc(fn, { request_id: b.dataset.id }), FETCH_TIMEOUT);
      if (error) throw error;
      toast(b.dataset.claim === 'approve' ? `Transfert effectué (${data} élément(s)).` : 'Demande refusée.');
      await loadListings();
      loadAdminClaims();
    } catch (ex) { toast('Action impossible.'); b.disabled = false; }
  });

  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeModal(b.dataset.close)));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    window.closeStoryViewer();
    window.closeVideoPlayer();
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    resetUrl();
  });

  loadData();
})();
