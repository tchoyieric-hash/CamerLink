(() => {
  'use strict';
  // Module stories 100% indépendant et isolé
  window.addEventListener('load', () => {
    setTimeout(async () => {
      const container = document.getElementById('shops-container');
      if (!container) return;

      // 1. Bouton "Mon statut" par défaut
      let html = `
        <div class="shop-story-card cta-card" onclick="if(typeof openAddStoryModal === 'function') openAddStoryModal(); else alert('Connectez-vous pour publier');">
          <div class="story-ring"><div class="story-avatar-wrap">+</div></div>
          <div class="shop-story-name">Mon statut</div>
        </div>
      `;

      try {
        const sb = window.supabase;
        if (sb) {
          const now = new Date().toISOString();
          const { data, error } = await sb.from('artisan_stories')
            .select('id, media_url, caption, created_at')
            .gt('expires_at', now)
            .order('created_at', { ascending: false });

          if (!error && data) {
            data.forEach(story => {
              html += `
                <div class="shop-story-card" onclick="window.open('${story.media_url}', '_blank')">
                  <div class="story-ring"><div class="story-avatar-wrap">A</div></div>
                  <div class="shop-story-name">Artisan</div>
                </div>
              `;
            });
          }
        }
      } catch (e) {
        // En cas d'erreur, on ignore silencieusement
      }

      container.innerHTML = html;
    }, 800);
  });
})();
