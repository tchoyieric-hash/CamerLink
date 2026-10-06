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
