(() => {
  'use strict';
  const SB_URL = 'https://lviddipduhaelxcvyykc.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aWRkaXBkdWhhZWx4Y3Z5eWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1ODExMzcsImV4cCI6MjEwNjE1NzEzN30.L5iaUIW0IQ0hX5uOiOuK-lo_zkf926Xs6CDjCjrpffk';
  const STORY_BUCKET = 'artisan-stories';
  const AD_BUCKET = 'annonces-images';
  const MAX_STORY_MB = 50;
  const MAX_AD_IMG_MB = 2;
  const FETCH_TIMEOUT = 8000;
  const STORY_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
  const AD_IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const CATEGORIES = [
    { value: 'Services', chip: '🛠 Services' },
    { value: 'Restaurants', chip: '🍽 Gastronomie' },
    { value: 'Boutiques', chip: '🛍 Boutiques' },
    { value: 'Immobilier', chip: '🏠 Immobilier' }
  ];
  const CITIES = ['Yaoundé', 'Douala', 'Kribi', 'Bafoussam', 'Garoua'];

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

  let allListings = [], videos = {}, currentUser = null, currentCategory = '', favOnly = false;
  let storyGroups = [];
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
  const closeModal = (id) => $(id).classList.remove('active');

  /* ===== THÈME ===== */
  $('themeBtn').addEventListener('click', () => {
    const html = document.documentElement;
    html.setAttribute('data-theme', html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ===== FILTRES ===== */
  $('cityFilter').innerHTML = '<option value="">Toutes les villes</option>' + CITIES.map(c => `<option value="${c}">${c}</option>`).join('');
  $('adCity').innerHTML = CITIES.map(c => `<option value="${c}">${c}</option>`).join('');
  $('adCategory').innerHTML = CATEGORIES.map(c => `<option value="${c.value}">${c.value}</option>`).join('');
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
  $('cityFilter').addEventListener('change', () => renderListings());
  $('priceFilter').addEventListener('change', () => renderListings());

  /* ===== FAVORIS ===== */
  window.getFavorites = function () {
    try { return JSON.parse(localStorage.getItem('camerlink_favorites')) || []; } catch (e) { return []; }
  };

  window.toggleFavorite = function (id) {
    id = String(id);
    const favs = window.getFavorites();
    const index = favs.indexOf(id);
    if (index > -1) { favs.splice(index, 1); toast('Retiré de vos favoris'); }
    else { favs.push(id); toast('Ajouté à vos favoris'); }
    try { localStorage.setItem('camerlink_favorites', JSON.stringify(favs)); } catch (e) { /* stockage indisponible */ }
    $('favCount').textContent = favs.length;
    renderListings();
  };
  $('favCount').textContent = window.getFavorites().length;

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
    try {
      const res = await withTimeout(sb.from('annonces').select('*').order('created_at', { ascending: false }));
      if (!res.error) allListings = res.data || [];
    } catch (err) { /* on garde la liste actuelle */ }

    videos = {};
    allListings.forEach(a => {
      if (a.video_url && /^https:\/\//i.test(a.video_url)) videos[a.id] = a.video_url;
    });
    renderListings();
  }

  async function loadData() {
    await loadListings();
    loadStoriesSafely(); // en arrière-plan, ne bloque jamais la page
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
    try {
      const r = await withTimeout(sb.from('etablissements').select('user_id, name, logo_url').in('user_id', ids));
      if (!r.error) (r.data || []).forEach(e => { out[e.user_id] = e; });
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
    if (card.dataset.action === 'add') window.openAddStoryModal();
    else openViewer(Number(card.dataset.group));
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
    $('viewerShopName').textContent = name;
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

      try {
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const filePath = `${currentUser.id}/${Date.now()}.${ext}`;

        const { error: upErr } = await sb.storage.from(STORY_BUCKET).upload(filePath, file, { contentType: file.type });
        if (upErr) throw upErr;

        const { data: { publicUrl } } = sb.storage.from(STORY_BUCKET).getPublicUrl(filePath);
        const caption = captionInput ? captionInput.value.trim() : '';

        // expires_at est rempli par la base (24 h)
        const { error: dbErr } = await sb.from('artisan_stories').insert({
          artisan_id: currentUser.id,
          media_url: publicUrl,
          caption: caption || null
        });
        if (dbErr) throw dbErr;

        closeModal('publishStoryModal');
        fileInput.value = '';
        if (captionInput) captionInput.value = '';
        toast('Statut publié ! (visible 24 h)');
        loadStoriesSafely();
      } catch (ex) {
        console.error(ex);
        if (errBox) errBox.textContent = 'Erreur lors de la publication : ' + (ex && ex.message ? ex.message : 'réessayez.');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Publier le statut'; }
      }
    });
  }

  /* ===== PUBLICATION D'UNE ANNONCE ===== */
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
      const file = $('adImage').files[0];

      if (title.length < 3 || title.length > 120) return setErr('Le titre doit faire entre 3 et 120 caractères.');
      if (description.length > 2000) return setErr('La description est trop longue (2000 caractères max).');
      if (!Number.isFinite(price) || price < 0) return setErr('Prix invalide.');
      if (!file) return setErr('Ajoutez une photo.');
      if (!AD_IMG_TYPES.includes(file.type)) return setErr('Photo : jpg, png ou webp uniquement.');
      if (file.size > MAX_AD_IMG_MB * 1024 * 1024) return setErr(`Photo trop lourde (max ${MAX_AD_IMG_MB} Mo).`);

      if (btn) { btn.disabled = true; btn.textContent = 'Publication...'; }
      try {
        const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
        const path = `${currentUser.id}/${Date.now()}.${ext}`;
        const up = await sb.storage.from(AD_BUCKET).upload(path, file, { contentType: file.type });
        if (up.error) throw up.error;
        const { data: { publicUrl } } = sb.storage.from(AD_BUCKET).getPublicUrl(path);

        const { error } = await sb.from('annonces').insert({
          title,
          category: $('adCategory').value,
          city: $('adCity').value,
          price,
          description,
          contact,
          image_url: publicUrl
        });
        if (error) throw error;

        closeModal('publishModal');
        adForm.reset();
        toast('Annonce publiée !');
        await loadListings();
      } catch (ex) {
        console.error(ex);
        setErr('Erreur : ' + (ex && ex.message ? ex.message : 'réessayez.'));
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Publier'; }
      }
    });
  }

  /* ===== AFFICHAGE DES ANNONCES ===== */
  function renderListings() {
    const grid = $('listings-grid');
    if (!grid) return;

    const term = $('searchInput').value.trim().toLowerCase();
    const city = $('cityFilter').value;
    const maxPrice = Number($('priceFilter').value) || 0;
    const favorites = window.getFavorites();

    const filtered = allListings.filter(ad =>
      (!favOnly || favorites.includes(String(ad.id))) &&
      (!currentCategory || ad.category === currentCategory) &&
      (!city || ad.city === city) &&
      (!maxPrice || Number(ad.price) <= maxPrice) &&
      (!term || String(ad.title || '').toLowerCase().includes(term))
    );

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
      const rawContact = String(ad.contact || '');
      const cleanContact = rawContact.replace(/\D/g, '');
      const whatsappNumber = cleanContact.startsWith('237') ? cleanContact : '237' + cleanContact;
      const viewsCount = ad.views || ad.vues || 0;
      const vUrl = videos[ad.id];

      return `
      <article class="ad-card">
        <div class="card-img-container">
          <span class="card-badge-top">${esc(ad.category)}</span>
          <span class="card-views">👁 ${viewsCount}</span>
          <button type="button" class="btn-fav ${isFav ? 'active' : ''}" data-fav="${esc(ad.id)}" aria-label="Favori" style="position:absolute; top:8px; right:8px; width:32px; height:32px; border-radius:50%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; color:${isFav ? '#EF4444' : '#fff'}; z-index:3;">❤️</button>
          ${ad.image_url ? `<img src="${esc(ad.image_url)}" loading="lazy" alt="">` : ''}
        </div>
        <div class="card-body">
          <h3 class="ad-title">${esc(ad.title)}</h3>
          <div class="ad-price">${Number(ad.price || 0).toLocaleString('fr-FR')} FCFA</div>
          <p class="ad-desc">${esc(ad.description)}</p>
          <div class="ad-rating">⭐ ${rating} <span>(${reviewCount} avis)</span></div>
          <div class="card-meta"><span class="ad-city">📍 ${esc(ad.city)}</span></div>

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
    if (msg) window.openChat(msg.dataset.msg, msg.dataset.ad ? Number(msg.dataset.ad) : null);
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
  sb.auth.onAuthStateChange((_, session) => {
    const prev = currentUser && currentUser.id;
    currentUser = session ? session.user : null;
    $('authBtn').textContent = currentUser ? 'Déconnexion' : 'Connexion';
    if (prev !== (currentUser && currentUser.id)) setTimeout(subscribeMessages, 0);
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

  $('pubBtn').addEventListener('click', () => {
    if (!currentUser) { toast('Connectez-vous pour publier'); openModal('authModal'); return; }
    openModal('publishModal');
  });

  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeModal(b.dataset.close)));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    window.closeStoryViewer();
    window.closeVideoPlayer();
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  });

  loadData();
})();
