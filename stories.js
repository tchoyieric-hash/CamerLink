(() => {
  'use strict';
  
  // Utilise l'instance Supabase globale de votre site
  const getSupabase = () => window.supabase?.createClient ? null : window.supabase;

  // Injection des styles nécessaires pour les stories et la modale dédiée
  if (!document.getElementById('camerlink-stories-style')) {
    const style = document.createElement('style');
    style.id = 'camerlink-stories-style';
    style.textContent = `
      .shops-section { padding: 12px 16px; overflow: hidden; }
      .shops-container { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }
      .shops-container::-webkit-scrollbar { display: none; }
      .shop-story-card { display: flex; flex-direction: column; align-items: center; cursor: pointer; flex-shrink: 0; width: 70px; text-align: center; }
      .story-ring { width: 62px; height: 62px; border-radius: 50%; background: linear-gradient(45deg, #F59E0B, #EC4899); padding: 2px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
      .story-avatar-wrap { width: 100%; height: 100%; border-radius: 50%; background: var(--bg-card, #1E2235); display: flex; align-items: center; justify-content: center; overflow: hidden; color: #fff; font-weight: 700; font-size: 1.1rem; }
      .story-avatar-wrap img { width: 100%; height: 100%; object-fit: cover; }
      .shop-story-name { font-size: 0.75rem; color: var(--text-main, #fff); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
      .cta-card .story-ring { background: var(--a1, #22D3EE); }
      .story-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; display: none; align-items: center; justify-content: center; }
      .story-modal-overlay.active { display: flex; }
      .story-modal-box { background: var(--bg-card, #16192B); width: 92%; max-width: 400px; border-radius: 16px; padding: 20px; color: #fff; position: relative; }
    `;
    document.head.appendChild(style);
  }

  // Injection de la modale HTML pour poster un statut si elle n'existe pas
  if (!document.getElementById('standaloneStoryModal')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="standaloneStoryModal" class="story-modal-overlay">
        <div class="story-modal-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3 style="margin:0; font-size:1.1rem;">Publier un Statut (24h)</h3>
            <button type="button" id="closeStoryModalBtn" style="background:none; border:none; color:#fff; font-size:1.5rem; cursor:pointer;">×</button>
          </div>
          <form id="standaloneStoryForm">
            <div style="margin-bottom:12px;">
              <label style="display:block; font-size:0.85rem; margin-bottom:5px;">Média (Image ou Vidéo)</label>
              <input type="file" id="stFile" accept="image/jpeg,image/png,image/webp,video/mp4" required style="width:100%; padding:8px; background:rgba(255,255,255,0.05); border-radius:8px; border:1px solid rgba(255,255,255,0.1); color:#fff;">
              <small style="color:#888; font-size:0.75rem;">Max 50 Mo. Expire automatiquement après 24h.</small>
            </div>
            <div style="margin-bottom:15px;">
              <label style="display:block; font-size:0.85rem; margin-bottom:5px;">Légende (max 200 caractères)</label>
              <textarea id="stCaption" rows="2" maxlength="200" placeholder="Votre texte..." style="width:100%; padding:8px; background:rgba(255,255,255,0.05); border-radius:8px; border:1px solid rgba(255,255,255,0.1); color:#fff; resize:none;"></textarea>
            </div>
            <button type="submit" id="stSubmitBtn" style="width:100%; padding:10px; background:var(--a1,#22D3EE); color:#05060D; border:none; border-radius:8px; font-weight:700; cursor:pointer;">Publier</button>
            <p id="stErr" style="color:#EF4444; font-size:0.8rem; margin-top:8px; text-align:center;"></p>
          </form>
        </div>
      </div>
    `);
  }

  // Logique principale de chargement et d'affichage des stories
  async function initStories() {
    const container = document.getElementById('shops-container');
    if (!container) return;

    const sb = window.supabase;
    if (!sb) return;

    let activeStories = [];
    try {
      const now = new Date().toISOString();
      const { data, error } = await sb.from('artisan_stories')
        .select(`id, media_url, caption, created_at, artisan_id, profiles (full_name, phone)`)
        .gt('expires_at', now)
        .order('created_at', { ascending: false });

      if (!error) activeStories = data || [];
    } catch (e) {
      activeStories = [];
    }

    // Construction du HTML de la section des statuts
    let html = `
      <div class="shop-story-card cta-card" id="triggerAddStory">
        <div class="story-ring"><div class="story-avatar-wrap">+</div></div>
        <div class="shop-story-name">Mon statut</div>
      </div>
    `;

    activeStories.forEach(story => {
      const name = story.profiles?.full_name || 'Artisan';
      const initial = name.charAt(0).toUpperCase();
      html += `
        <div class="shop-story-card" data-storyurl="${story.media_url}" data-caption="${encodeURIComponent(story.caption || '')}" data-shopname="${encodeURIComponent(name)}">
          <div class="story-ring">
            <div class="story-avatar-wrap">${initial}</div>
          </div>
          <div class="shop-story-name">${name}</div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Événement pour ouvrir la modale de publication
    document.getElementById('triggerAddStory').addEventListener('click', async () => {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) {
        alert('Veuillez vous connecter pour publier un statut.');
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.add('active');
        return;
      }
      document.getElementById('standaloneStoryModal').classList.add('active');
    });

    // Événement pour fermer la modale
    document.getElementById('closeStoryModalBtn').addEventListener('click', () => {
      document.getElementById('standaloneStoryModal').classList.remove('active');
    });

    // Gestion du clic sur un statut existant pour le visionner
    container.querySelectorAll('.shop-story-card:not(.cta-card)').forEach(card => {
      card.addEventListener('click', () => {
        const url = card.dataset.storyurl;
        const cap = decodeURIComponent(card.dataset.caption);
        const name = decodeURIComponent(card.dataset.shopname);
        
        // Utilise la modale de visionnage existante dans votre index.html si elle est présente
        const viewer = document.getElementById('storyViewerModal');
        const vMedia = document.getElementById('viewerMedia');
        const vShop = document.getElementById('viewerShopName');
        const vCap = document.getElementById('viewerCaption');

        if (viewer && vMedia) {
          vMedia.src = url;
          if (vShop) vShop.textContent = name;
          if (vCap) vCap.textContent = cap;
          viewer.classList.add('active');
        } else {
          window.open(url, '_blank');
        }
      });
    });
  }

  // Gestion de la soumission du formulaire de publication
  const storyForm = document.getElementById('standaloneStoryForm');
  if (storyForm) {
    storyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('stFile');
      const captionInput = document.getElementById('stCaption');
      const errBox = document.getElementById('stErr');
      const submitBtn = document.getElementById('stSubmitBtn');

      const file = fileInput.files[0];
      if (!file) return;

      if (file.size > 50 * 1048576) {
        errBox.textContent = 'Le fichier est trop lourd (Maximum 50 Mo).';
        return;
      }

      errBox.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Publication en cours...';

      try {
        const sb = window.supabase;
        const { data: { session } } = await sb.auth.getSession();
        if (!session) throw new Error('Non connecté');

        const fileExt = file.name.split('.').pop();
        const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;
        const bucket = file.type.startsWith('video') ? 'artisan-stories' : 'artisan-stories';

        // Upload vers le Storage Supabase
        const { error: upErr } = await sb.storage.from(bucket).upload(filePath, file, { contentType: file.type });
        if (upErr) throw upErr;

        // Récupération de l'URL publique
        const { data: { publicUrl } } = sb.storage.from(bucket).getPublicUrl(filePath);

        // Insertion dans la table artisan_stories
        const { error: dbErr } = await sb.from('artisan_stories').insert({
          artisan_id: session.user.id,
          media_url: publicUrl,
          caption: captionInput.value.trim()
        });

        if (dbErr) throw dbErr;

        document.getElementById('standaloneStoryModal').classList.remove('active');
        fileInput.value = '';
        captionInput.value = '';
        alert('Statut publié avec succès !');
        initStories();
      } catch (ex) {
        console.error(ex);
        errBox.textContent = 'Erreur lors de la publication. Réessayez.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publier';
      }
    });
  }

  // Lancement au chargement de la page
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStories);
  } else {
    initStories();
  }
})();
