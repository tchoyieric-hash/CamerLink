(() => {
  'use strict';
  const SB_URL = 'https://lviddipduhaelxcvyykc.supabase.co';
  const SB_KEY = 'sb_publishable_j0C8eL1g6hgAcnL4gU_zRg_jvi0bmYH';
  const BUCKET = 'annonces-images';
  const CATS = ['Services', 'Restaurants', 'Boutiques', 'Immobilier', 'Véhicules'];
  const CITIES = ['Yaoundé', 'Douala', 'Kribi', 'Bafoussam', 'Garoua', 'Bamenda', 'Limbe', 'Autre'];

  const sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { autoRefreshToken: false } });
  const $ = (id) => document.getElementById(id);
  const opts = (list) => list.map((v) => `<option value="${v}">${v}</option>`).join('');
  let current = null;

  document.body.insertAdjacentHTML('beforeend', `
    <div id="editModal" class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal-sheet">
        <div class="modal-header">
          <h3>Modifier mon annonce</h3>
          <button type="button" class="modal-close" id="eClose" aria-label="Fermer">×</button>
        </div>
        <form id="editForm">
          <div class="form-group"><label for="eCat">Catégorie</label><select class="form-sheet-el" id="eCat">${opts(CATS)}</select></div>
          <div class="form-group"><label for="eTitle">Titre</label><input class="form-sheet-el" id="eTitle" type="text" required minlength="3" maxlength="120"></div>
          <div class="form-group"><label for="eCity">Ville</label><select class="form-sheet-el" id="eCity">${opts(CITIES)}</select></div>
          <div class="form-group"><label for="ePrice">Prix (FCFA) · 0 = prix à discuter</label><input class="form-sheet-el" id="ePrice" type="number" min="0" step="1" required></div>
          <div class="form-group"><label for="eDesc">Description</label><textarea class="form-sheet-el" id="eDesc" rows="3" required maxlength="2000"></textarea></div>
          <div class="form-group"><label for="eContact">Numéro WhatsApp</label><input class="form-sheet-el" id="eContact" type="tel" required></div>
          <div class="form-group">
            <label for="ePhoto">Nouvelle photo (facultatif)</label>
            <input class="form-sheet-el" id="ePhoto" type="file" accept="image/jpeg,image/png,image/webp">
            <p class="form-hint">Laissez vide pour garder la photo actuelle.</p>
          </div>
          <button type="submit" class="btn-submit-modal" id="eSubmit">Enregistrer les modifications</button>
          <p class="form-error" id="eError" role="alert"></p>
        </form>
      </div>
    </div>`);

  const grid = $('listings-grid');

  function addButtons() {
    grid.querySelectorAll('[data-delete]').forEach((del) => {
      if (del.parentNode.querySelector('[data-edit]')) return;
      const b = document.createElement('button');
      b.className = 'btn-delete';
      b.dataset.edit = del.dataset.delete;
      b.style.cssText = 'border-color:var(--a1);color:var(--a1)';
      b.textContent = 'Modifier mon annonce';
      del.parentNode.insertBefore(b, del);
    });
  }
  new MutationObserver(addButtons).observe(grid, { childList: true });
  addButtons();

  const close = () => $('editModal').classList.remove('active');
  $('eClose').addEventListener('click', close);
  $('editModal').addEventListener('click', (e) => { if (e.target.id === 'editModal') close(); });

  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-edit]');
    if (!b) return;
    const { data, error } = await sb.from('annonces').select('*').eq('id', b.dataset.edit).single();
    if (error || !data) { alert('Impossible de charger cette annonce.'); return; }
    current = data;
    $('eCat').value = data.category;
    $('eTitle').value = data.title || '';
    $('eCity').value = data.city;
    $('ePrice').value = data.price ?? 0;
    $('eDesc').value = data.description || '';
    $('eContact').value = data.contact || '';
    $('ePhoto').value = '';
    $('eError').textContent = '';
    $('editModal').classList.add('active');
  });

  function compress(file, max) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const r = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * r);
        c.height = Math.round(img.height * r);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob((blob) => blob ? resolve(blob) : reject(new Error('compress')), 'image/jpeg', 0.8);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')); };
      img.src = url;
    });
  }

  $('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!current) return;
    const btn = $('eSubmit');
    btn.disabled = true;
    btn.textContent = 'Enregistrement…';
    $('eError').textContent = '';
    try {
      const { data: s } = await sb.auth.getSession();
      if (!s.session) throw new Error('session');
      let imageUrl = current.image_url;
      const file = $('ePhoto').files[0];
      if (file) {
        const blob = await compress(file, 1200);
        const path = `${s.session.user.id}/${Date.now()}.jpg`;
        const up = await sb.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
        if (up.error) throw up.error;
        imageUrl = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      }
      const { error } = await sb.from('annonces').update({
        category: $('eCat').value,
        title: $('eTitle').value.trim(),
        city: $('eCity').value,
        price: Math.max(0, Math.round(Number($('ePrice').value))),
        description: $('eDesc').value.trim(),
        contact: $('eContact').value.trim(),
        image_url: imageUrl
      }).eq('id', current.id);
      if (error) throw error;
      location.reload();
    } catch (ex) {
      console.error(ex);
      $('eError').textContent = 'Modification impossible. Reconnectez-vous et réessayez (photo de moins de 2 Mo).';
      btn.disabled = false;
      btn.textContent = 'Enregistrer les modifications';
    }
  });

  // Icône et installation sur le téléphone
  [['manifest', '/manifest.webmanifest'], ['icon', '/icon-192.png'], ['apple-touch-icon', '/icon-192.png']]
    .forEach(([rel, href]) => {
      const l = document.createElement('link');
      l.rel = rel;
      l.href = href;
      document.head.appendChild(l);
    });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
})();
  // === Disponibilité, carte et urgence ===
  const FRAIS = 12 * 3600 * 1000;
  let geo = {}, me = null, onlyDispo = false, map;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isDispo = (a) => a.disponible && a.disponible_at && Date.now() - new Date(a.disponible_at) < FRAIS;
  const km = (a, b) => { const r = Math.PI / 180; return Math.hypot((b.lng - a.lng) * r * Math.cos(a.lat * r), (b.lat - a.lat) * r) * 6371; };
  const wa = (c) => { const d = String(c || '').replace(/\D/g, ''); return d.length === 9 ? '237' + d : d; };
  const getPos = () => new Promise((ok, ko) => navigator.geolocation ? navigator.geolocation.getCurrentPosition((p) => ok({ lat: p.coords.latitude, lng: p.coords.longitude }), ko, { timeout: 10000 }) : ko());

  document.body.insertAdjacentHTML('beforeend', '<div id="xModal" class="modal-overlay" role="dialog" aria-modal="true"><div class="modal-sheet"><div class="modal-header"><h3 id="xTitle"></h3><button type="button" class="modal-close" id="xClose" aria-label="Fermer">×</button></div><div id="xBody"></div></div></div>');
  const openX = (t, html) => { $('xTitle').textContent = t; $('xBody').innerHTML = html; $('xModal').classList.add('active'); };
  $('xClose').addEventListener('click', () => $('xModal').classList.remove('active'));
  $('xModal').addEventListener('click', (e) => { if (e.target.id === 'xModal') $('xModal').classList.remove('active'); });

  async function loadGeo() {
    const { data } = await sb.from('annonces').select('id,title,contact,city,category,description,lat,lng,disponible,disponible_at');
    geo = {};
    (data || []).forEach((a) => { geo[a.id] = a; });
    decorate();
  }

  function decorate() {
    grid.querySelectorAll('.ad-card').forEach((card) => {
      const b = card.querySelector('[data-report],[data-delete]');
      const a = b && geo[b.dataset.report || b.dataset.delete];
      if (!a) return;
      const d = isDispo(a);
      card.style.display = onlyDispo && !d ? 'none' : '';
      card.querySelectorAll('.x-extra').forEach((n) => n.remove());
      if (d) card.querySelector('.card-img-container').insertAdjacentHTML('beforeend', '<span class="x-extra card-badge-top" style="top:auto;bottom:10px;background:#16a34a">🟢 Disponible maintenant</span>');
      if (me && a.lat != null) card.querySelector('.card-meta').insertAdjacentHTML('beforeend', `<span class="x-extra ad-city">📏 ${km(me, a).toFixed(1)} km</span>`);
      const del = card.querySelector('[data-delete]');
      if (del) del.insertAdjacentHTML('beforebegin', `<button type="button" class="x-extra btn-delete" style="border-color:#16a34a;color:#16a34a" data-dispo="${esc(a.id)}">${d ? '⚪ Je ne suis plus disponible' : '🟢 Je suis disponible maintenant'}</button>`);
    });
  }

  document.addEventListener('click', async (e) => {
    const u = e.target.closest('[data-urg]');
    if (u) { runUrgence(u.dataset.urg); return; }
    const t = e.target.closest('[data-dispo]');
    if (!t) return;
    const a = geo[t.dataset.dispo];
    if (!a) return;
    t.disabled = true;
    try {
      const on = !isDispo(a);
      const patch = { disponible: on, disponible_at: new Date().toISOString() };
      if (on) { const p = await getPos(); patch.lat = Math.round(p.lat * 1000) / 1000; patch.lng = Math.round(p.lng * 1000) / 1000; }
      const { error } = await sb.from('annonces').update(patch).eq('id', a.id);
      if (error) throw error;
      await loadGeo();
    } catch (ex) { alert('Impossible : autorisez la localisation et reconnectez-vous.'); }
    t.disabled = false;
  });

  const loadLeaflet = () => window.L ? Promise.resolve() : new Promise((ok, ko) => {
    const c = document.createElement('link'); c.rel = 'stylesheet'; c.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(c);
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'; s.onload = ok; s.onerror = ko; document.head.appendChild(s);
  });

  async function showMap() {
    openX('🗺️ Artisans autour de moi', '<div id="xMap" style="height:340px;border-radius:12px"></div><p class="form-hint">🟢 = disponible maintenant · positions arrondies à ~100 m</p>');
    try { me = await getPos(); } catch (e) {}
    await loadGeo();
    try { await loadLeaflet(); } catch (e) { $('xBody').innerHTML = '<p class="shop-info">Carte indisponible, vérifiez votre connexion.</p>'; return; }
    const pts = Object.values(geo).filter((a) => a.lat != null);
    if (map) map.remove();
    map = L.map('xMap').setView(me ? [me.lat, me.lng] : [4.05, 9.77], me ? 12 : 6);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    pts.forEach((a) => {
      const d = isDispo(a);
      L.circleMarker([a.lat, a.lng], { radius: 10, color: d ? '#16a34a' : '#8F98B8', fillOpacity: 0.85 }).addTo(map)
        .bindPopup(`<b>${esc(a.title)}</b><br>${d ? '🟢 Disponible' : '⚪ Non disponible'}${me ? '<br>📏 ' + km(me, a).toFixed(1) + ' km' : ''}<br><a href="https://wa.me/${wa(a.contact)}" target="_blank" rel="noopener">WhatsApp</a>`);
    });
    if (me) L.circleMarker([me.lat, me.lng], { radius: 7, color: '#3B82F6' }).addTo(map).bindPopup('Vous êtes ici');
    if (!pts.length) $('xMap').insertAdjacentHTML('afterend', '<p class="form-hint">Aucun artisan n’a encore partagé sa position.</p>');
    setTimeout(() => map.invalidateSize(), 250);
  }

  const URG = { 'Fuite d’eau': /plomb|eau|sanitaire/i, 'Électricité': /[ée]lectric/i, 'Serrure bloquée': /serrur|cl[ée]/i, 'Autre urgence': /./ };
  function showUrgence() {
    openX('🚨 Urgence', '<p class="form-hint">Choisissez votre problème : nous cherchons les artisans disponibles près de vous.</p>' + Object.keys(URG).map((k) => `<button type="button" class="btn-submit-modal" data-urg="${esc(k)}">${esc(k)}</button>`).join(''));
  }
  async function runUrgence(k) {
    $('xBody').innerHTML = '<p class="form-hint">Recherche en cours…</p>';
    await loadGeo();
    let pos = null; try { pos = await getPos(); } catch (e) {}
    let list = Object.values(geo).filter((a) => isDispo(a) && a.lat != null && URG[k].test(`${a.title} ${a.description}`));
    if (pos) list.sort((a, b) => km(pos, a) - km(pos, b));
    list = list.slice(0, 5);
    $('xBody').innerHTML = list.length ? list.map((a) => {
      const msg = encodeURIComponent(`🚨 Urgence : ${k}. Je vous trouve sur CamerLink.` + (pos ? ` Ma position : https://maps.google.com/?q=${pos.lat},${pos.lng}` : ''));
      return `<div class="shop-ad" style="display:block"><b>${esc(a.title)}</b><div class="shop-info">${pos ? '📏 ' + km(pos, a).toFixed(1) + ' km · ' : ''}📍 ${esc(a.city)}</div><a class="whatsapp-link-card" href="https://wa.me/${wa(a.contact)}?text=${msg}" target="_blank" rel="noopener noreferrer">Contacter sur WhatsApp</a></div>`;
    }).join('') : '<p class="shop-info">Aucun artisan disponible pour ce problème pour le moment. Essayez la carte ou la liste des annonces.</p>';
  }

  document.querySelector('.search-filter-bar').insertAdjacentHTML('afterend', '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:12px"><button type="button" class="cat-chip" id="xDispo">🟢 Disponibles maintenant</button><button type="button" class="cat-chip" id="xMapBtn">🗺️ Carte</button><button type="button" class="cat-chip" id="xUrg" style="border-color:#EF4444;color:#EF4444">🚨 Urgence</button></div>');
  $('xDispo').addEventListener('click', () => { onlyDispo = !onlyDispo; $('xDispo').classList.toggle('active', onlyDispo); decorate(); });
  $('xMapBtn').addEventListener('click', showMap);
  $('xUrg').addEventListener('click', showUrgence);
  new MutationObserver(decorate).observe(grid, { childList: true });
  loadGeo();
