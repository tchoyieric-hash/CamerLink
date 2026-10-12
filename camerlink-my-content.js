(() => {
  'use strict';
  const db = window.camerlinkSupabase;
  if (!db) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const style = document.createElement('style');
  style.textContent = `
    #cl-my-content-btn{border:1px solid rgba(239,68,68,.55);border-radius:10px;padding:9px 12px;background:rgba(239,68,68,.12);color:inherit;font-weight:700;cursor:pointer}
    #cl-my-content-modal{z-index:10050}
    #cl-my-content-list{display:grid;gap:10px;max-height:60vh;overflow:auto}
    .cl-my-content-item{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--color-border,rgba(127,127,127,.25));border-radius:12px}
    .cl-my-content-item>div{min-width:0;flex:1}
    .cl-my-content-item strong{display:block;overflow-wrap:anywhere}
    .cl-my-content-item small{opacity:.72}
    .cl-delete-btn{padding:9px 11px;border:0;border-radius:9px;background:#b91c1c;color:white;font-weight:800;cursor:pointer;flex-shrink:0}
    .cl-delete-btn:disabled{opacity:.55;cursor:wait}
    #cl-my-content-note{font-size:.82rem;opacity:.8;margin:8px 0 14px}
  `;
  document.head.appendChild(style);

  function mount() {
    if (!document.getElementById('cl-my-content-btn')) {
      const host = document.querySelector('.header-actions');
      if (host) {
        const btn = document.createElement('button');
        btn.id = 'cl-my-content-btn'; btn.type = 'button'; btn.textContent = '🗑️ Mes contenus';
        btn.addEventListener('click', openManager);
        const pub = document.getElementById('pubBtn');
        host.insertBefore(btn, pub || null);
      }
    }
    if (!document.getElementById('cl-my-content-modal')) {
      const modal = document.createElement('div');
      modal.id = 'cl-my-content-modal'; modal.className = 'modal-overlay';
      modal.innerHTML = '<div class="modal-sheet"><div class="modal-header"><h3>🗑️ Gérer mes contenus</h3><button type="button" class="modal-close" data-cl-my-close aria-label="Fermer">×</button></div><p id="cl-my-content-note">Supprimez uniquement les contenus de votre compte. Cette action est définitive.</p><div id="cl-my-content-list"><p>Ouvrez cette rubrique pour charger vos contenus.</p></div><p id="cl-my-content-status" role="status"></p></div>';
      document.body.appendChild(modal);
      modal.querySelector('[data-cl-my-close]').addEventListener('click', () => modal.classList.remove('active'));
      modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
      modal.querySelector('#cl-my-content-list').addEventListener('click', handleDelete);
    }
  }

  async function openManager() {
    mount();
    const modal = document.getElementById('cl-my-content-modal');
    const list = document.getElementById('cl-my-content-list');
    const status = document.getElementById('cl-my-content-status');
    modal.classList.add('active'); list.innerHTML = '<p>Chargement de vos contenus…</p>'; status.textContent = '';
    const { data: auth, error: authError } = await db.auth.getUser();
    const user = auth && auth.user;
    if (authError || !user) {
      list.innerHTML = '<p>Connectez-vous pour gérer vos contenus.</p>';
      return;
    }
    const [adsResult, storiesResult] = await Promise.all([
      db.from('annonces').select('id,title,video_url,created_at').eq('user_id', user.id).order('created_at', {ascending:false}),
      db.from('artisan_stories').select('id,caption,media_url,created_at').eq('artisan_id', user.id).order('created_at', {ascending:false})
    ]);
    if (adsResult.error && storiesResult.error) {
      list.innerHTML = '<p>Impossible de charger vos contenus. Vérifiez votre connexion et les autorisations de la base de données.</p>';
      status.textContent = (adsResult.error.message || storiesResult.error.message || '').slice(0,180);
      return;
    }
    const ads = adsResult.data || [], stories = storiesResult.data || [];
    const html = [
      ...ads.map(a => '<article class="cl-my-content-item"><div><strong>'+esc(a.title || 'Annonce sans titre')+'</strong><small>Publication'+(a.video_url ? ' · contient un Reel/vidéo' : '')+'</small></div><button class="cl-delete-btn" type="button" data-cl-delete="ad" data-id="'+esc(a.id)+'">Supprimer</button></article>'),
      ...stories.map(s => '<article class="cl-my-content-item"><div><strong>'+esc(s.caption || 'Statut sans légende')+'</strong><small>Statut · '+esc(s.created_at ? new Date(s.created_at).toLocaleDateString('fr-FR') : '')+'</small></div><button class="cl-delete-btn" type="button" data-cl-delete="story" data-id="'+esc(s.id)+'">Supprimer</button></article>')
    ].join('');
    list.innerHTML = html || '<p>Vous n’avez encore aucune publication ou statut à supprimer.</p>';
    if (adsResult.error || storiesResult.error) status.textContent = 'Une catégorie n’a pas pu être chargée : '+(adsResult.error?.message || storiesResult.error?.message || '').slice(0,140);
    status.dataset.userId = user.id;
  }

  async function removeStorageObject(bucket, publicUrl) {
    if (!publicUrl) return;
    try {
      const url = new URL(publicUrl);
      const marker = '/storage/v1/object/public/' + bucket + '/';
      const at = url.pathname.indexOf(marker);
      if (at < 0) return;
      const path = decodeURIComponent(url.pathname.slice(at + marker.length));
      if (path) await db.storage.from(bucket).remove([path]);
    } catch (_) {}
  }

  async function handleDelete(event) {
    const button = event.target.closest('[data-cl-delete]');
    if (!button) return;
    const type = button.dataset.clDelete, id = button.dataset.id;
    const label = type === 'ad' ? 'cette publication (et son Reel éventuel)' : 'ce statut';
    if (!confirm('Voulez-vous vraiment supprimer '+label+' ? Cette action est définitive.')) return;
    button.disabled = true; button.textContent = 'Suppression…';
    const { data: auth } = await db.auth.getUser();
    if (!auth?.user) { button.disabled=false; button.textContent='Supprimer'; alert('Reconnectez-vous.'); return; }
    try {
      if (type === 'ad') {
        const { data: row, error: readError } = await db.from('annonces').select('id,user_id,image_url,video_url').eq('id', id).eq('user_id', auth.user.id).single();
        if (readError) throw readError;
        const { error } = await db.from('annonces').delete().eq('id', id).eq('user_id', auth.user.id);
        if (error) throw error;
        if (row) {
          await removeStorageObject('annonces-images', row.image_url);
          await removeStorageObject('annonces-videos', row.video_url);
        }
      } else if (type === 'story') {
        const { data: row, error: readError } = await db.from('artisan_stories').select('id,artisan_id,media_url').eq('id', id).eq('artisan_id', auth.user.id).single();
        if (readError) throw readError;
        const { error } = await db.from('artisan_stories').delete().eq('id', id).eq('artisan_id', auth.user.id);
        if (error) throw error;
        if (row) await removeStorageObject('artisan-stories', row.media_url);
      }
      button.closest('.cl-my-content-item')?.remove();
      const list = document.getElementById('cl-my-content-list');
      if (list && !list.querySelector('.cl-my-content-item')) list.innerHTML = '<p>Il ne reste aucun contenu dans cette liste.</p>';
      document.getElementById('cl-my-content-status').textContent = 'Contenu supprimé.';
      setTimeout(() => location.reload(), 700);
    } catch (error) {
      button.disabled = false; button.textContent = 'Réessayer';
      document.getElementById('cl-my-content-status').textContent = 'Suppression impossible : '+String(error?.message || 'autorisation ou connexion indisponible').slice(0,180);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true}); else mount();
})();
