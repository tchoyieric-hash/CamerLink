(() => {
  'use strict';
  const SB_URL = 'https://lviddipduhaelxcvyykc.supabase.co';
  const SB_KEY = 'sb_publishable_j0C8eL1g6hgAcnL4gU_zRg_jvi0bmYH';
  const VBUCKET = 'annonces-videos';
  const MAX_MB = 20;
  const TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]
  ));
  const sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { autoRefreshToken: false } });

  function toast(msg) {
    const t = $('toast');
    if (!t) { alert(msg); return; }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 3500);
  }

  /* ===== 1) NUMEROS +237 ===== */
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
        if (er) er.textContent = 'Numéro WhatsApp invalide. Exemple : 6 91 23 45 67';
        return;
      }
      input.value = n;
    }, true);
  }
  guardPhone('adForm', 'adContact', 'pubError');
  guardPhone('proForm', 'proContact', 'proError');
  guardPhone('editForm', 'eContact', 'eError');

  function fixWa(root) {
    if (!root) return;
    root.querySelectorAll('a[href^="https://wa.me/"]').forEach((a) => {
      try {
        const u = new URL(a.href);
        const n = normPhone(decodeURIComponent(u.pathname.slice(1)));
        if (!n) return;
        u.pathname = '/' + n.slice(1);
        if (u.toString() !== a.href) a.href = u.toString();
      } catch (e) {}
    });
  }

  /* ===== 2) CONNEXION ===== */
  const phoneForm = $('phoneForm');
  if (phoneForm) {
    phoneForm.addEventListener('submit', async (e) => {
      const input = $('authPhone'), err =$('phoneError');
      const phone = normPhone(input.value);
      if (!phone) {
        e.preventDefault();
        e.stopImmediatePropagation();
        err.textContent = 'Numéro invalide. Exemple : 6 91 23 45 67';
        return;
      }
      input.value = phone;
      const active = document.querySelector('[data-pmode].active');
      if (!active || active.dataset.pmode !== 'login') return;

      e.preventDefault();
      e.stopImmediatePropagation();
      const btn = $('phoneSubmit');
      const password = $('phonePassword').value;
      err.textContent = '';
      btn.disabled = true;

      const emails = [phone.slice(1) + '@phone.camerlink.app'];
      if (/^\+237\d{9}$/.test(phone)) emails.push('237' + phone.slice(4) + '@camerlink.app');

      let ok = false, last = null;
      try {
        for (const email of emails) {
          const { error } = await sb.auth.signInWithPassword({ email, password });
          if (!error) { ok = true; break; }
          last = error;
          if (!/invalid login/i.test(error.message || '')) break;
        }
      } catch (ex) { last = ex; }

      if (ok) {
        $('authModal').classList.remove('active');
        toast('Connexion réussie.');
        setTimeout(() => location.reload(), 500);
        return;
      }
      const m = String((last && last.message) || '');
      err.textContent = /invalid login/i.test(m) ? 'Numéro ou mot de passe incorrect.'
        : /rate limit|too many/i.test(m) ? 'Trop de tentatives. Patientez une minute.'
        : 'Une erreur est survenue. Réessayez.';
      btn.disabled = false;
    }, true);
  }

  /* ===== 3) GESTION DES FAVORIS (LocalStorage) ===== */
  function getFavoris() {
    try {
      return JSON.parse(localStorage.getItem('camerlink_favoris')) || [];
    } catch (e) {
      return [];
    }
  }

  function toggleFavori(annonceId) {
    let favoris = getFavoris();
    const index = favoris.indexOf(annonceId);

    if (index > -1) {
      favoris.splice(index, 1);
      toast('Annonce retirée des favoris.');
    } else {
      favoris.push(annonceId);
      toast('Annonce ajoutée aux favoris ❤️');
    }

    localStorage.setItem('camerlink_favoris', JSON.stringify(favoris));
    decorate();
  }

  /* ===== 4) COMPTEUR DE VUES ===== */
  async function incrementerVues(id) {
    try {
      // Incrémentation basique sécurisée dans Supabase (nécessite une colonne 'vues' de type int dans la table annonces)
      const { data } = await sb.from('annonces').select('vues').eq('id', id).single();
      const currentVues = (data && data.vues) ? data.vues : 0;
      await sb.from('annonces').update({ vues: currentVues + 1 }).eq('id', id);
    } catch (e) {}
  }

  /* ===== 5) VIDEOS ===== */
  let videos = null;
  async function loadVideos() {
    try {
      const { data, error } = await sb.from('annonces').select('id,video_url');
      if (error) { videos = null; return; }
      videos = {};
      (data || []).forEach((a) => {
        if (a.video_url && /^https:\/\//i.test(a.video_url)) videos[a.id] = a.video_url;
      });
    } catch (e) { videos = null; }
  }

  /* ===== 6) FILTRAGE GLOBAL (Ville, Catégorie & Recherche) ===== */
  async function filtrerGlobal() {
    try {
      const selectVille = document.querySelector('select');
      const villeCible = selectVille ? selectVille.value : '';
      const catActive = document.querySelector('[data-cat].active')?.textContent.trim() || 'Tout voir';
      const inputRecherche = document.querySelector('input[type="text"], input[placeholder*="recherchez"]');
      const motCle = inputRecherche ? inputRecherche.value.trim() : '';

      let query = sb.from('annonces').select('*');

      if (villeCible && villeCible !== 'Toutes les villes' && villeCible !== '') {
        query = query.eq('ville', villeCible);
      }
      if (catActive && catActive !== 'Tout voir') {
        query = query.eq('categorie', catActive);
      }
      if (motCle !== '') {
        query = query.or(`titre.ilike.%${motCle}%,description.ilike.%${motCle}%`);
      }

      const { data, error } = await query;
      if (error) return;

      afficherAnnoncesFiltrees(data);
    } catch (err) {}
  }

  function afficherAnnoncesFiltrees(liste) {
    const grid = $('listings') \vert{}\vert{}$('listings-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!liste || liste.length === 0) {
      grid.innerHTML = '<p style="color: #fff; text-align: center; grid-column: 1/-1; padding: 30px;">Aucune annonce trouvée.</p>';
      return;
    }

    liste.forEach(annonce => {
      const cardHTML = `
        <div class="card ad-card" data-id="${esc(annonce.id)}">
          <h3>${esc(annonce.titre)}</h3>
          <p class="desc">${esc(annonce.description)}</p>
          <span class="prix">${esc(annonce.prix)} FCFA</span>
          <span class="ville">📍 ${esc(annonce.ville)}</span>
        </div>
      `;
      grid.innerHTML += cardHTML;
    });

    decorate();
  }

  document.addEventListener('change', (e) => {
    if (e.target.tagName === 'SELECT') filtrerGlobal();
  });

  document.addEventListener('input', (e) => {
    if (e.target.type === 'text' && (e.target.placeholder?.toLowerCase().includes('recherch') || e.target.id.includes('search'))) {
      filtrerGlobal();
    }
  });

  const st = document.createElement('style');
  st.textContent = '.v-btn{display:block;width:100%;margin-top:10px;padding:11px;border-radius:var(--radius-md,12px);border:1px solid var(--a1,#22D3EE);background:transparent;color:var(--a1,#22D3EE);font-weight:700;font-size:.9rem;cursor:pointer}.v-play{background:var(--a1,#22D3EE);color:#05060D}.btn-fav{border-color:#ff4757 !important;}';
  document.head.appendChild(st);

  document.body.insertAdjacentHTML('beforeend',
    '<div id="vModal" class="modal-overlay" role="dialog" aria-modal="true"><div class="modal-sheet">' +
    '<div class="modal-header"><h3 id="vTitle"></h3><button type="button" class="modal-close" id="vClose" aria-label="Fermer">×</button></div>' +
    '<div id="vBody"></div></div></div>');

  const openV = (title, html) => { $('vTitle').textContent = title; $('vBody').innerHTML = html; $('vModal').classList.add('active'); };
  const closeV = () => {
    const v = $('vBody').querySelector('video');
    if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
    $('vBody').innerHTML = '';$('vModal').classList.remove('active');
  };
  $('vClose').addEventListener('click', closeV);$('vModal').addEventListener('click', (e) => { if (e.target.id === 'vModal') closeV(); });

  const grid = $('listings') \vert{}\vert{}$('listings-grid');
  function decorate() {
    if (!grid) return;
    const favoris = getFavoris();

    grid.querySelectorAll('.card, .ad-card').forEach((card) => {
      const delBtn = card.querySelector('.btn-del');
      let id = card.dataset.id || null;
      if (!id && delBtn) {
        const match = delBtn.getAttribute('onclick')?.match(/\d+/);
        if (match) id = match[0];
      }

      card.querySelectorAll('.v-extra').forEach((n) => n.remove());
      if (!id) return;

      const estFav = favoris.includes(String(id));
      const desc = card.querySelector('.desc, .ad-desc');

      if (desc) {
        // Bouton Favori
        desc.insertAdjacentHTML('afterend',
          `<button type="button" class="v-extra v-btn btn-fav" data-fav="${esc(id)}" style="background:${estFav ? '#ff4757' : 'transparent'};color:${estFav ? '#fff' : '#ff4757'}">
            ${estFav ? '❤️ Retirer des favoris' : '🤍 Ajouter aux favoris'}
          </button>`);

        // Bouton Vidéo si dispo
        if (videos !== null && videos[id]) {
          desc.insertAdjacentHTML('afterend',
            `<button type="button" class="v-extra v-btn v-play" data-vplay="${esc(id)}">▶ Voir la vidéo</button>`);
        }
      }

      if (delBtn) {
        const hasVid = videos !== null && !!videos[id];
        delBtn.insertAdjacentHTML('beforebegin',
          `<button type="button" class="v-extra v-btn" data-vadd="${esc(id)}">🎬 ${hasVid ? 'Changer la vidéo' : 'Ajouter une vidéo'}</button>`);
      }
    });
    fixWa(grid);
  }

  function showPlayer(id) {
    const url = videos && videos[id];
    if (!url) return;
    incrementerVues(id); // Incrémente le compteur de vues à l'ouverture
    openV('🎬 Vidéo',
      `<video src="${esc(url)}" controls playsinline autoplay preload="metadata" style="width:100%;max-height:70vh;border-radius:12px;background:#000"></video>`);
  }

  function showUploader(id) {
    const has = !!(videos && videos[id]);
    openV(has ? '🎬 Changer la vidéo' : '🎬 Ajouter une vidéo',
      `<p class="form-hint">Vidéo courte (15 secondes conseillées), ${MAX_MB} Mo maximum, format MP4.</p>
       <div class="form-group"><input class="form-sheet-el" id="vFile" type="file" accept="video/mp4,video/webm,video/quicktime"></div>
       <video id="vPrev" controls playsinline style="display:none;width:100%;max-height:45vh;border-radius:12px;background:#000;margin-bottom:12px"></video>
       <button type="button" class="btn-submit-modal" id="vSend" data-id="${esc(id)}">Envoyer la vidéo</button>
       ${has ? `<button type="button" class="btn-delete" id="vRemove" data-id="${esc(id)}" style="margin-top:10px">Supprimer la vidéo</button>` : ''}
       <p class="form-error" id="vErr" role="alert"></p>`);
  }

  const pathOf = (url) => {
    const i = String(url || '').indexOf('/' + VBUCKET + '/');
    return i < 0 ? null : decodeURIComponent(url.slice(i + VBUCKET.length + 2).split('?')[0]);
  };
  async function removeFile(url) {
    const p = pathOf(url);
    if (!p) return;
    try { await sb.storage.from(VBUCKET).remove([p]); } catch (e) {}
  }

  async function sendVideo(id) {
    const f = $('vFile').files[0], err = $('vErr'), btn =$('vSend');
    err.textContent = '';
    if (!f) { err.textContent = 'Choisissez une vidéo.'; return; }
    if (!TYPES.includes(f.type)) { err.textContent = 'Format non pris en charge. Utilisez une vidéo MP4.'; return; }
    if (f.size > MAX_MB * 1048576) {
      err.textContent = `Vidéo trop lourde (${(f.size / 1048576).toFixed(1)} Mo). Maximum ${MAX_MB} Mo.`;
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Envoi en cours… patientez';
    try {
      const { data: s } = await sb.auth.getSession();
      if (!s.session) throw new Error('session');
      const ext = f.type === 'video/webm' ? 'webm' : f.type === 'video/quicktime' ? 'mov' : 'mp4';
      const path = `${s.session.user.id}/${Date.now()}.${ext}`;
      const up = await sb.storage.from(VBUCKET).upload(path, f, { contentType: f.type });
      if (up.error) throw up.error;
      const url = sb.storage.from(VBUCKET).getPublicUrl(path).data.publicUrl;
      const r = await sb.from('annonces').update({ video_url: url }).eq('id', id).select('id');
      if (r.error || !r.data || !r.data.length) {
        await removeFile(url);
        throw r.error || new Error('non autorisé');
      }
      const old = videos[id];
      videos[id] = url;
      if (old) removeFile(old);
      closeV();
      decorate();
      toast('Vidéo ajoutée.');
    } catch (ex) {
      err.textContent = 'Envoi impossible. Vérifiez votre connexion.';
      btn.disabled = false;
      btn.textContent = 'Envoyer la vidéo';
    }
  }

  async function dropVideo(id) {
    if (!confirm('Supprimer cette vidéo ?')) return;
    const err = $('vErr');
    const r = await sb.from('annonces').update({ video_url: null }).eq('id', id).select('id');
    if (r.error || !r.data || !r.data.length) { err.textContent = 'Suppression impossible.'; return; }
    removeFile(videos[id]);
    delete videos[id];
    closeV();
    decorate();
    toast('Vidéo supprimée.');
  }

  document.addEventListener('click', (e) => {
    const fav = e.target.closest('[data-fav]');
    if (fav) { toggleFavori(fav.dataset.fav); return; }
    const play = e.target.closest('[data-vplay]');
    if (play) { showPlayer(play.dataset.vplay); return; }
    const add = e.target.closest('[data-vadd]');
    if (add) { showUploader(add.dataset.vadd); return; }
    const send = e.target.closest('#vSend');
    if (send) { sendVideo(send.dataset.id); return; }
    const rm = e.target.closest('#vRemove');
    if (rm) dropVideo(rm.dataset.id);
  });

  document.addEventListener('change', (e) => {
    if (e.target.id !== 'vFile') return;
    const f = e.target.files[0], prev = $('vPrev');
    if (!prev) return;
    prev.style.display = f ? 'block' : 'none';
    if (f) prev.src = URL.createObjectURL(f);
  });

  if (grid) new MutationObserver(decorate).observe(grid, { childList: true });
  
  const shopBodyEl = $('shopBody');
  if (shopBodyEl) new MutationObserver(() => fixWa(shopBodyEl)).observe(shopBodyEl, { childList: true });
  
  const xBodyEl = $('xBody');
  if (xBodyEl) new MutationObserver(() => fixWa(xBodyEl)).observe(xBodyEl, { childList: true });

  decorate();
  loadVideos().then(decorate);
})();
