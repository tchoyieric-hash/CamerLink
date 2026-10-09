(() => {
  'use strict';
  const SB_URL = 'https://lviddipduhaelxcvyykc.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aWRkaXBkdWhhZWx4Y3Z5eWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1ODExMzcsImV4cCI6MjEwNjE1NzEzN30.L5iaUIW0IQ0hX5uOiOuK-lo_zkf926Xs6CDjCjrpffk';
  const STORY_BUCKET = 'artisan-stories';
  const MAX_MB = 20;
  
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
  
  const sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { autoRefreshToken: false } });

  let allListings = [], stories = [], videos = null, currentUser = null, currentCategory = '';

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

  // Gestion des thèmes
  $('themeBtn').addEventListener('click', () => {
    const html = document.documentElement;
    html.setAttribute('data-theme', html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  // Initialisation filtres et selects
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

  $('searchInput').addEventListener('input', renderListings);
  $('cityFilter').addEventListener('change', renderListings);$('priceFilter').addEventListener('change', renderListings);

  /* ===== 1) GESTION DES FAVORIS ===== */
  window.getFavorites = function() {
    try { return JSON.parse(localStorage.getItem('camerlink_favorites')) || []; } catch (e) { return []; }
  }

  window.toggleFavorite = function(id) {
    let favs = window.getFavorites();
    const index = favs.indexOf(id);
    if (index > -1) {
      favs.splice(index, 1);
      toast('Retiré de vos favoris');
    } else {
      favs.push(id);
      toast('Ajouté à vos favoris');
    }
    localStorage.setItem('camerlink_favorites', JSON.stringify(favs));
    $('favCount').textContent = favs.length;
    renderListings();
  }
  $('favCount').textContent = window.getFavorites().length;

  /* ===== 2) NUMEROS +237 ===== */
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
    const form = $(formId), input =$(inputId);
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

  /* ===== 3) CHARGEMENT DES DONNÉES PRINCIPALES ===== */
  async function loadData() {
    // 1. Annonces (Prioritaire)
    try {
      const res = await sb.from('annonces').select('*').order('created_at', { ascending: false });
      if (!res.error) allListings = res.data || [];
    } catch (err) { allListings = []; }

    // 2. Vidéos
    try {
      const resVid = await sb.from('annonces').select('id,video_url');
      if (!resVid.error) {
        videos = {};
        (resVid.data || []).forEach(a => {
          if (a.video_url && /^https:\/\//i.test(a.video_url)) videos[a.id] = a.video_url;
        });
      }
    } catch (e) { videos = {}; }

    // Affichage immédiat des annonces pour enlever le "Chargement..."
    renderListings();

    // 3. Chargement des Stories en arrière-plan strict (non bloquant)
    loadStoriesSafely();
  }

  /* ===== 4) GESTION DES STORIES (100% ISOLÉ) ===== */
  async function loadStoriesSafely() {
    const container = $('shops-container');
    if (!container) return;

    // Toujours afficher le bouton "Mon statut" par défaut
    renderShopsHTML();

    try {
      const now = new Date().toISOString();
      const { data, error } = await sb.from('artisan_stories')
        .select(`id, media_url, caption, created_at, artisan_id`)
        .gt('expires_at', now)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        stories = data;
        renderShopsHTML();
      }
    } catch (e) {
      // En cas d'erreur réseau ou autre, on laisse le bouton de base sans planter le site
      console.log("Stories en attente.");
    }
  }

  function renderShopsHTML() {
    const container = $('shops-container');
    if (!container) return;

    let html = `
      <div class="shop-story-card cta-card" onclick="openAddStoryModal()">
        <div class="story-ring"><div class="story-avatar-wrap">+</div></div>
        <div class="shop-story-name">Mon statut</div>
      </div>
    `;

    stories.forEach(story => {
      html += `
        <div class="shop-story-card" onclick="viewStory('${esc(story.media_url)}', '${esc(story.caption || '')}', 'Artisan')">
          <div class="story-ring">
            <div class="story-avatar-wrap">A</div>
          </div>
          <div class="shop-story-name">Artisan</div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  window.viewStory = function(mediaUrl, caption, shopName) {
    $('viewerMedia').src = mediaUrl;
    $('viewerCaption').textContent = caption \vert{}\vert{} '';$('viewerShopName').textContent = shopName;
    $('viewerAvatar').src = 'https://via.placeholder.com/150';
    openModal('storyViewerModal');
  }

  window.closeStoryViewer = function() {
    closeModal('storyViewerModal');
  }

  window.openAddStoryModal = function() {
    if (!currentUser) { 
      toast('Connectez-vous pour publier un statut'); 
      openModal('authModal'); 
      return; 
    }
    openModal('publishStoryModal');
  }

  // Soumission du formulaire de statut
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

      if (file.size > MAX_MB * 1024 * 1024) {
        if (errBox) errBox.textContent = `Fichier trop lourd (Max ${MAX_MB} Mo).`;
        return;
      }

      if (errBox) errBox.textContent = '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Publication...'; }

      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${currentUser.id}/${Date.now()}.${fileExt}`;

        const { error: upErr } = await sb.storage.from(STORY_BUCKET).upload(filePath, file, { contentType: file.type });
        if (upErr) throw upErr;

        const { data: { publicUrl } } = sb.storage.from(STORY_BUCKET).getPublicUrl(filePath);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const { error: dbErr } = await sb.from('artisan_stories').insert({
          artisan_id: currentUser.id,
          media_url: publicUrl,
          caption: captionInput ? captionInput.value.trim() : '',
          expires_at: expiresAt
        });

        if (dbErr) throw dbErr;

        closeModal('publishStoryModal');
        fileInput.value = '';
        if (captionInput) captionInput.value = '';
        toast('Statut publié avec succès ! (Visible 24h)');
        loadStoriesSafely();
      } catch (ex) {
        console.error(ex);
        if (errBox) errBox.textContent = 'Erreur lors de la publication.';
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Publier le statut'; }
      }
    });
  }

  /* ===== 5) AFFICHAGE DES ANNONCES & CARTES PRO ===== */
  function renderListings() {
    const grid = $('listings-grid');
    if (!grid) return;
    
    const term = $('searchInput').value.trim().toLowerCase();
    const city = $('cityFilter').value;
    const maxPrice = Number($('priceFilter').value) || 0;
    const favorites = window.getFavorites();

    let filtered = allListings.filter(ad => {
      return (!currentCategory || ad.category === currentCategory) &&
             (!city || ad.city === city) &&
             (!maxPrice || Number(ad.price) <= maxPrice) &&
             (!term || ad.title.toLowerCase().includes(term));
    });

    $('resultsCount').textContent = `${filtered.length} annonce(s)`;
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="state-msg">Aucune annonce disponible pour le moment.</div>';
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
      const vUrl = videos ? videos[ad.id] : null;

      return `
      <article class="ad-card">
        <div class="card-img-container">
          <span class="card-badge-top">${esc(ad.category)}</span>
          <span class="card-views">👁 ${viewsCount}</span>
          <button class="btn-fav ${isFav ? 'active' : ''}" onclick="toggleFavorite('${ad.id}')" style="position:absolute; top:8px; right:8px; width:32px; height:32px; border-radius:50%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; color:${isFav ? '#EF4444' : '#fff'}; z-index:3;">❤️</button>
          ${ad.image_url ? `<img src="${esc(ad.image_url)}" loading="lazy">` : ''}
        </div>
        <div class="card-body">
          <h3 class="ad-title">${esc(ad.title)}</h3>
          <div class="ad-price">${Number(ad.price).toLocaleString('fr-FR')} FCFA</div>
          <p class="ad-desc">${esc(ad.description)}</p>
          
          <div class="ad-rating">⭐ ${rating} <span>(${reviewCount} avis)</span></div>

          <div class="card-meta">
            <span class="ad-city">📍 ${esc(ad.city)}</span>
          </div>

          ${vUrl ? `<button type="button" onclick="showVideoPlayer('${esc(vUrl)}')" style="width:100%; margin-bottom:8px; padding:8px; background:var(--a1); color:#05060D; border-radius:8px; font-weight:700; font-size:0.85rem; cursor:pointer;">▶ Voir la vidéo</button>` : ''}

          ${cleanContact ? `
            <div style="display: flex; gap: 8px;">
              <a href="https://api.whatsapp.com/send?phone=${whatsappNumber}" target="_blank" style="flex: 1; background: #22C55E; color: white; padding: 10px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">WhatsApp</a>
              <a href="tel:${rawContact}" style="flex: 1; background: #10B981; color: white; padding: 10px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">Appel</a>
            </div>
          ` : ''}
        </div>
      </article>`;
    }).join('');
  }

  // Visionneuse de vidéo simple
  if (!$('videoModalOverlay')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="videoModalOverlay" class="modal-overlay" onclick="if(event.target.id==='videoModalOverlay') closeVideoPlayer()">
        <div class="modal-sheet" style="padding:10px; background:#000; max-width:400px;">
          <button type="button" class="modal-close" onclick="closeVideoPlayer()" style="color:#fff; float:right; margin:5px;">×</button>
          <video id="activeVideoPlayer" controls playsinline autoplay style="width:100%; border-radius:12px; max-height:70vh;"></video>
        </div>
      </div>
    `);
  }

  window.showVideoPlayer = function(url) {
    const p = $('activeVideoPlayer');
    p.src = url;
    $('videoModalOverlay').classList.add('active');
  }

  window.closeVideoPlayer = function() {
    const p = $('activeVideoPlayer');
    p.pause();
    p.src = '';
    $('videoModalOverlay').classList.remove('active');
  }

  /* ===== 6) AUTHENTIFICATION ===== */
  sb.auth.onAuthStateChange((_, session) => {
    currentUser = session ? session.user : null;
    $('authBtn').textContent = currentUser ? 'Déconnexion' : 'Connexion';
  });

  $('authBtn').addEventListener('click', async () => {
    if (currentUser) { await sb.auth.signOut(); toast('Déconnecté'); }
    else { openModal('authModal'); }
  });

  const phoneForm = $('phoneForm');
  if (phoneForm) {
    phoneForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = $('authPhone'), err =$('phoneError');
      const phone = normPhone(input.value);
      if (!phone) { err.textContent = 'Numéro invalide. Exemple : 6 91 23 45 67'; return; }
      
      const email = phone.slice(1) + '@phone.camerlink.app';
      const password = $('phonePassword').value;
      err.textContent = '';

      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        const signUp = await sb.auth.signUp({ email, password });
        if (signUp.error) { err.textContent = 'Erreur d’authentification ou mot de passe incorrect'; return; }
      }
      closeModal('authModal');
      toast('Connexion réussie !');
      setTimeout(() => location.reload(), 500);
    });
  }

  $('pubBtn').addEventListener('click', () => {
    if (!currentUser) { toast('Connectez-vous pour publier'); openModal('authModal'); return; }
    openModal('publishModal');
  });

  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeModal(b.dataset.close)));

  // Lancement
  loadData();
})();
