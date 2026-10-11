(() => {
  'use strict';

  window.addEventListener('load', () => {
    setTimeout(async () => {
      const container = document.getElementById('shops-container');
      if (!container) return;

      let html = `
        <div class="shop-story-card cta-card"
             onclick="if(typeof openAddStoryModal === 'function') openAddStoryModal(); else alert('Connectez-vous pour publier');">
          <div class="story-ring">
            <div class="story-avatar-wrap">+</div>
          </div>
          <div class="shop-story-name">Mon statut</div>
        </div>
      `;

      try {
        const sb = window.camerlinkSupabase;

        if (sb) {
          const now = new Date().toISOString();

          const { data, error } = await sb
            .from('artisan_stories')
            .select('id, media_url, caption, created_at, expires_at')
            .gt('expires_at', now)
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            data.forEach((story) => {
              const card = document.createElement('div');
              card.className = 'shop-story-card';

              const ring = document.createElement('div');
              ring.className = 'story-ring';

              const avatar = document.createElement('div');
              avatar.className = 'story-avatar-wrap';
              avatar.textContent = 'A';

              const name = document.createElement('div');
              name.className = 'shop-story-name';
              name.textContent = 'Artisan';

              ring.appendChild(avatar);
              card.appendChild(ring);
              card.appendChild(name);

              card.addEventListener('click', () => {
                if (story.media_url) {
                  window.open(
                    story.media_url,
                    '_blank',
                    'noopener,noreferrer'
                  );
                }
              });

              container.appendChild(card);
            });
          }
        }
      } catch (error) {
        console.error('Erreur de chargement des statuts :', error);
      }

      container.insertAdjacentHTML('afterbegin', html);
    }, 800);
  });
})();
