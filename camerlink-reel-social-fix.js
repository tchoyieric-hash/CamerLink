(() => {
  'use strict';
  const feed = document.getElementById('reels-feed');
  if (!feed) return;
  const style = document.createElement('style');
  style.textContent = `
    #reels-feed .reel-card { position:relative !important; overflow:hidden; }
    #reels-feed .cl-reel-community { display:none !important; }
    #reels-feed .cl-social-rail {
      position:absolute !important; z-index:30 !important; right:10px !important;
      bottom:115px !important; display:flex !important; flex-direction:column !important;
      align-items:center !important; gap:12px !important; width:54px !important;
      pointer-events:auto !important;
    }
    #reels-feed .cl-social-rail button {
      display:flex !important; flex-direction:column !important; align-items:center !important;
      justify-content:center !important; gap:2px !important; min-width:48px !important;
      min-height:48px !important; padding:5px 3px !important; border-radius:999px !important;
      border:1px solid rgba(255,255,255,.45) !important; background:rgba(5,8,20,.88) !important;
      color:#fff !important; font-size:19px !important; font-weight:800 !important;
      line-height:1.1 !important; box-shadow:0 3px 14px #0008 !important; cursor:pointer !important;
      touch-action:manipulation !important;
    }
    #reels-feed .cl-social-rail button small { font-size:10px !important; color:#fff !important; }
    #reels-feed .cl-social-rail button:focus-visible { outline:2px solid #22d3ee !important; }
    @media(max-width:520px) {
      #reels-feed .cl-social-rail { right:7px !important; bottom:105px !important; gap:9px !important; }
      #reels-feed .cl-social-rail button { min-width:44px !important; min-height:44px !important; }
    }
  `;
  document.head.appendChild(style);
  const add = card => {
    if (!card || !card.matches('.reel-card') || !card.dataset.reel || card.querySelector('.cl-social-rail')) return;
    const rail = document.createElement('div');
    rail.className = 'cl-social-rail';
    rail.innerHTML = '<button type="button" data-social="like" aria-label="Aimer ce Reel">🤍<small data-count>0</small></button><button type="button" data-social="comment" aria-label="Commenter ce Reel">💬<small>Commenter</small></button><button type="button" data-social="share" aria-label="Repartager ce Reel">↗<small>Partager</small></button>';
    card.appendChild(rail);
    const sync = () => {
      const old = card.querySelector('.cl-reel-community [data-cl-like]');
      const b = rail.querySelector('[data-social="like"]');
      if (!old || !b) return;
      b.innerHTML = (old.dataset.liked ? '❤️' : '🤍') + '<small data-count>' + (old.querySelector('span')?.textContent || '0') + '</small>';
      b.setAttribute('aria-pressed', old.dataset.liked ? 'true' : 'false');
    };
    rail.addEventListener('click', async e => {
      const b = e.target.closest('button[data-social]');
      if (!b) return;
      e.preventDefault(); e.stopPropagation();
      const type = b.dataset.social;
      if (type === 'like') {
        const original = card.querySelector('.cl-reel-community [data-cl-like]');
        if (original) { original.click(); b.disabled = true; setTimeout(() => { b.disabled = false; sync(); }, 500); }
        else if (typeof window.toast === 'function') window.toast('Like indisponible. Actualisez la page.');
      } else if (type === 'comment') {
        const original = card.querySelector('.cl-reel-community [data-cl-comments]');
        if (original) original.click();
        else if (typeof window.toast === 'function') window.toast('Commentaires indisponibles. Actualisez la page.');
      } else if (type === 'share') {
        const title = card.querySelector('strong')?.textContent?.trim() || 'CamerLink Reels';
        const url = location.origin + '/#reels-section';
        try {
          if (navigator.share) await navigator.share({title, text:'Découvre et repartage ce Reel sur CamerLink', url});
          else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); alert('Lien du Reel copié. Vous pouvez le repartager.'); }
          else prompt('Copiez le lien pour repartager ce Reel :', url);
        } catch (err) { if (err?.name !== 'AbortError') console.warn('[CamerLink] Partage impossible', err); }
      }
    });
    const observer = new MutationObserver(sync);
    const original = card.querySelector('.cl-reel-community');
    if (original) observer.observe(original, {subtree:true, childList:true, attributes:true, characterData:true});
    sync();
  };
  const scan = () => feed.querySelectorAll('.reel-card[data-reel]').forEach(add);
  scan();
  new MutationObserver(scan).observe(feed, {childList:true,subtree:true});
  window.addEventListener('load', scan);
})();