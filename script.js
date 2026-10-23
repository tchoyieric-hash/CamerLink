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
  // Villes principales : les 10 chefs-lieux de région du Cameroun, plus Kribi.
  // "value" est enregistré dans l'annonce ; "label" indique la région dans les listes.
  const CITIES = [
    { value: 'Yaoundé', label: 'Yaoundé (Centre)' },
    { value: 'Douala', label: 'Douala (Littoral)' },
    { value: 'Bafoussam', label: 'Bafoussam (Ouest)' },
    { value: 'Bamenda', label: 'Bamenda (Nord-Ouest)' },
    { value: 'Buea', label: 'Buea (Sud-Ouest)' },
    { value: 'Limbe', label: 'Limbe (Sud-Ouest)' },
    { value: 'Kumba', label: 'Kumba (Sud-Ouest)' },
    { value: 'Tiko', label: 'Tiko (Sud-Ouest)' },
    { value: 'Garoua', label: 'Garoua (Nord)' },
    { value: 'Maroua', label: 'Maroua (Extrême-Nord)' },
    { value: 'Ngaoundéré', label: 'Ngaoundéré (Adamaoua)' },
    { value: 'Meiganga', label: 'Meiganga (Adamaoua)' },
    { value: 'Bertoua', label: 'Bertoua (Est)' },
    { value: 'Abong-Mbang', label: 'Abong-Mbang (Est)' },
    { value: 'Ebolowa', label: 'Ebolowa (Sud)' },
    { value: 'Sangmélima', label: 'Sangmélima (Sud)' },
    { value: 'Kribi', label: 'Kribi (Sud)' },
    { value: 'Edéa', label: 'Edéa (Littoral)' },
    { value: 'Nkongsamba', label: 'Nkongsamba (Littoral)' },
    { value: 'Foumban', label: 'Foumban (Ouest)' },
    { value: 'Dschang', label: 'Dschang (Ouest)' },
    { value: 'Mbouda', label: 'Mbouda (Ouest)' },
    { value: 'Garoua-Boulaï', label: 'Garoua-Boulaï (Est)' }
  ];

  // Suggestions de quartiers (le vendeur peut aussi écrire librement un autre quartier)
  const QUARTIERS = {
    'Yaoundé': ['Bastos', 'Biyem-Assi', 'Briqueterie', 'Efoulan', 'Ekounou', 'Elig-Essono', 'Emana', 'Essos', 'Etoudi', 'Melen', 'Mendong', 'Messa', 'Mfandena', 'Mimboman', 'Mokolo', 'Mvan', 'Mvog-Ada', 'Mvog-Mbi', 'Ngousso', 'Nkolbisson', 'Nlongkak', 'Nsimeyong', 'Obili', 'Odza', 'Omnisports', 'Simbock', 'Tsinga'],
    'Douala': ['Akwa', 'Bali', 'Bassa', 'Bepanda', 'Bonabéri', 'Bonamoussadi', 'Bonanjo', 'Bonapriso', 'Cité des Palmiers', 'Deido', 'Japoma', 'Kotto', 'Logbessou', 'Logpom', 'Makepe', 'Ndokoti', 'New Bell', 'Nyalla', 'PK8', 'PK14', 'Yassa'],
    'Bafoussam': ['Banengo', 'Djeleng', 'Famla', 'Kamkop', 'Tamdja'],
    'Bamenda': ['Commercial Avenue', 'Mankon', 'Nkwen', 'Ntarikon', 'Up Station'],
    'Buea': ['Bonduma', 'Great Soppo', 'Molyko', 'Muea'],
    'Limbe': ['Bota', 'Down Beach', 'Mile 1', 'Mile 2', 'Mile 4', 'New Town', 'Sapa Road'],
    'Kumba': ['Fiango', 'Kosala', 'Mabanda', 'Mbonge Road', 'Three Corners'],
    'Tiko': ['Likomba', 'Mutengene', 'Tiko Town'],
    'Garoua': ['Camp Chinois', 'Laindé', 'Poumpoumré', 'Roumdé Adjia'],
    'Maroua': ['Domayo', 'Doualaré', 'Founangué', 'Palar'],
    'Ngaoundéré': ['Baladji', 'Dang', 'Joli Soir', 'Sabongari'],
    'Bertoua': ['Enia', 'Kano', 'Mokolo', 'Yadia'],
    'Ebolowa': ['Angalé', 'Biwong', 'New-Bell'],
    'Kribi': ['Centre-ville', 'Dombe', 'Londji', 'Mboa Manga', 'Talla'],
    'Edéa': ['Centre-ville', 'Delangue', 'Pongo'],
    'Nkongsamba': ['Ekangté', 'Ekel-Kouma', 'Quartier 1', 'Quartier 2'],
    'Foumban': ['Njinka', 'Nkoung-Khi', 'Quartier administratif'],
    'Dschang': ['Centre-ville', 'Foto', 'Foreke', 'Tchouale'],
    'Mbouda': ['Bamessingue', 'Centre-ville', 'Koptchou'],
    'Sangmélima': ['Centre-ville', 'Meyomessala Road'],
    'Meiganga': ['Centre-ville', 'Sabongari'],
    'Abong-Mbang': ['Centre-ville'],
    'Garoua-Boulaï': ['Centre-ville']
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
  const isVideo = (url) => /\.(mp4|webm|mov)(\?|$)/i.test(String(url || ''));
  const fmtDate = (d) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  const sb = window.supabase.createClient(SB_URL, SB_KEY);

  let allListings = [], videos = {}, currentUser = null, currentCategory = '', favOnly = false, sortMode = 'recent';
  let nearbyPosition = null, nearbyMode = false;
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
    // Les quartiers prédéfinis sont proposés dès qu'une ville est choisie,
    // même si aucune annonce de cette ville n'a encore été publiée.
    [...(QUARTIERS[city] || []), ...allListings.filter(a => a.quartier && (!city || a.city === city)).map(a => a.quartier)]
      .forEach(q => { const k = qKey(q); if (k && !m.has(k)) m.set(k, q); });
    if (m.size === 0 && !city) { sel.style.display = 'none'; sel.innerHTML = ''; currentQuartier = ''; return; }
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
        '<small class="form-hint">Aide les acheteurs à vous trouver. La position GPS est facultative et arrondie pour rester approximative.</small>';
      const holder = adCity.closest('.form-group');
      if (holder) holder.insertAdjacentElement('afterend', grp);
      const gpsBtn = document.createElement('button');
      gpsBtn.id = 'adGpsLocationBtn';
      gpsBtn.type = 'button';
      gpsBtn.className = 'form-sheet-el';
      gpsBtn.style.cssText = 'width:100%;min-height:42px;margin-top:8px;border:1px solid rgba(48,210,230,.45);border-radius:12px;background:rgba(48,210,230,.08);color:inherit;font-weight:700;cursor:pointer;';
      gpsBtn.textContent = '📍 Ajouter une position approximative (facultatif)';
      gpsBtn.setAttribute('aria-label', 'Enregistrer la position GPS de cette annonce');
      gpsBtn.addEventListener('click', () => {
        if (!navigator.geolocation) { toast('La localisation GPS n’est pas disponible sur cet appareil.'); return; }
        gpsBtn.disabled = true;
        gpsBtn.textContent = 'Localisation…';
        navigator.geolocation.getCurrentPosition(pos => {
          adGpsPosition = { lat: Math.round(pos.coords.latitude * 1000) / 1000, lng: Math.round(pos.coords.longitude * 1000) / 1000 };
          gpsBtn.disabled = false;
          gpsBtn.textContent = '✓ Position ajoutée à cette annonce';
          toast('Position approximative enregistrée. Elle servira à classer les annonces proches.');
        }, () => {
          adGpsPosition = null;
          gpsBtn.disabled = false;
          gpsBtn.textContent = '📍 Réessayer d’ajouter ma position';
          toast('Autorise la localisation ou publie sans GPS : la ville et le quartier restent disponibles.');
        }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
      });
      grp.appendChild(gpsBtn);
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
  $('sortFilter')?.addEventListener('change', () => { sortMode = $('sortFilter').value || 'recent'; renderListings(); });

  /* ===== Découverte locale : résultats proches, uniquement avec accord GPS ===== */
  (function mountNearbyDiscovery() {
    const bar = $('search-filter-bar') || $('priceFilter')?.parentElement;
    if (!bar || $('nearbyBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'nearbyBtn';
    btn.type = 'button';
    btn.className = 'form-el';
    btn.textContent = '📍 Près de moi';
    btn.setAttribute('aria-label', 'Trouver des annonces près de moi');
    btn.style.cssText = 'grid-column:1/-1;width:100%;min-height:44px;border-radius:14px;border:1px solid rgba(48,210,230,.45);background:rgba(48,210,230,.10);color:inherit;font-weight:700;cursor:pointer;';
    const pro = document.createElement('button');
    pro.id = 'findProBtn';
    pro.type = 'button';
    pro.className = 'form-el';
    pro.textContent = '🛠️ Trouve-moi un pro';
    pro.style.cssText = 'grid-column:1/-1;width:100%;min-height:44px;border-radius:14px;border:1px solid rgba(124,92,255,.45);background:rgba(124,92,255,.12);color:inherit;font-weight:700;cursor:pointer;';
    bar.appendChild(pro);
    bar.appendChild(btn);
    pro.addEventListener('click', () => {
      const search = $('searchInput');
      if (search) { search.value = ''; search.placeholder = 'Ex. plombier, coiffeur, électricien…'; search.focus(); }
      currentCategory = 'Services';
      document.querySelectorAll('.cat-chip').forEach(el => { el.classList.toggle('active', el.dataset.cat === 'Services'); });
      renderListings();
      const main = $('listings-grid');
      if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast('Recherche de professionnels : saisis le métier ou le service recherché.');
    });
    btn.addEventListener('click', () => {
      if (nearbyMode) {
        nearbyMode = false; nearbyPosition = null;
        btn.textContent = '📍 Près de moi';
        renderListings();
        return;
      }
      if (!navigator.geolocation) { toast('La localisation n’est pas disponible sur cet appareil.'); return; }
      btn.disabled = true; btn.textContent = 'Localisation…';
      navigator.geolocation.getCurrentPosition(pos => {
        nearbyPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        nearbyMode = true; btn.disabled = false; btn.textContent = '✓ Annonces proches · Désactiver';
        renderListings();
      }, () => {
        btn.disabled = false; btn.textContent = '📍 Près de moi';
        toast('Autorise la localisation pour chercher les annonces proches, ou continue avec la ville et le quartier.');
      }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
    });
  })();

  function distanceKm(a, b) {
    if (!nearbyPosition || a.lat == null || a.lng == null || !Number.isFinite(Number(a.lat)) || !Number.isFinite(Number(a.lng))) return Infinity;
    const rad = n => n * Math.PI / 180;
    const dLat = rad(Number(a.lat) - nearbyPosition.lat), dLng = rad(Number(a.lng) - nearbyPosition.lng);
    const x = Math.sin(dLat/2)**2 + Math.cos(rad(nearbyPosition.lat))*Math.cos(rad(Number(a.lat)))*Math.sin(dLng/2)**2;
    return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
  }

  /* ===== FAVORIS ===== */
  window.getFavorites = function () {
    try { return JSON.parse(localStorage.getItem('camerlink_favorites')) || []; } catch (e) { return []; }
  };

  function setFavs(arr) {
    try { localStorage.setItem('camerlink_favorites', JSON.stringify(arr)); } catch (e) { /* stockage indisponible */ }
    $('favCount').textContent = arr.length;
  }

  function updateReelLikeUI(id) {
    const count = String(likeCounts[id] || 0);
    const liked = window.getFavorites().includes(String(id));
    document.querySelectorAll('.reel-card[data-reel="' + String(id).replace(/"/g, '\\"') + '"] [data-reel-like]').forEach(button => {
      const heart = button.querySelector('span');
      const number = button.querySelector('small');
      if (heart) heart.textContent = liked ? '♥' : '♡';
      if (number) number.textContent = count;
      button.setAttribute('aria-pressed', liked ? 'true' : 'false');
      button.setAttribute('aria-label', liked ? 'Retirer le j’aime' : 'J’aime cette publication');
    });
  }

  function bumpLike(id, d) {
    likeCounts[id] = Math.max(0, (likeCounts[id] || 0) + d);
    updateReelLikeUI(id);
  }

  function refreshOpenDetail() {
    if ($('adDetailModal') && $('adDetailModal').classList.contains('active')) renderAdDetail();
  }

  // "J'aime" : enregistré dans la table favoris (compte obligatoire), compteur public par annonce
  window.toggleFavorite = async function (id) {
    id = String(id);
    if (!currentUser) { toast('Connectez-vous pour aimer une annonce'); openModal('authModal'); return; }
    if (likeBusy.has(id)) return;
    likeBusy.add(id);

    const before = window.getFavorites();
    const had = before.includes(id);
    setFavs(had ? before.filter(x => x !== id) : [...before, id]);
    bumpLike(id, had ? -1 : 1);
    renderListings(); refreshOpenDetail();

    try {
      const r = had
        ? await sb.from('favoris').delete().eq('annonce_id', Number(id)).eq('user_id', currentUser.id)
        : await sb.from('favoris').insert({ annonce_id: Number(id) });
      if (r.error) {
        if (r.error.code === '23505') { loadLikeCounts(); } // déjà aimé
        else throw r.error;
      }
      toast(had ? 'Retiré de vos favoris' : 'Ajouté à vos favoris');
    } catch (ex) {
      const now = window.getFavorites();
      setFavs(had ? [...now, id] : now.filter(x => x !== id));
      bumpLike(id, had ? 1 : -1);
      renderListings(); refreshOpenDetail();
      toast('Action impossible : ' + (ex && ex.message ? ex.message : 'réessayez.'));
    } finally {
      likeBusy.delete(id);
    }
  };
  $('favCount').textContent = window.getFavorites().length;

  async function syncFavorites() {
    if (!currentUser) { setFavs([]); renderListings(); return; }
    try {
      const { data, error } = await withTimeout(sb.from('favoris').select('annonce_id'));
      if (error) throw error;
      setFavs((data || []).map(r => String(r.annonce_id)));
      renderListings(); refreshOpenDetail();
    } catch (e) { /* on garde le cache local */ }
  }

  async function loadLikeCounts() {
    try {
      const { data, error } = await withTimeout(sb.rpc('get_like_counts'));
      if (error) return;
      likeCounts = {};
      (data || []).forEach(r => { likeCounts[r.annonce_id] = Number(r.likes) || 0; });
      document.querySelectorAll('.reel-card[data-reel]').forEach(card => updateReelLikeUI(card.dataset.reel));
      renderListings(); refreshOpenDetail();
    } catch (e) { /* silencieux */ }
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
    try {
      const res = await withTimeout(sb.from('annonces').select('*').order('created_at', { ascending: false }));
      if (res.error) failed = true;
      else allListings = res.data || [];
    } catch (err) { failed = true; /* on garde la liste actuelle */ }

    videos = {};
    allListings.forEach(a => {
      if (a.video_url && /^https:\/\//i.test(a.video_url)) videos[a.id] = a.video_url;
    });
    refreshQuartierFilter();
    fillQuartierSuggestions();
    renderListings();
    renderReels(failed);
  }

  async function loadData() {
    await loadListings();
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
/* Reels rebuilt from the Oct 20 baseline: full-screen vertical feed */
#reels-section:not(.shell-off) {
  position: fixed !important; inset: var(--camerlink-topbar-height, 0px) 0 0 !important;
  z-index: 20 !important; width: 100% !important; max-width: none !important; min-width: 0 !important;
  height: auto !important; margin: 0 !important; padding: 0 !important; border: 0 !important;
  border-radius: 0 !important; overflow: hidden !important; box-shadow: none !important; background: #050505 !important;
}
#reels-section:not(.shell-off) .reels-heading { display: none !important; }
#reels-section:not(.shell-off) #reels-feed {
  display: flex !important; flex-direction: column !important; flex-wrap: nowrap !important;
  align-items: stretch !important; justify-content: flex-start !important; gap: 0 !important;
  position: absolute !important; inset: 0 !important; width: 100% !important; max-width: none !important;
  min-width: 0 !important; height: 100% !important; max-height: none !important;
  padding: 0 !important; margin: 0 !important; overflow-x: hidden !important; overflow-y: auto !important;
  scroll-snap-type: y mandatory !important; overscroll-behavior-y: contain !important;
  scrollbar-width: none !important; background: #050505 !important;
}
#reels-section:not(.shell-off) #reels-feed > .reel-card {
  position: relative !important; display: block !important; flex: 0 0 100% !important;
  width: 100% !important; max-width: none !important; min-width: 0 !important;
  height: 100% !important; min-height: 100% !important; max-height: none !important;
  margin: 0 !important; padding: 0 !important; border: 0 !important; border-radius: 0 !important;
  scroll-snap-align: start !important; scroll-snap-stop: always !important;
  overflow: hidden !important; background: #050505 !important; transform: none !important;
}
#reels-section:not(.shell-off) #reels-feed .cl-post-media {
  position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important;
  max-height: none !important; border-radius: 0 !important; overflow: hidden !important; background: #050505 !important;
}
#reels-section:not(.shell-off) #reels-feed .cl-post-media > video,
#reels-section:not(.shell-off) #reels-feed .cl-post-media > img {
  position: absolute !important; inset: 0 !important; display: block !important;
  width: 100% !important; height: 100% !important; max-width: none !important; max-height: none !important;
  object-fit: cover !important; background: #050505 !important;
}
#reels-section:not(.shell-off) #reels-feed .cl-post-location { position: absolute !important; top: 12px !important; left: 12px !important; right: 64px !important; z-index: 6 !important; }
#reels-section:not(.shell-off) #reels-feed .cl-post-actions { position: absolute !important; right: 10px !important; bottom: 118px !important; z-index: 7 !important; }
#reels-section:not(.shell-off) #reels-feed .cl-post-caption { position: absolute !important; left: 14px !important; right: 68px !important; bottom: 64px !important; z-index: 6 !important; }
#reels-section:not(.shell-off) #reels-feed .cl-comments-float { position: absolute !important; left: 12px !important; right: 68px !important; bottom: 12px !important; z-index: 8 !important; }
#reels-section:not(.shell-off) #reels-feed .cl-reel-exit { position: absolute !important; top: 10px !important; left: 10px !important; z-index: 10 !important; }
#reels-section:not(.shell-off) #reels-feed .cl-reel-fullscreen { position: absolute !important; top: 10px !important; right: 10px !important; z-index: 10 !important; }
#reels-section:not(.shell-off) #reels-feed .cl-post-footer,
#reels-section:not(.shell-off) #reels-feed .cl-comments-preview,
#reels-section:not(.shell-off) #reels-feed .cl-post-open { display: none !important; }
#reels-section:not(.shell-off) #reels-feed .reels-placeholder,
#reels-section:not(.shell-off) #reels-feed .reels-empty {
  box-sizing: border-box !important; width: 100% !important; min-width: 0 !important;
  min-height: 100% !important; display: flex !important; align-items: center !important;
  justify-content: center !important; padding: 24px !important; background: #080808 !important;
}
@media (min-width: 701px) {
  #reels-section:not(.shell-off) { left: max(0px, calc((100vw - 560px) / 2)) !important; right: auto !important; width: min(100vw, 560px) !important; }
}
@media (prefers-reduced-motion: reduce) {
  #reels-section:not(.shell-off) #reels-feed { scroll-behavior: auto !important; }
}
`;

    document.head.appendChild(st);
  })();

  /* ===== COMMENTAIRES REELS : seuls les commentaires approuvés sont publics ===== */
  const reelCommentsCache = {};
  async function loadApprovedReelComments(id) {
    id = String(id);
    if (reelCommentsCache[id]) return reelCommentsCache[id];
    try {
      const { data, error } = await withTimeout(
        sb.from('reel_comments')
          .select('id,reel_id,user_id,content,status,created_at,parent_id')
          .eq('reel_id', Number(id)).eq('status', 'approved')
          .order('created_at', { ascending: true }).limit(50),
        FETCH_TIMEOUT
      );
      if (error) throw error;
      reelCommentsCache[id] = Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('Commentaires Reels indisponibles', e);
      reelCommentsCache[id] = [];
    }
    return reelCommentsCache[id];
  }

  function commentPreviewHTML(rows, total) {
    if (!rows.length) return '<div class="cl-comment-empty">Soyez le premier à commenter cette publication.</div>';
    return rows.slice(-2).map(row => {
      const who = row.user_id && currentUser && row.user_id === currentUser.id ? 'Vous' : 'Utilisateur CamerLink';
      return '<div class="cl-comment-preview"><span class="cl-comment-avatar">' + esc(who === 'Vous' ? 'V' : 'C') +
        '</span><div class="cl-comment-copy"><b>' + who + '</b><p>' + esc(row.content || '') +
        '</p></div></div>';
    }).join('') + (total > 2 ? '<button type="button" class="cl-comments-more" data-reel-comments>Voir les ' + total + ' commentaires</button>' : '');
  }

  async function hydrateReelComments() {
    const cards = document.querySelectorAll('.cl-social-post[data-reel]');
    await Promise.all([...cards].map(async card => {
      const id = card.dataset.reel;
      const host = card.querySelector('[data-comments-preview]');
      if (!host) return;
      const rows = await loadApprovedReelComments(id);
      if (!card.isConnected || !host.isConnected) return;
      const count = card.querySelector('[data-reel-comments] small');
      if (count) count.textContent = String(rows.length);
      const floating = card.querySelector('[data-comments-float-text]');
      if (floating) floating.textContent = rows.length ? rows[rows.length - 1].content : 'Aucun commentaire approuvé — commenter';
      host.innerHTML = commentPreviewHTML(rows, rows.length);
    }));
  }

  /* ===== REELS : fil vertical des annonces qui ont une vidéo ===== */
  function reelsMessage(text) {
    return '<div class="reels-placeholder"><span class="reels-placeholder-icon">▶</span><span>' + esc(text) + '</span></div>';
  }

  function renderReels(failed) {
    const feed = $('reels-feed');
    if (!feed) return;
    if (reelObserver) { reelObserver.disconnect(); reelObserver = null; }

    // Les Réels sont réservés aux vidéos ; les publications photo restent dans le fil des annonces.
    const list = allListings.filter(ad => Boolean(videos[ad.id])).slice(0, 40);
    if (list.length === 0) {
      feed.innerHTML = reelsMessage(failed
        ? 'Publications indisponibles pour le moment. Réessayez plus tard.'
        : 'Aucune vidéo pour le moment. Soyez le premier à publier un Réel !');
      return;
    }

    feed.innerHTML = list.map(ad => {
      const wa = waNumber(ad.contact);
      const price = Number(ad.price || 0) > 0 ? Number(ad.price).toLocaleString('fr-FR') + ' FCFA' : '';
      const media = videos[ad.id]
        ? `<video src="${esc(videos[ad.id])}"${ad.image_url ? ` poster="${esc(ad.image_url)}"` : ''} muted loop playsinline preload="metadata"></video><div class="cl-reel-sound-feedback" data-reel-sound-feedback aria-hidden="true">🔊 Son activé</div><div class="cl-reel-tap-hint" aria-hidden="true">Toucher la vidéo pour activer le son</div>`
        : `<img class="cl-reel-photo" src="${esc(ad.image_url)}" alt="${esc(ad.title)}" loading="lazy">`;
      const location = [ad.quartier, ad.city].filter(Boolean).join(' · ');
      const liked = window.getFavorites().includes(String(ad.id));
      return `
      <article class="reel-card cl-social-post" data-reel="${esc(ad.id)}">
        <div class="cl-post-location">${location ? `<span>📍 ${esc(location)}</span>` : '<span>Publication CamerLink</span>'}<span class="cl-post-type">${videos[ad.id] ? '▶ Vidéo' : '▧ Photo'}</span></div>
        <div class="cl-post-media">${media}<button type="button" class="cl-reel-exit" data-reel-exit aria-label="Quitter les Réels">‹</button><button type="button" class="cl-reel-fullscreen" data-reel-fullscreen aria-label="Afficher la vidéo en plein écran">⛶</button><div class="cl-post-shade"></div>
          <div class="cl-post-actions">
            <button type="button" data-reel-like aria-label="${liked ? 'Retirer le j’aime' : 'J’aime cette publication'}" aria-pressed="${liked ? 'true' : 'false'}"><span>${liked ? '♥' : '♡'}</span><small>${likeCounts[ad.id] || 0}</small></button>
            <button type="button" data-reel-comments aria-label="Voir les commentaires"><span>▢</span><small>…</small></button>
            <button type="button" data-reel-share aria-label="Partager la publication"><span>↗</span><small>Partager</small></button>
          </div>
          <div class="cl-post-caption">
            <strong>${esc(ad.title)}</strong>
            ${ad.description ? `<p>${esc(ad.description)}</p>` : ''}
            ${price ? `<b class="cl-post-price">${price}</b>` : ''}
          </div>
          <button type="button" class="cl-comments-float" data-reel-comments><span>💬</span><span data-comments-float-text>Lire les commentaires…</span><b>›</b></button>
        </div>
        <div class="cl-post-footer">
          <button type="button" class="cl-post-creator" ${ad.user_id ? `data-profile-user="${esc(ad.user_id)}"` : 'data-reel-open'}>
            <span class="cl-post-avatar" data-creator-avatar>${esc((ad.owner_name || ad.artisan_name || 'C').trim().slice(0,1).toUpperCase())}</span>
            <span><b data-creator-name>${esc(ad.owner_name || ad.artisan_name || 'Créateur CamerLink')}</b><small>Voir le profil</small></span>
          </button>
          ${ad.user_id && currentUser && ad.user_id === currentUser.id ? '<span class="cl-post-own">Votre publication</span>' : ad.user_id ? `<button type="button" class="cl-follow-btn" data-profile-user="${esc(ad.user_id)}">＋ S’abonner</button>` : ''}
          ${wa ? `<a class="cl-post-whatsapp" href="https://api.whatsapp.com/send?phone=${esc(wa)}" target="_blank" rel="noopener" aria-label="Contacter sur WhatsApp">☎</a>` : ''}
        </div>
        <div class="cl-comments-preview" data-comments-preview><span class="cl-comment-loading">Chargement des commentaires…</span></div><button type="button" class="cl-post-open" data-reel-open>Voir l’annonce complète →</button>
      </article>`;
    }).join('');

    // Hydrater l'identité du créateur après le rendu, sans bloquer la lecture des Réels.
    (async () => {
      const ids = [...new Set(list.map(ad => ad.user_id).filter(Boolean))];
      if (!ids.length) return;
      let info = {};
      try { info = await shopInfo(ids); } catch (_) {}
      let profiles = {};
      try {
        const result = await withTimeout(sb.from('profils')
          .select('id, full_name, username, avatar_url')
          .in('id', ids), FETCH_TIMEOUT);
        if (!result.error) (result.data || []).forEach(p => { profiles[p.id] = p; });
      } catch (_) {}
      list.forEach(ad => {
        const card = feed.querySelector(`.cl-social-post[data-reel="${CSS.escape(String(ad.id))}"]`);
        if (!card) return;
        const profile = profiles[ad.user_id] || {};
        const shop = info[ad.user_id] || {};
        const name = String(profile.full_name || profile.username || shop.name || ad.owner_name || ad.artisan_name || 'Créateur CamerLink').trim();
        const avatar = profile.avatar_url || shop.logo_url || null;
        const nameNode = card.querySelector('[data-creator-name]');
        const avatarNode = card.querySelector('[data-creator-avatar]');
        if (nameNode) nameNode.textContent = name;
        if (avatarNode) {
          if (avatar) {
            const img = document.createElement('img');
            img.src = avatar; img.alt = ''; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
            avatarNode.replaceChildren(img);
          } else {
            avatarNode.textContent = name.charAt(0).toUpperCase() || 'C';
          }
        }
      });
    })();

    hydrateReelComments();

    if ('IntersectionObserver' in window) {
      reelObserver = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          const v = en.target.querySelector('video');
          if (!v) return;
          if (en.isIntersecting && en.intersectionRatio >= 0.55) {
            const p = v.play();
            if (p && p.catch) p.catch(() => {});
          } else v.pause();
        });
      }, { threshold: [0, 0.55, 1] });
      feed.querySelectorAll('.cl-social-post').forEach(card => reelObserver.observe(card));
    }
  }

  function toggleReelSound(card, video) {
    video.muted = !video.muted;
    if (!video.muted) video.volume = 1;
    const feedback = card.querySelector('[data-reel-sound-feedback]');
    if (feedback) {
      feedback.textContent = video.muted ? '🔇 Son désactivé' : '🔊 Son activé';
      feedback.classList.remove('show');
      void feedback.offsetWidth;
      feedback.classList.add('show');
    }
    const hint = card.querySelector('.cl-reel-tap-hint');
    if (hint && !video.muted) hint.classList.add('hidden');
  }

  const reelsFeed = $('reels-feed');
  if (reelsFeed) {
    reelsFeed.addEventListener('click', (e) => {
      const card = e.target.closest('.reel-card');
      if (!card) return;
      const v = card.querySelector('video');
      const id = card.dataset.reel;
      const exitReels = e.target.closest('[data-reel-exit]');
      if (exitReels) {
        if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
        const homeButton = document.querySelector('.shell-nav [data-m="home"]');
        if (homeButton) homeButton.click();
        else document.body.setAttribute('data-cl-mode', 'home');
        return;
      }
      const full = e.target.closest('[data-reel-fullscreen]');
      if (full) {
        const media = full.closest('.cl-post-media');
        if (media) {
          const exit = document.fullscreenElement === media;
          const action = exit ? document.exitFullscreen?.() : media.requestFullscreen?.();
          if (action && action.catch) action.catch(() => toast('Le plein écran n’est pas disponible sur ce navigateur.'));
        }
        return;
      }
      const snd = e.target.closest('[data-reel-sound]');
      if (snd) { if (v) toggleReelSound(card, v); return; }
      const followBtn = e.target.closest('.cl-follow-btn');
      if (followBtn) {
        e.preventDefault();
        e.stopPropagation();
        const userId = followBtn.dataset.profileUser;
        if (!currentUser) { toast('Connectez-vous pour vous abonner.'); openModal('authModal'); return; }
        if (currentUser.id === userId) { toast('Vous ne pouvez pas vous abonner à vous-même.'); return; }
        if (followBtn.dataset.busy === '1') return;
        followBtn.dataset.busy = '1';
        const previousLabel = followBtn.textContent;
        followBtn.disabled = true;
        followBtn.textContent = 'Traitement…';
        (async () => {
          try {
            const { data, error } = await withTimeout(sb.rpc('toggle_follow', { p_user: userId }), FETCH_TIMEOUT);
            if (error) {
              const msg = String(error.message || '');
              const duplicate = error.code === '23505' || /409|duplicate|already exists|unique constraint/i.test(msg);
              if (!duplicate) throw error;
              // Le lien existe déjà : synchroniser l'interface sans afficher une fausse panne.
              followBtn.textContent = '✓ Abonné';
              followBtn.dataset.following = '1';
              toast('Vous êtes déjà abonné à ce créateur.');
            } else {
              const following = data === true || data === 'true';
              followBtn.textContent = following ? '✓ Abonné' : '＋ S’abonner';
              followBtn.dataset.following = following ? '1' : '0';
              toast(following ? 'Abonnement ajouté !' : 'Désabonnement effectué');
            }
          } catch (err) {
            console.error('Abonnement du créateur impossible:', err);
            followBtn.textContent = previousLabel;
            toast('Échec abonnement : ' + (err && err.message ? err.message : 'vérifiez la connexion.'));
          } finally {
            followBtn.disabled = false;
            delete followBtn.dataset.busy;
          }
        })();
        return;
      }
      const profileBtn = e.target.closest('[data-profile-user]');
      if (profileBtn) {
        const userId = profileBtn.dataset.profileUser;
        if (window.CamerLinkOpenProfile) window.CamerLinkOpenProfile(userId);
        else location.hash = '#profil/' + userId;
        return;
      }
      if (e.target.closest('[data-reel-like]')) { window.toggleFavorite(id); return; }
      if (e.target.closest('[data-reel-comments]')) { openAdDetail(id); return; }
      if (e.target.closest('[data-reel-share]')) {
        const ad = allListings.find(x => String(x.id) === String(id));
        if (ad) shareLink(ad.title || 'Publication CamerLink', ad.description || 'Découvre cette publication sur CamerLink', '/annonce/' + id);
        return;
      }
      if (e.target.closest('[data-reel-open]')) { openAdDetail(id); return; }
      if (e.target.closest('a')) return;
      if (v && e.target.closest('.cl-post-media') && !e.target.closest('.cl-post-actions, .cl-post-caption, .cl-comments-float, .cl-reel-fullscreen')) {
        toggleReelSound(card, v);
        if (v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
      } else if (v && e.target.closest('.cl-post-media')) {
        if (v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause();
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
      storyGroups = [...map.entries()].map(([uid, items]) => ({
        uid,
        shop: shops[uid] || null,
        items: items.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      }));
      renderShopsHTML();
    } catch (e) {
      console.warn('Statuts indisponibles pour le moment.', e && e.message);
    }
  }

  async function shopInfo(ids) {
    const out = {};
    if (!ids.length) return out;
    // Priorité au nom public de l’établissement, puis au profil personnel.
    try {
      const r = await withTimeout(sb.from('etablissements').select('user_id, name, logo_url').in('user_id', ids));
      if (!r.error) (r.data || []).forEach(e => {
        if (e.user_id && e.name) out[e.user_id] = { name: e.name, logo_url: e.logo_url || null };
      });
    } catch (e) { /* le profil personnel sert de solution de repli */ }
    const missing = ids.filter(id => !out[id] || !out[id].name);
    if (missing.length) {
      try {
        const p = await withTimeout(sb.from('profils').select('id, full_name, username, avatar_url').in('id', missing));
        if (!p.error) (p.data || []).forEach(profile => {
          const name = String(profile.full_name || '').trim() || String(profile.username || '').trim();
          if (profile.id && name && !/^user-[a-f0-9]{12,}$/i.test(name)) {
            out[profile.id] = { name, logo_url: profile.avatar_url || null };
          }
        });
      } catch (e) { /* nom de secours affiché dans la messagerie */ }
    }
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
      const name = (g.shop && g.shop.name) || 'Artisan';
      const logo = g.shop && g.shop.logo_url;
      const avatar = logo
        ? `<img src="${esc(logo)}" alt="" loading="lazy" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
        : esc(name.charAt(0).toUpperCase());
      html += `
        <div class="shop-story-card" data-group="${gi}" role="button" tabindex="0">
          <div class="story-ring"><div class="story-avatar-wrap">${avatar}</div></div>
          <div class="shop-story-name">${esc(name)}</div>
        </div>`;
    });
    container.innerHTML = html;
  }

  function activateCard(card) {
    if (!card) return;
    if (card.dataset.action === 'add') { window.openAddStoryModal(); return; }
    const g = storyGroups[Number(card.dataset.group)];
    if (g) openArtisan(g.uid); // fiche de l'artisan, avec un bouton pour voir ses statuts
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

    const name = (g.shop && g.shop.name) || 'Artisan';
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

  // Publication express : aperçu de la photo et contact prérempli quand possible.
  const adImageInput = $('adImage');
  const adImagePreviewWrap = $('adImagePreviewWrap');
  const adImagePreviewGrid = $('adImagePreviewGrid');
  const adImageRemove = $('adImageRemove');
  let adImagePreviewUrls = [];
  function resetAdImagePreview() {
    adImagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    adImagePreviewUrls = [];
    if (adImagePreviewGrid) adImagePreviewGrid.replaceChildren();
    if (adImagePreviewWrap) adImagePreviewWrap.hidden = true;
  }
  if (adImageInput) adImageInput.addEventListener('change', () => {
    resetAdImagePreview();
    const files = Array.from(adImageInput.files || []);
    if (files.length > 8) {
      adImageInput.value = '';
      if (adImagePreviewWrap) adImagePreviewWrap.hidden = true;
      const err = $('pubError'); if (err) err.textContent = 'Choisissez 8 photos maximum.';
      return;
    }
    const invalid = files.find(f => !AD_IMG_TYPES.includes(f.type) || f.size > MAX_AD_IMG_MB * 1024 * 1024);
    if (invalid) {
      adImageInput.value = '';
      const err = $('pubError'); if (err) err.textContent = !AD_IMG_TYPES.includes(invalid.type)
        ? 'Photo : jpg, png ou webp uniquement.' : `Photo trop lourde : ${invalid.name} (max ${MAX_AD_IMG_MB} Mo).`;
      return;
    }
    const err = $('pubError'); if (err) err.textContent = '';
    files.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      adImagePreviewUrls.push(url);
      const item = document.createElement('div');
      item.className = 'multi-photo-preview-item';
      const img = document.createElement('img');
      img.src = url; img.alt = `Aperçu photo ${index + 1}`;
      item.appendChild(img);
      const number = document.createElement('span');
      number.textContent = index === 0 ? 'Photo principale' : String(index + 1);
      item.appendChild(number);
      if (adImagePreviewGrid) adImagePreviewGrid.appendChild(item);
    });
    if (adImagePreviewWrap) adImagePreviewWrap.hidden = files.length === 0;
  });
  if (adImageRemove && adImageInput) adImageRemove.addEventListener('click', () => {
    adImageInput.value = '';
    resetAdImagePreview();
  });
  function prepareQuickPublish() {
    const contact = $('adContact');
    const details = document.querySelector('.quick-publish-details');
    if (contact && !contact.value.trim() && currentUser) {
      const loginDigits = String(currentUser.email || '').split('@')[0].replace(/[^0-9]/g, '');
      if (loginDigits.length >= 8) contact.value = normPhone(loginDigits);
    }
    if (details && contact && !contact.value.trim()) details.open = true;
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

  // Position GPS facultative du vendeur, conservée uniquement pour cette publication.
  let adGpsPosition = null;

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
      const imageFiles = Array.from(($('adImage') && $('adImage').files) || []);
      const vFile = adVideoInput ? adVideoInput.files[0] : null;

      if (title.length < 3 || title.length > 120) return setErr('Le titre doit faire entre 3 et 120 caractères.');
      if (description.length > 2000) return setErr('La description est trop longue (2000 caractères max).');
      if (!Number.isFinite(price) || price < 0) return setErr('Prix invalide.');
      if ($('adQuartier') && $('adQuartier').value.trim().length > MAX_QUARTIER) return setErr(`Le quartier est trop long (${MAX_QUARTIER} caractères max).`);
      if (!imageFiles.length && !vFile) return setErr('Ajoutez au moins une photo ou une vidéo.');
      if (imageFiles.length > 8) return setErr('Choisissez 8 photos maximum.');
      for (const file of imageFiles) {
        if (!AD_IMG_TYPES.includes(file.type)) return setErr('Photo : jpg, png ou webp uniquement.');
        if (file.size > MAX_AD_IMG_MB * 1024 * 1024) return setErr(`Photo trop lourde : ${file.name} (max ${MAX_AD_IMG_MB} Mo).`);
      }

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
        const imageUrls = [];
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          if (btn) btn.textContent = `Envoi des photos (${i + 1}/${imageFiles.length})...`;
          const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
          const imagePath = `${currentUser.id}/${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const up = await sb.storage.from(AD_BUCKET).upload(imagePath, file, { contentType: file.type });
          if (up.error) throw up.error;
          uploaded.push([AD_BUCKET, imagePath]);
          imageUrls.push(sb.storage.from(AD_BUCKET).getPublicUrl(imagePath).data.publicUrl);
        }
        const publicUrl = imageUrls[0] || null;

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
          contact
        };
        if (publicUrl) row.image_url = publicUrl;
        if (imageUrls.length) row.images_urls = imageUrls;
        if (videoUrl) row.video_url = videoUrl;
        if (quartier) row.quartier = quartier;
        if (adGpsPosition && Number.isFinite(adGpsPosition.lat) && Number.isFinite(adGpsPosition.lng)) {
          row.lat = adGpsPosition.lat;
          row.lng = adGpsPosition.lng;
        }

        const { error } = await sb.from('annonces').insert(row);
        if (error) throw error;
        saved = true;

        closeModal('publishModal');
        adForm.reset();
        adGpsPosition = null;
        const gpsPublishBtn = $('adGpsLocationBtn');
        if (gpsPublishBtn) gpsPublishBtn.textContent = '📍 Ajouter ma position (facultatif)';
        resetVideoPreview();
        resetAdImagePreview();
        const quickDetails = document.querySelector('.quick-publish-details');
        if (quickDetails) quickDetails.open = false;
        toast(videoUrl && imageUrls.length ? `Annonce publiée avec ${imageUrls.length} photo(s) et vidéo !` : videoUrl ? 'Annonce publiée avec sa vidéo !' : `Annonce publiée avec ${imageUrls.length} photo(s) !`);
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

  // Galerie horizontale pour annonces multi-photos, avec compatibilité anciennes annonces.
  function listingPhotoCarousel(ad, mode) {
    let rawUrls = ad.images_urls;
    if (typeof rawUrls === 'string') {
      try { rawUrls = JSON.parse(rawUrls); } catch (e) { rawUrls = [rawUrls]; }
    }
    const urls = Array.isArray(rawUrls)
      ? [...new Set(rawUrls.filter(url => typeof url === 'string' && /^https:\/\//i.test(url)))]
      : [];
    if (!urls.length && ad.image_url) urls.push(ad.image_url);
    if (!urls.length) return '';
    const cls = mode === 'detail' ? 'ad-photo-carousel ad-photo-carousel-detail' : 'ad-photo-carousel ad-photo-carousel-card';
    const slides = urls.map((url, i) =>
      `<div class="ad-photo-slide"><img class="cl-photo-atmosphere" src="${esc(url)}" alt="" aria-hidden="true" loading="lazy"><img class="cl-photo-main" src="${esc(url)}" alt="Photo ${i + 1} de ${esc(ad.title || 'l’annonce')}" loading="${i === 0 ? 'eager' : 'lazy'}"></div>`
    ).join('');
    const controls = urls.length > 1
      ? `<button type="button" class="ad-photo-arrow ad-photo-prev" data-photo-prev aria-label="Photo précédente">‹</button><button type="button" class="ad-photo-arrow ad-photo-next" data-photo-next aria-label="Photo suivante">›</button><div class="ad-photo-counter" aria-live="polite">1 / ${urls.length}</div><div class="ad-photo-dots">${urls.map((_, i) => `<span class="${i === 0 ? 'active' : ''}"></span>`).join('')}</div>`
      : '';
    return `<div class="${cls}" data-photo-carousel data-photo-count="${urls.length}"><div class="ad-photo-track">${slides}</div>${controls}</div>`;
  }

  // Flèches et indicateurs de la galerie; le défilement tactile reste natif sur mobile.
  document.addEventListener('click', (e) => {
    const arrow = e.target.closest('[data-photo-prev], [data-photo-next]');
    if (!arrow) return;
    e.preventDefault(); e.stopPropagation();
    const carousel = arrow.closest("[data-photo-carousel]");
    const track = carousel && carousel.querySelector(".ad-photo-track");
    if (!track) return;
    const slides = Array.from(track.children);
    const current = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
    const next = arrow.hasAttribute("data-photo-next") ? Math.min(current + 1, slides.length - 1) : Math.max(current - 1, 0);
    track.scrollTo({ left: slides[next].offsetLeft - track.offsetLeft, behavior: "smooth" });
  }, true);

  document.addEventListener('scroll', (e) => {
    const track = e.target;
    if (!track || !track.classList || !track.classList.contains("ad-photo-track")) return;
    const carousel = track.closest("[data-photo-carousel]");
    if (!carousel) return;
    const slides = Array.from(track.children);
    const index = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / Math.max(track.clientWidth, 1))));
    const counter = carousel.querySelector(".ad-photo-counter");
    if (counter) counter.textContent = (index + 1) + " / " + slides.length;
    carousel.querySelectorAll(".ad-photo-dots span").forEach((dot, i) => dot.classList.toggle("active", i === index));
  }, true);

  /* ===== AFFICHAGE DES ANNONCES ===== */
  function renderListings() {
    const grid = $('listings-grid');
    if (!grid) return;

    const term = $('searchInput').value.trim().toLowerCase();
    const city = $('cityFilter').value;
    const maxPrice = Number($('priceFilter').value) || 0;
    const favorites = window.getFavorites();

    let filtered = allListings.filter(ad =>
      (!favOnly || favorites.includes(String(ad.id))) &&
      (!currentCategory || ad.category === currentCategory) &&
      (!city || ad.city === city) &&
      (!currentQuartier || qKey(ad.quartier) === currentQuartier) &&
      (!maxPrice || Number(ad.price) <= maxPrice) &&
      (!term || String(ad.title || '').toLowerCase().includes(term) || qKey(ad.quartier).includes(qKey(term)) || qKey(ad.description).includes(qKey(term)))
    );
    if (nearbyMode && nearbyPosition) {
      const located = filtered.filter(a => a.lat != null && a.lng != null && Number.isFinite(Number(a.lat)) && Number.isFinite(Number(a.lng)));
      filtered = located.slice().sort((a,b) => distanceKm(a,nearbyPosition) - distanceKm(b,nearbyPosition));
    } else {
      filtered = filtered.slice().sort((a, b) => {
        if (sortMode === 'price-asc') return Number(a.price || 0) - Number(b.price || 0);
        if (sortMode === 'price-desc') return Number(b.price || 0) - Number(a.price || 0);
        if (sortMode === 'rating') return Number(b.note_moyenne || 0) - Number(a.note_moyenne || 0);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
    }

    $('resultsCount').textContent = `${filtered.length} annonce(s)`;
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="state-msg">' +
        (nearbyMode ? 'Aucune annonce avec position GPS enregistrée à proximité pour le moment. Les vendeurs peuvent ajouter leur position lors de la publication.' : (favOnly ? 'Aucun favori pour le moment.' : 'Aucune annonce disponible pour le moment.')) + '</div>';
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
        <div class="cl-feed-seller" data-seller-for="${esc(ad.id)}" aria-label="Profil du vendeur">
          <div class="cl-feed-avatar">A</div>
          <div class="cl-feed-seller-name">Artisan CamerLink</div>
        </div>
        <div class="card-img-container">
          <span class="card-badge-top">${esc(ad.category)}</span>
          <span class="card-views">👁 ${viewsCount} · ❤️ ${likes}</span>
          <button type="button" class="btn-fav ${isFav ? 'active' : ''}" data-fav="${esc(ad.id)}" aria-label="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}" aria-pressed="${isFav}" style="position:absolute; top:8px; right:8px; width:32px; height:32px; border-radius:50%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:3;">${isFav ? '❤️' : '🤍'}</button>
          ${listingPhotoCarousel(ad, 'card')}
          <div class="cl-immersive-overlay">
            <div class="cl-immersive-product">
              <div class="cl-immersive-title">${esc(ad.title)}</div>
              <div class="cl-immersive-price">${Number(ad.price || 0).toLocaleString('fr-FR')} FCFA</div>
              <div class="cl-immersive-city">📍 ${esc([ad.quartier, ad.city].filter(Boolean).join(', ') || 'Cameroun')}</div>
            </div>
            <div class="cl-immersive-actions" aria-label="Interactions">
              <span>♡ <b>${likes}</b></span>
              <span>◯ <b>${reviewCount}</b></span>
              <button type="button" class="cl-immersive-share" data-share-ad="${esc(ad.id)}" aria-label="Partager l’annonce">↗</button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <h3 class="ad-title">${esc(ad.title)}</h3>
          <div class="ad-price">${Number(ad.price || 0).toLocaleString('fr-FR')} FCFA</div>
          <p class="ad-desc">${esc(ad.description)}</p>
          <div class="ad-rating">⭐ ${rating} <span>(${reviewCount} avis)</span></div>
          <div class="card-meta"><span class="ad-city">📍 ${esc([ad.quartier, ad.city].filter(Boolean).join(', '))}</span></div>

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

    // Charger les noms et logos des artisans après le rendu, sans bloquer les annonces.
    filtered.forEach(async (ad) => {
      if (!ad.user_id) return;
      const card = grid.querySelector(`.ad-card[data-id="${CSS.escape(String(ad.id))}"]`);
      const seller = card && card.querySelector('[data-seller-for]');
      if (!seller) return;
      let shop = await fetchShop(ad.user_id);
      let profile = null;
      if (!shop || !shop.name) {
        try {
          const info = await shopInfo([ad.user_id]);
          profile = info[ad.user_id] || null;
        } catch (_) { /* le nom de secours reste affiché */ }
      }
      // Ne modifier que la carte toujours présente après les filtres/re-rendus.
      const currentCard = grid.querySelector(`.ad-card[data-id="${CSS.escape(String(ad.id))}"]`);
      const currentSeller = currentCard && currentCard.querySelector('[data-seller-for]');
      if (!currentSeller) return;
      const name = (shop && shop.name) || (profile && profile.name) || ad.seller_name || ad.artisan_name || 'Artisan CamerLink';
      const logo = (shop && shop.logo_url) || (profile && profile.logo_url) || null;
      currentSeller.innerHTML = `
        ${logo
          ? `<img class="cl-feed-avatar" src="${esc(logo)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
          : `<div class="cl-feed-avatar">${esc(String(name).trim().charAt(0).toUpperCase() || 'A')}</div>`}
        <div class="cl-feed-seller-name">${esc(name)}</div>
        ${shop && shop.verified ? '<span class="cl-feed-verified" aria-label="Artisan vérifié">✓</span>' : ''}
      `;
    });
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

  /* ===== MESSAGERIE CAMERLINK — interface conversation moderne ===== */
  const MSG_SEEN_KEY = 'camerlink_msg_seen';
  const chat = { other: null, ad: null };
  let msgChannel = null, msgSearch = '';
  if (!$('inboxModal')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="inboxModal" class="modal-overlay cl-messenger-overlay">
        <section class="modal-sheet cl-messenger" role="dialog" aria-modal="true" aria-label="Messagerie CamerLink">
          <header class="cl-msg-header">
            <div class="cl-msg-brand"><span class="cl-msg-logo">C</span><div><h3 id="inboxTitle">Messages</h3><p id="inboxSubtitle">Vos conversations CamerLink</p></div></div>
            <button type="button" class="modal-close cl-msg-close" id="inboxClose" aria-label="Fermer la messagerie">×</button>
          </header>
          <button type="button" id="inboxBack" class="cl-msg-back" style="display:none">← Toutes les conversations</button>
          <label class="cl-msg-search" id="inboxSearchWrap"><span>⌕</span><input id="inboxSearch" type="search" placeholder="Rechercher une conversation…" autocomplete="off"><button type="button" id="inboxSearchClear" aria-label="Effacer la recherche" hidden>×</button></label>
          <div id="inboxBody" class="cl-msg-body" aria-live="polite"></div>
          <div class="cl-msg-composer-wrap" id="chatComposerWrap" style="display:none">
            <div class="cl-msg-quick" aria-label="Réactions rapides"><button type="button" data-emoji="😊">😊</button><button type="button" data-emoji="❤️">❤️</button><button type="button" data-emoji="👍">👍</button><button type="button" data-emoji="😂">😂</button><button type="button" data-emoji="🙏">🙏</button></div>
            <form id="chatForm" class="cl-msg-composer" style="display:none">
              <input id="chatInput" type="text" maxlength="2000" placeholder="Écrire un message…" autocomplete="off" required aria-label="Votre message">
              <button type="submit" id="chatSendBtn" aria-label="Envoyer le message">➤</button>
            </form>
            <p class="cl-msg-hint">Entrée pour envoyer · Soyez respectueux et prudent.</p>
          </div>
        </section>
      </div>`);
  }

  const adTitleOf = (id) => {
    const a = allListings.find(x => String(x.id) === String(id));
    return a ? a.title : null;
  };
  async function fetchMessages() {
    if (!currentUser || !currentUser.id) throw new Error('Connectez-vous pour accéder à vos messages.');
    // Restreindre la requête au compte connecté; RLS reste la protection côté base.
    const { data, error } = await withTimeout(
      sb.from('messages').select('id, sender_id, receiver_id, ad_id, content, created_at, read_at')
        .or('sender_id.eq.' + currentUser.id + ',receiver_id.eq.' + currentUser.id)
        .order('created_at', { ascending: false }).limit(500),
      FETCH_TIMEOUT
    );
    if (error) throw error;
    return data || [];
  }
  async function shopNames(ids) {
    const info = await shopInfo(ids), names = {};
    Object.keys(info).forEach(k => { names[k] = info[k].name; });
    return names;
  }
  function msgInitial(name) { return String(name || 'C').trim().charAt(0).toUpperCase() || 'C'; }
  function msgTime(value) {
    try { return new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit'}).format(new Date(value)); }
    catch(e) { return fmtDate(value); }
  }
  async function refreshBadge() {
    const badge = $('msgBadge');
    if (!badge) return;
    if (!currentUser) { badge.textContent = ''; return; }
    try {
      const seen = localStorage.getItem(MSG_SEEN_KEY) || '1970-01-01T00:00:00Z';
      const { count, error } = await withTimeout(sb.from('messages').select('id',{count:'exact',head:true})
        .eq('receiver_id',currentUser.id).gt('created_at',seen));
      badge.textContent = (!error && count > 0) ? String(count) : '';
    } catch(e) {}
  }
  function setView(mode) {
    const thread = mode === 'thread';
    $('inboxBack').style.display = thread ? 'inline-flex' : 'none';
    $('inboxSearchWrap').style.display = thread ? 'none' : 'flex';
    $('chatComposerWrap').style.display = thread ? 'block' : 'none';
    $('chatForm').style.display = thread ? 'flex' : 'none';
    if (!thread) {
      $('inboxTitle').textContent = 'Messages';
      $('inboxSubtitle').textContent = 'Vos conversations CamerLink';
    }
  }
  async function renderInbox() {
    setView('list');
    const body = $('inboxBody');
    body.innerHTML = '<div class="cl-msg-state"><span class="cl-msg-loader"></span><b>Vos messages arrivent…</b><small>Chargement des conversations</small></div>';
    try {
      const msgs = await fetchMessages(), me = currentUser.id, convs = new Map();
      msgs.filter(m => m.sender_id === me || m.receiver_id === me).forEach(m => {
        const other = m.sender_id === me ? m.receiver_id : m.sender_id;
        // Une seule conversation par contact, même si plusieurs annonces sont concernées.
        const key = other;
        if (!convs.has(key)) convs.set(key,{other,ad:m.ad_id,last:m,unread:0});
        const c = convs.get(key);
        if (m.receiver_id === me && m.created_at > (localStorage.getItem(MSG_SEEN_KEY)||'1970-01-01T00:00:00Z')) c.unread++;
      });
      if (!convs.size) {
        body.innerHTML = '<div class="cl-msg-empty"><span>✉</span><h4>Aucune conversation pour le moment</h4><p>Écrivez à un vendeur ou découvrez des créateurs pour démarrer une discussion.</p></div>';
        return;
      }
      const values = [...convs.values()];
      const names = await shopNames([...new Set(values.map(c=>c.other))]);
      const filtered = values.filter(c => !msgSearch || String(names[c.other]||'Membre CamerLink').toLowerCase().includes(msgSearch.toLowerCase()) || String(c.last.content||'').toLowerCase().includes(msgSearch.toLowerCase()));
      body.innerHTML = filtered.length ? filtered.map(c => {
        const name=names[c.other]||'Membre CamerLink';
        return '<button type="button" class="cl-msg-conversation" data-other="'+esc(c.other)+'" data-ad="'+esc(c.ad||'')+'"><span class="cl-msg-avatar">'+esc(msgInitial(name))+'</span><span class="cl-msg-conv-copy"><span class="cl-msg-conv-top"><b>'+esc(name)+'</b><time>'+esc(msgTime(c.last.created_at))+'</time></span><span class="cl-msg-conv-preview">'+(c.last.sender_id===me?'Vous : ':'')+esc(c.last.content||'')+'</span>'+(c.ad&&adTitleOf(c.ad)?'<small>Annonce : '+esc(adTitleOf(c.ad))+'</small>':'')+'</span>'+(c.unread?'<span class="cl-msg-unread">'+c.unread+'</span>':'')+'</button>';
      }).join('') : '<div class="cl-msg-empty"><span>⌕</span><h4>Aucun résultat</h4><p>Essayez un autre nom ou mot-clé.</p></div>';
    } catch(e) {
      body.innerHTML = '<div class="cl-msg-empty"><span>⚠</span><h4>Messages indisponibles</h4><p>Vérifiez votre connexion puis réessayez.</p><button type="button" id="cl-msg-retry">Réessayer</button></div>';
      const retry=$('cl-msg-retry'); if(retry)retry.onclick=renderInbox;
    }
  }
  async function renderThread() {
    setView('thread');
    const body=$('inboxBody');
    body.innerHTML='<div class="cl-msg-state"><span class="cl-msg-loader"></span><b>Ouverture de la conversation…</b></div>';
    try {
      const me=currentUser.id;
      const msgs=(await fetchMessages()).filter(m =>
        ((m.sender_id===chat.other&&m.receiver_id===me)||(m.sender_id===me&&m.receiver_id===chat.other))).reverse();
      const names=await shopNames([chat.other]), name=names[chat.other]||'Membre CamerLink';
      $('inboxTitle').textContent=name;
      $('inboxSubtitle').textContent='Conversation privée';
      body.innerHTML=msgs.length?'<div class="cl-msg-day">Messages</div>'+msgs.map(m=>'<div class="cl-msg-row '+(m.sender_id===me?'mine':'theirs')+'"><div class="cl-msg-bubble">'+esc(m.content)+'<time>'+esc(msgTime(m.created_at))+'</time></div></div>').join(''):'<div class="cl-msg-empty cl-msg-thread-empty"><span>👋</span><h4>Commencez la conversation</h4><p>Envoyez un premier message à '+esc(name)+'.</p></div>';
      body.scrollTop=body.scrollHeight;
      markSeen();
    } catch(e) {
      body.innerHTML='<div class="cl-msg-empty"><h4>Impossible de charger cette conversation</h4><button type="button" id="cl-thread-retry">Réessayer</button></div>';
      const retry=$('cl-thread-retry');if(retry)retry.onclick=renderThread;
    }
  }
  function markSeen() {
    try { localStorage.setItem(MSG_SEEN_KEY,new Date().toISOString()); } catch(e) {}
    if($('msgBadge'))$('msgBadge').textContent='';
  }
  function openInbox() {
    if(!currentUser){toast('Connectez-vous pour voir vos messages');openModal('authModal');return;}
    chat.other=null;chat.ad=null;openModal('inboxModal');markSeen();renderInbox();
  }
  window.openChat=function(otherId,adId){
    if(!currentUser){toast('Connectez-vous pour envoyer un message');openModal('authModal');return;}
    if(otherId===currentUser.id){toast('C’est votre propre annonce');return;}
    chat.other=otherId;chat.ad=adId||null;openModal('inboxModal');markSeen();renderThread();
  };
  $('msgInboxBtn').addEventListener('click',openInbox);
  $('inboxClose').addEventListener('click',()=>closeModal('inboxModal'));
  $('inboxBack').addEventListener('click',renderInbox);
  $('inboxSearch').addEventListener('input',e=>{msgSearch=e.target.value; $('inboxSearchClear').hidden=!msgSearch;renderInbox();});
  $('inboxSearchClear').addEventListener('click',()=>{$('inboxSearch').value='';msgSearch='';$('inboxSearchClear').hidden=true;renderInbox();});
  $('inboxBody').addEventListener('click',e=>{
    const c=e.target.closest('[data-other]');if(!c)return;
    chat.other=c.dataset.other;chat.ad=c.dataset.ad?Number(c.dataset.ad):null;markSeen();renderThread();
  });
  document.querySelectorAll('#inboxModal [data-emoji]').forEach(b=>b.addEventListener('click',()=>{
    const input=$('chatInput');input.value+=b.dataset.emoji;input.focus();
  }));
  $('chatForm').addEventListener('submit',async e=>{
    e.preventDefault();const input=$('chatInput'),content=input.value.trim();
    if(!content||!currentUser||!chat.other)return;
    const send=$('chatSendBtn');input.disabled=true;send.disabled=true;
    try{
      const {error}=await sb.from('messages').insert({sender_id:currentUser.id,receiver_id:chat.other,ad_id:chat.ad||null,content});
      if(error)throw error;
      input.value='';await renderThread();refreshBadge();
    }catch(ex){toast('Message non envoyé. Vérifiez la connexion et réessayez.');}
    finally{input.disabled=false;send.disabled=false;input.focus();}
  });
  function subscribeMessages(){
    if(msgChannel){sb.removeChannel(msgChannel);msgChannel=null;}
    refreshBadge();if(!currentUser)return;
    msgChannel=sb.channel('messages-'+currentUser.id)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'receiver_id=eq.'+currentUser.id},payload=>{
        const m=payload.new||{};
        if($('inboxModal').classList.contains('active')){
          if(chat.other && (m.sender_id===chat.other || m.receiver_id===chat.other)) renderThread();
          else if(!chat.other)renderInbox();
          refreshBadge();
        }else{toast('💬 Nouveau message');refreshBadge();}
      })
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'sender_id=eq.'+currentUser.id},()=>{
        if($('inboxModal').classList.contains('active')&&!chat.other)renderInbox();
      }).subscribe();
  }

  /* ===== AUTHENTIFICATION ===== */
  let authInit = false;
  sb.auth.onAuthStateChange((_, session) => {
    const prev = currentUser && currentUser.id;
    currentUser = session ? session.user : null;
    $('authBtn').textContent = currentUser ? 'Déconnexion' : 'Connexion';
    const claimButton = $('claimBtn'); if (claimButton) claimButton.style.display = 'none'; // récupération des anciennes annonces retirée
    if (!authInit || prev !== (currentUser && currentUser.id)) {
      authInit = true;
      setTimeout(subscribeMessages, 0);
      setTimeout(syncFavorites, 0); // charge (ou vide) les favoris du compte
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
    prepareQuickPublish();
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
    <div id="artisanModal" class="modal-overlay">
      <div class="modal-sheet" style="max-width:520px;">
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
      ${listingPhotoCarousel(ad, 'detail')}
      ${vUrl ? `<video src="${esc(vUrl)}" controls playsinline preload="metadata" style="width:100%;max-height:300px;border-radius:12px;margin-bottom:12px;background:#000;"></video>` : ''}
      <span style="display:inline-block;padding:3px 10px;border-radius:999px;background:rgba(34,211,238,0.12);color:var(--a1);font-size:0.75rem;font-weight:600;">${esc(ad.category)}</span>
      <h3 style="font-size:1.25rem;margin:8px 0 4px;">${esc(ad.title)}</h3>
      <div style="font-size:1.3rem;font-weight:800;color:#10b981;margin-bottom:8px;">${Number(ad.price || 0).toLocaleString('fr-FR')} FCFA</div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;font-size:0.85rem;color:var(--color-text-muted);margin-bottom:12px;">
        <span>📍 ${esc(place || '—')}</span>
        <span>👁 ${views} vue(s)</span>
        <span>❤️ ${likes} j'aime</span>
        <span id="adReviewAverage">⭐ ${rating} (${ad.nb_avis || 0} avis)</span>
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
        ${ad.user_id ? `<button type="button" data-act="msg" style="${softStyle}">💬 Message</button>` : ''}
        ${wa ? `<a href="https://api.whatsapp.com/send?phone=${esc(wa)}" target="_blank" rel="noopener" style="${btnStyle}background:#22C55E;color:#fff;">WhatsApp</a>
        <a href="tel:+${esc(wa)}" style="${btnStyle}background:#10B981;color:#fff;">Appel</a>` : ''}
        <button type="button" data-act="share" style="${softStyle}">📤 Partager</button>
        <button type="button" data-act="copy" style="${softStyle}">🔗 Copier le lien</button>
      </div>
      <section id="adReviewsSection" style="margin-top:20px;padding-top:14px;border-top:1px solid var(--color-border);" aria-label="Avis vendeur">
        <h4 style="margin:0 0 10px;font-size:1.05rem;">⭐ Avis sur le vendeur <span id="adReviewsCount" style="color:var(--color-text-muted);font-weight:500;">(0)</span></h4>
        <div id="adReviewsList" aria-live="polite" style="display:grid;gap:10px;margin-bottom:12px;"><p style="color:var(--color-text-muted);">Chargement des avis…</p></div>
        ${currentUser ? `
          <form id="adReviewForm" style="display:grid;gap:10px;">
            <label style="display:grid;gap:6px;font-weight:600;">Votre note
              <select name="note" required style="padding:10px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-bg);color:var(--color-text);">
                <option value="">Choisir une note</option><option value="5">★★★★★ — Excellent</option><option value="4">★★★★☆ — Très bien</option><option value="3">★★★☆☆ — Correct</option><option value="2">★★☆☆☆ — Décevant</option><option value="1">★☆☆☆☆ — Mauvais</option>
              </select>
            </label>
            <textarea name="commentaire" maxlength="500" placeholder="Décrivez votre expérience (facultatif)…" rows="3" style="width:100%;box-sizing:border-box;padding:10px;border:1px solid var(--color-border);border-radius:12px;background:var(--color-bg);color:var(--color-text);"></textarea>
            <button type="submit" style="${btnStyle}background:var(--a1);color:#fff;">Publier mon avis</button>
          </form>
        ` : '<p style="font-size:.9rem;color:var(--color-text-muted);">Connectez-vous pour laisser un avis.</p>'}
      </section>
      <section style="margin-top:20px;padding-top:14px;border-top:1px solid var(--color-border);" aria-label="Commentaires">
        <h4 style="margin:0 0 10px;font-size:1.05rem;">💬 Commentaires <span id="adCommentsCount" style="color:var(--color-text-muted);font-weight:500;">…</span></h4>
        <div id="adCommentsList" aria-live="polite" style="display:grid;gap:10px;margin-bottom:12px;"><p style="color:var(--color-text-muted);">Chargement des commentaires…</p></div>
        ${currentUser ? `
          <form id="adCommentForm" style="display:flex;gap:8px;align-items:flex-end;">
            <textarea name="content" maxlength="500" required placeholder="Écrire un commentaire…" rows="2" style="flex:1;min-width:0;resize:vertical;padding:10px;border:1px solid var(--color-border);border-radius:12px;background:var(--color-bg);color:var(--color-text);"></textarea>
            <button type="submit" style="${btnStyle}background:var(--a1);color:#fff;">Envoyer</button>
          </form>
        ` : '<p style="font-size:.9rem;color:var(--color-text-muted);">Connectez-vous pour écrire un commentaire.</p>'}
      </section>`;
  }

  async function loadAdComments(id) {
    const list = $('adCommentsList');
    const count = $('adCommentsCount');
    if (!list || !count) return;
    list.innerHTML = '<p style="color:var(--color-text-muted);">Chargement des commentaires…</p>';
    try {
      const { data, error } = await withTimeout(
        sb.from('reel_comments')
          .select('id,reel_id,user_id,content,created_at')
          .eq('reel_id', Number(id)).eq('status', 'approved')
          .order('created_at', { ascending: true }).limit(100),
        FETCH_TIMEOUT
      );
      if (error) throw error;
      const rows = Array.isArray(data) ? data : [];
      count.textContent = '(' + rows.length + ')';
      list.innerHTML = rows.length ? rows.map(row =>
        '<article style="padding:10px;border-radius:12px;background:var(--color-bg);border:1px solid var(--color-border);">' +
        '<strong style="font-size:.85rem;">' + (currentUser && row.user_id === currentUser.id ? 'Vous' : 'Utilisateur CamerLink') + '</strong>' +
        '<p style="margin:4px 0 0;white-space:pre-wrap;overflow-wrap:anywhere;">' + esc(row.content || '') + '</p>' +
        '<small style="color:var(--color-text-muted);">' + esc(fmtDate(row.created_at)) + '</small></article>'
      ).join('') : '<p style="color:var(--color-text-muted);">Aucun commentaire pour le moment. Soyez le premier !</p>';
    } catch (err) {
      console.warn('Chargement des commentaires impossible', err);
      count.textContent = '';
      list.innerHTML = '<p style="color:var(--color-text-muted);">Impossible de charger les commentaires. Vérifiez votre connexion puis rouvrez la publication.</p>';
    }
  }

  async function loadAdReviews(id) {
    const list = $('adReviewsList'), count = $('adReviewsCount');
    if (!list || !count) return;
    list.innerHTML = '<p style="color:var(--color-text-muted);">Chargement des avis…</p>';
    try {
      const { data, error } = await withTimeout(sb.from('avis').select('id,user_id,note,commentaire,created_at').eq('annonce_id', Number(id)).order('created_at', { ascending: false }).limit(100), FETCH_TIMEOUT);
      if (error) throw error;
      const rows = Array.isArray(data) ? data : [];
      count.textContent = '(' + rows.length + ')';
      const avg = rows.length ? rows.reduce((sum, row) => sum + Number(row.note || 0), 0) / rows.length : 0;
      const ratingEl = $('adReviewAverage');
      if (ratingEl) ratingEl.textContent = '⭐ ' + avg.toFixed(1) + ' (' + rows.length + ' avis)';
      list.innerHTML = rows.length ? rows.map(row =>
        '<article style="padding:10px;border-radius:12px;background:var(--color-bg);border:1px solid var(--color-border);">' +
        '<strong>' + '★'.repeat(Math.max(0, Math.min(5, Number(row.note) || 0))) + '<span style="color:var(--color-text-muted);">' + '☆'.repeat(5 - Math.max(0, Math.min(5, Number(row.note) || 0))) + '</span></strong>' +
        (row.commentaire ? '<p style="margin:5px 0;white-space:pre-wrap;overflow-wrap:anywhere;">' + esc(row.commentaire) + '</p>' : '') +
        '<small style="color:var(--color-text-muted);">' + esc(fmtDate(row.created_at)) + '</small></article>'
      ).join('') : '<p style="color:var(--color-text-muted);">Aucun avis pour le moment. Soyez le premier !</p>';
    } catch (err) {
      console.warn('Chargement des avis impossible', err);
      count.textContent = '(indisponible)';
      list.innerHTML = '<div role="status"><p style="color:var(--color-text-muted);">Les avis n’ont pas pu être chargés. Vérifiez la connexion puis réessayez.</p><button type="button" data-reviews-retry style="padding:9px 13px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-bg);color:var(--color-text);">Réessayer</button></div>';
    }
  }

  $('adDetailBody').addEventListener('submit', async (e) => {
    const form = e.target.closest('#adReviewForm');
    if (!form) return;
    e.preventDefault();
    if (!currentUser) { toast('Connectez-vous pour publier un avis'); openModal('authModal'); return; }
    const fd = new FormData(form);
    const note = Number(fd.get('note'));
    const commentaire = String(fd.get('commentaire') || '').trim();
    const adId = Number(detail.id);
    if (!adId || !Number.isInteger(note) || note < 1 || note > 5) { toast('Choisissez une note entre 1 et 5 étoiles.'); return; }
    const submit = form.querySelector('button[type="submit"]');
    if (submit) { submit.disabled = true; submit.textContent = 'Publication…'; }
    try {
      const { error } = await withTimeout(sb.from('avis').insert({ annonce_id: adId, user_id: currentUser.id, note, commentaire: commentaire || null }), FETCH_TIMEOUT);
      if (error) throw error;
      form.reset();
      await loadAdReviews(adId);
      toast('Votre avis a été publié !');
    } catch (err) {
      console.warn('Publication de l’avis impossible', err);
      if (err && (err.code === '42501' || err.code === 'PGRST301')) toast('Connectez-vous puis réessayez.');
      else if (err && err.code === '23503') toast('Cette annonce n’est plus disponible.');
      else toast('Avis non publié : ' + (err && err.message ? err.message : 'vérifiez la connexion et réessayez.'));
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = 'Publier mon avis'; }
    }
  });

  $('adDetailBody').addEventListener('submit', async (e) => {
    const form = e.target.closest('#adCommentForm');
    if (!form) return;
    e.preventDefault();
    if (!currentUser) { toast('Connectez-vous pour commenter'); openModal('authModal'); return; }
    const field = form.querySelector('[name="content"]');
    const content = String(field && field.value || '').trim();
    const adId = Number(detail.id);
    if (!content || !adId) return;
    const submit = form.querySelector('button[type="submit"]');
    if (submit) { submit.disabled = true; submit.textContent = 'Envoi…'; }
    try {
      const { error } = await withTimeout(
        sb.from('reel_comments').insert({ reel_id: adId, user_id: currentUser.id, content: content, status: 'approved' }),
        FETCH_TIMEOUT
      );
      if (error) throw error;
      if (field) field.value = '';
      delete reelCommentsCache[String(adId)];
      await loadAdComments(adId);
      toast('Commentaire publié !');
      hydrateReelComments();
    } catch (err) {
      console.warn('Envoi du commentaire impossible', err);
      toast(err && err.code === '42501' ? 'Vous devez vous connecter pour commenter.' : 'Envoi impossible. Réessayez.');
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = 'Envoyer'; }
    }
  });

  async function openAdDetail(id) {
    const ad = allListings.find(a => String(a.id) === String(id));
    if (!ad) return;
    detail.id = String(ad.id);
    detail.shop = ad.user_id && shopCache[ad.user_id] ? shopCache[ad.user_id] : null;
    renderAdDetail();
    openModal('adDetailModal');
    loadAdReviews(ad.id);
    loadAdComments(ad.id);
    setUrl('/annonce/' + ad.id, ad.title + ' · CamerLink');
    registerView(ad.id);
    if (ad.user_id && !detail.shop) {
      const shop = await fetchShop(ad.user_id);
      if (detail.id === String(ad.id)) { detail.shop = shop; renderAdDetail(); loadAdReviews(ad.id); loadAdComments(ad.id); }
    }
  }

  $('adDetailBody').addEventListener('click', (e) => {
    const retryReviews = e.target.closest('[data-reviews-retry]');
    if (retryReviews) { loadAdReviews(detail.id); return; }
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
    else if (act.dataset.act === 'artisan') { closeModal('adDetailModal'); openArtisan(ad.user_id); }
  });

  async function openArtisan(uid) {
    if (!uid) return;
    const body = $('artisanBody');
    body.innerHTML = '<div class="state-msg">Chargement...</div>';
    openModal('artisanModal');
    setUrl('/artisan/' + uid, 'Artisan · CamerLink');
    try {
    const shop = await fetchShop(uid);
    if (shop && shop.name && $('artisanModal').classList.contains('active')) document.title = shop.name + ' · CamerLink';
    const ads = allListings.filter(a => a.user_id === uid);
    const wa = waNumber(shop && shop.contact);
    const reel = shop && shop.video_url && /^https:\/\//i.test(shop.video_url) ? shop.video_url : null;
    const mine = currentUser && currentUser.id === uid;
    const gi = storyGroups.findIndex(g => g.uid === uid);
    const nStories = gi >= 0 ? storyGroups[gi].items.length : 0;

    body.innerHTML = `
      <article class="cl-premium-profile">
        <header class="cl-premium-profile-hero">
          <div class="cl-premium-orb cl-premium-orb-one"></div><div class="cl-premium-orb cl-premium-orb-two"></div>
          <div class="cl-premium-eyebrow"><span class="cl-premium-live-dot"></span> CAMERLINK · PROFIL PROFESSIONNEL</div>
          <div class="cl-premium-identity">
            <div class="cl-premium-avatar-wrap">${avatarHTML(shop, 88)}${shop && shop.verified ? '<span class="cl-premium-verified" title="Profil vérifié">✓</span>' : ''}</div>
            <div class="cl-premium-identity-copy">
              <h3>${esc((shop && shop.name) || 'Artisan CamerLink')}</h3>
              <p>${esc(shop ? [shop.type, shop.city].filter(Boolean).join(' · ') : 'Professionnel au Cameroun')}</p>
              <span class="cl-premium-member-pill">${shop && shop.verified ? '✓ Professionnel vérifié' : '✦ Vitrine professionnelle'}</span>
            </div>
          </div>
          <div class="cl-premium-stats">
            <div><strong>${ads.length}</strong><span>Publications</span></div>
            <div><strong>${nStories}</strong><span>Statuts</span></div>
            <div><strong>${reel ? '1' : '0'}</strong><span>Vidéo</span></div>
          </div>
          <p class="cl-premium-tagline">${shop && shop.verified ? 'Un profil vérifié pour découvrir ses services en confiance.' : 'Découvrez ses réalisations, ses offres et contactez-le directement.'}</p>
        </header>
        ${shop && shop.description ? `<section class="cl-premium-section"><div class="cl-premium-section-label">À PROPOS</div><p class="cl-premium-description">${esc(shop.description)}</p></section>` : ''}
        <section class="cl-premium-contact-grid">
          ${shop && shop.city ? `<div><span>📍</span><small>Ville</small><strong>${esc(shop.city)}</strong></div>` : ''}
          ${shop && shop.address ? `<div><span>🧭</span><small>Adresse</small><strong>${esc(shop.address)}</strong></div>` : ''}
          ${shop && shop.hours ? `<div><span>🕒</span><small>Horaires</small><strong>${esc(shop.hours)}</strong></div>` : ''}
          ${shop && shop.contact ? `<div><span>☎</span><small>Contact</small><strong>${esc(shop.contact)}</strong></div>` : ''}
        </section>
        ${reel ? `<section class="cl-premium-section"><div class="cl-premium-section-label">À LA UNE</div><video class="cl-premium-reel" src="${esc(reel)}" controls playsinline preload="metadata"></video>${shop && shop.reel_desc ? `<p class="cl-premium-description">${esc(shop.reel_desc)}</p>` : ''}</section>` : ''}
        ${nStories ? `<button type="button" data-act="stories" data-gi="${gi}" class="cl-premium-primary cl-premium-story-btn">▶ Voir ses statuts <span>${nStories}</span></button>` : ''}
        <section class="cl-premium-follow-panel">
          <div class="cl-premium-follow-heading"><span>Restez connecté</span><small>Suivez ses nouveautés sur CamerLink</small></div>
          <div id="artisanFollowArea" class="cl-premium-follow-area">${mine ? '<span class="cl-premium-own-label">✓ Votre profil</span>' : '<button type="button" data-act="follow" class="cl-premium-primary cl-premium-follow-btn">＋ S’abonner</button>'}
            <div id="artisanFollowStats" class="cl-premium-follow-stats"><button type="button" data-follow-list="followers">Abonnés…</button><button type="button" data-follow-list="following">Abonnements…</button></div>
          </div>
          <div id="artisanFollowList" class="cl-premium-follow-list" style="display:none"></div>
        </section>
        <section class="cl-premium-actions">
          ${wa ? `<a class="cl-premium-action cl-premium-whatsapp" href="https://api.whatsapp.com/send?phone=${esc(wa)}" target="_blank" rel="noopener">◉ WhatsApp</a><a class="cl-premium-action" href="tel:+${esc(wa)}">☎ Appeler</a>` : ''}
          ${!mine ? '<button type="button" data-act="msg" class="cl-premium-action">✉ Message</button>' : ''}
          <button type="button" data-act="share" class="cl-premium-action">↗ Partager</button>
          <button type="button" data-act="copy" class="cl-premium-action">⧉ Copier le lien</button>
        </section>
        <section class="cl-premium-section cl-premium-catalogue">
          <div class="cl-premium-catalogue-heading"><div class="cl-premium-section-label">CATALOGUE</div><h4>Ses publications <span>${ads.length}</span></h4><p>Découvrez les offres et réalisations de ce professionnel.</p></div>
          <div class="cl-premium-listings">
            ${ads.length ? ads.map(a => `<button type="button" data-ad="${esc(a.id)}" class="cl-premium-listing">
              ${a.image_url ? `<img src="${esc(a.image_url)}" alt="${esc(a.title || 'Photo de publication')}" loading="lazy">` : '<div class="cl-premium-listing-placeholder">CL</div>'}
              <span class="cl-premium-listing-info"><strong>${esc(a.title || 'Publication')}</strong><b>${Number(a.price || 0).toLocaleString('fr-FR')} FCFA</b><small>${esc(a.category || 'Service')}</small></span><span class="cl-premium-listing-arrow">↗</span>
            </button>`).join('') : '<div class="cl-premium-empty"><span>✦</span><strong>Le catalogue se prépare</strong><p>Les prochaines offres de ce professionnel apparaîtront ici.</p></div>'}
          </div>
        </section>
      </article>`;


    body.dataset.uid = uid;
    const followBtn = body.querySelector('[data-act="follow"]');
    sb.rpc('camerlink_follow_stats',{target_user:uid}).then(({data,error})=>{
      if(error){console.warn('Statistiques abonnements:',error);return;}const st=Array.isArray(data)?data[0]:data;if(!st)return;
      const statsEl=body.querySelector('#artisanFollowStats');
      if(statsEl){const fb=statsEl.querySelector('[data-follow-list="followers"]'),fg=statsEl.querySelector('[data-follow-list="following"]');if(fb)fb.textContent=Number(st.followers_count||0)+' abonnés';if(fg)fg.textContent=Number(st.following_count||0)+' abonnements';}
      if(followBtn)followBtn.textContent=st.is_following?'✓ Abonné':'＋ S’abonner';
    }).catch(err=>console.warn('Statistiques abonnements:',err));
    if(followBtn&&!mine&&!currentUser)followBtn.textContent='Connexion pour s’abonner';
    } catch (err) {
      console.error(err);
      body.innerHTML = '<div class="state-msg">Impossible d’afficher la fiche. Réessayez.</div>';
    }
  }

  $('artisanBody').addEventListener('click', (e) => {
    const st = e.target.closest('[data-act="stories"]');
    if (st) { closeModal('artisanModal'); openViewer(Number(st.dataset.gi)); return; }
    const ad = e.target.closest('[data-ad]');
    if (ad) { closeModal('artisanModal'); openAdDetail(ad.dataset.ad); return; }
    const uid = $('artisanBody').dataset.uid;
    const listBtn=e.target.closest('[data-follow-list]');
    if(listBtn){
      const kind=listBtn.dataset.followList, host=$('artisanFollowList');
      if(!host||!uid)return;
      if(host.dataset.kind===kind&&host.style.display!=='none'){host.style.display='none';return;}
      host.dataset.kind=kind;host.style.display='block';host.innerHTML='<div class="state-msg">Chargement des profils…</div>';
      (async()=>{try{
        const col=kind==='followers'?'followed_id':'follower_id';
        const {data:links,error:linkErr}=await withTimeout(sb.from('abonnements').select('follower_id,followed_id').eq(col,uid));
        if(linkErr)throw linkErr;
        const ids=(links||[]).map(x=>kind==='followers'?x.follower_id:x.followed_id).filter(Boolean);
        if(!ids.length){host.innerHTML='<p style="margin:4px 0">Aucun '+(kind==='followers'?'abonné':'abonnement')+' pour le moment.</p>';return;}
        const {data:profiles,error:profileErr}=await withTimeout(sb.from('profiles').select('id,full_name,avatar_url,city').in('id',ids));
        if(profileErr)throw profileErr;
        const byId=new Map((profiles||[]).map(p=>[p.id,p]));
        host.innerHTML='<strong style="display:block;margin-bottom:8px">'+(kind==='followers'?'Tes abonnés':'Les personnes que tu suis')+'</strong>'+ids.map(id=>{const p=byId.get(id)||{};const name=p.full_name||'Utilisateur CamerLink';return '<button type="button" data-follow-profile="'+esc(id)+'" style="display:flex;align-items:center;gap:10px;width:100%;padding:8px;border:0;border-radius:8px;background:transparent;color:inherit;text-align:left;cursor:pointer">'+(p.avatar_url?'<img src="'+esc(p.avatar_url)+'" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover">':'<span style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(127,127,127,.2)">👤</span>')+'<span>'+esc(name)+(p.city?'<small style="display:block;opacity:.7">'+esc(p.city)+'</small>':'')+'</span></button>';}).join('');
      }catch(err){console.error('Liste abonnements:',err);host.innerHTML='<p>Impossible de charger la liste. Réessaie dans un instant.</p>';}})();
      return;
    }
    const profileBtn=e.target.closest('[data-follow-profile]');
    if(profileBtn){openArtisan(profileBtn.dataset.followProfile);return;}
    const follow = e.target.closest('[data-act="follow"]');
    if(follow){
      if(!currentUser){toast('Connectez-vous pour vous abonner.');openModal('authModal');return;}
      if(currentUser.id===uid){toast('Vous ne pouvez pas vous abonner à vous-même.');return;}
      const originalLabel=follow.textContent;
      follow.disabled=true;
      follow.textContent='Traitement…';
      (async()=>{
        try {
          const {data,error}=await withTimeout(sb.rpc('toggle_follow',{p_user:uid}),FETCH_TIMEOUT);
          if(error) throw error;
          toast(data?'Abonnement ajouté !':'Désabonnement effectué');
          await openArtisan(uid);
        } catch(err) {
          console.error('Abonnement impossible:',err);
          follow.disabled=false;
          follow.textContent=originalLabel;
          toast('Échec abonnement : '+(err&&err.message?err.message:'vérifiez la connexion puis réessayez.'));
        }
      })();
      return;
    }
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

  const legacyClaimButton = $('claimBtn');
  if (legacyClaimButton) legacyClaimButton.addEventListener('click', () => {
    if (!currentUser) { openModal('authModal'); return; }
    const login = String((currentUser.email || '').split('@')[0]).replace(/\D/g, '');
    if (!$('claimPhone').value && login) $('claimPhone').value = '+' + login;
    $('claimError').textContent = '';
    updateClaimMatch();
    openModal('claimModal');
    loadMyClaims();
    loadAdminClaims();
  });
  const legacyClaimPhone = $('claimPhone');
  if (legacyClaimPhone) legacyClaimPhone.addEventListener('input', updateClaimMatch);

  const legacyClaimForm = $('claimForm');
  if (legacyClaimForm) legacyClaimForm.addEventListener('submit', async (e) => {
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
function renderStatuses(list){
  const seen = JSON.parse(localStorage.getItem('seenStatuses')||'[]');
  const row = document.querySelector('.status-row');
  if(!row) return;
  row.innerHTML = `<div class="status-item" onclick="openAddStatus&&openAddStatus()">
    <div class="status-ring mine"><div style="height:100%;display:grid;place-items:center;font-size:28px;color:#22d3ee">+</div></div>
    <div class="status-name">Mon statut</div></div>` +
  list.map(s=>{
    const v=/\.(mp4|webm|mov)$/i.test(s.media_url);
    const m=v?`<video src="${s.media_url}#t=0.5" muted playsinline preload="metadata"></video>`:`<img src="${s.media_url}" alt="" loading="lazy">`;
    return `<div class="status-item" onclick="openStatus('${s.id}')">
      <div class="status-ring ${seen.includes(s.id)?'seen':''}">${m}</div>
      <div class="status-name">${s.author_name||'Artisan'}</div></div>`;
  }).join('');
}
// ==========================================
// MODULE : Gestion du Profil et des Publications (CamerLink)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Gestion de l'affichage des menus d'options (⋮) sur les publications du profil
  const setupPostOptionsDropdowns = () => {
    document.querySelectorAll('.options-trigger').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = button.nextElementSibling;
        
        // Fermer tous les autres menus ouverts
        document.querySelectorAll('.options-menu').forEach(m => {
          if (m !== menu) m.classList.add('hidden');
        });
        
        // Basculer l'état du menu actuel
        if (menu) {
          menu.classList.toggle('hidden');
        }
      });
    });

    // Fermer les menus si l'on clique n'importe où ailleurs sur la page
    window.addEventListener('click', () => {
      document.querySelectorAll('.options-menu').forEach(menu => {
        menu.classList.add('hidden');
      });
    });
  };

  // 2. Gestion de la suppression professionnelle d'une publication
  const setupPostDeletion = () => {
    document.querySelectorAll('.action-delete').forEach(deleteBtn => {
      deleteBtn.addEventListener('click', (e) => {
        const postCard = e.target.closest('.post-card');
        if (!postCard) return;
        
        const postId = postCard.getAttribute('data-post-id');
        
        // Boîte de dialogue de confirmation professionnelle
        if (confirm("Voulez-vous vraiment supprimer cette publication ? Cette action est irréversible.")) {
          // TODO: Insérer ici l'appel fetch() vers votre API backend/Supabase pour supprimer en base
          // Exemple : fetch(`/api/posts/${postId}`, { method: 'DELETE' }) ...
          
          // Suppression visuelle fluide de la carte dans le DOM
          postCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          postCard.style.opacity = '0';
          postCard.style.transform = 'scale(0.95)';
          
          setTimeout(() => {
            postCard.remove();
            updatePublicationCounter();
          }, 300);
          
          console.log(`Publication ID ${postId} supprimée avec succès.`);
        }
      });
    });
  };

  // 3. Gestion de l'archivage d'une publication
  const setupPostArchiving = () => {
    document.querySelectorAll('.action-archive').forEach(archiveBtn => {
      archiveBtn.addEventListener('click', (e) => {
        const postCard = e.target.closest('.post-card');
        if (!postCard) return;
        
        if (confirm("Voulez-vous archiver cette publication ? Elle ne sera plus visible sur votre profil public.")) {
          postCard.style.display = 'none';
          // TODO: Ajouter la logique d'appel API pour l'archivage
          console.log("Publication archivée avec succès.");
        }
      });
    });
  };

  // 4. Mise à jour dynamique du compteur de publications sur le profil
  const updatePublicationCounter = () => {
    const counterElement = document.querySelector('.stat-item strong'); // Ajustez le sélecteur selon votre HTML
    if (counterElement) {
      let currentCount = parseInt(counterElement.textContent, 10);
      if (!isNaN(currentCount) && currentCount > 0) {
        counterElement.textContent = currentCount - 1;
      }
    }
  };

  // 5. Gestion de la navigation par onglets du profil (Mes Publications / Enregistrés)
  const setupProfileTabs = () => {
    const tabButtons = document.querySelectorAll('.profile-tabs .tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Retirer la classe active de tous les boutons
        tabButtons.forEach(b => b.classList.remove('active'));
        // Activer le bouton cliqué
        e.target.classList.add('active');
        
        // Logique de basculement des conteneurs si nécessaire
        const targetId = e.target.getAttribute('data-target');
        console.log(`Affichage de l'onglet : ${targetId}`);
      });
    });
  };

  // Initialisation des fonctions du profil
  setupPostOptionsDropdowns();
  setupPostDeletion();
  setupPostArchiving();
  setupProfileTabs();
});
// Fonction pour charger le profil depuis Supabase
const loadUserProfile = async (userId) => {
  try {
    // Récupérer les données de la table 'profils' pour un utilisateur spécifique
    const { data, error } = await supabase
      .from('profils')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Erreur lors du chargement du profil :", error.message);
      return;
    }

    if (data) {
      // Mettre à jour les éléments HTML de la page profil
      const usernameEl = document.querySelector('.profile-username');
      const bioEl = document.querySelector('.profile-bio');
      const avatarEl = document.querySelector('.profile-avatar');
      const statsEls = document.querySelectorAll('.profile-stats .stat-item strong');

      if (usernameEl) usernameEl.textContent = data.username || 'Utilisateur';
      if (bioEl) bioEl.textContent = data.bio || 'Ajoutez un message personnel...';
      if (avatarEl && data.avatar_url) avatarEl.src = data.avatar_url;

      // Mise à jour des compteurs (ex: [0] = Publications, [1] = Abonnés, [2] = Abonnements)
      if (statsEls.length >= 3) {
        statsEls[0].textContent = data.posts_count || 0;
        statsEls[1].textContent = data.followers_count || 0;
        statsEls[2].textContent = data.following_count || 0;
      }
    }
  } catch (err) {
    console.error("Erreur technique :", err);
  }
};
// ==========================================
// MODULE : Édition interactive du Profil
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const editBtn = document.getElementById('edit-profile-btn');
  const editForm = document.getElementById('edit-profile-form');
  const saveBtn = document.getElementById('save-profile-btn');
  const cancelBtn = document.getElementById('cancel-profile-btn');
  const bioEl = document.querySelector('.profile-bio');
  const bioInput = document.getElementById('edit-bio-input');

  // ID de l'utilisateur connecté (À adapter selon votre système de session/auth)
  const currentUserId = "VOTRE_UUID_UTILISATEUR_ICI"; 

  // 1. Ouvrir le formulaire d'édition
  if (editBtn && editForm && bioEl) {
    editBtn.addEventListener('click', () => {
      if (bioInput) bioInput.value = bioEl.textContent.trim();
      editForm.classList.remove('hidden');
      editBtn.style.display = 'none'; // Masquer le bouton principal pendant l'édition
    });
  }

  // 2. Annuler l'édition
  if (cancelBtn && editForm && editBtn) {
    cancelBtn.addEventListener('click', () => {
      editForm.classList.add('hidden');
      editBtn.style.display = 'inline-block';
    });
  }

  // 3. Enregistrer les modifications dans Supabase (Table unique 'profils')
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const newBio = bioInput.value.trim();

      // Appel de mise à jour vers Supabase
      const { error } = await supabase
        .from('profils')
        .update({ bio: newBio })
        .eq('id', currentUserId);

      if (error) {
        console.error("Erreur lors de la mise à jour :", error.message);
        alert("Erreur lors de l'enregistrement des modifications.");
      } else {
        // Mettre à jour l'affichage sur la page instantanément
        if (bioEl) bioEl.textContent = newBio;
        
        // Fermer le formulaire
        editForm.classList.add('hidden');
        if (editBtn) editBtn.style.display = 'inline-block';
        
        console.log("Profil mis à jour avec succès !");
      }
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const navButtons = document.querySelectorAll('.app-bottom-nav .nav-btn, .profile-tabs .tab-btn');
  const views = document.querySelectorAll('.app-view');

  navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const targetViewId = button.getAttribute('data-view') || button.getAttribute('data-target');
      if (!targetViewId) return;

      // 1. Mettre à jour l'état actif des boutons de navigation
      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // 2. Basculer les vues avec effet fluide
      views.forEach(view => {
        if (view.id === targetViewId || view.id === button.getAttribute('data-target')) {
          view.classList.remove('hidden');
          // Petit délai pour laisser le temps au DOM d'appliquer le display avant l'animation CSS
          setTimeout(() => view.classList.add('active'), 10);
        } else {
          view.classList.remove('active');
          setTimeout(() => view.classList.add('hidden'), 250); // Correspond à la durée de transition CSS
        }
      });
    });
  });
});
