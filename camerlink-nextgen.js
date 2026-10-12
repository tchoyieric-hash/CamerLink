/* CamerLink NextGen: améliorations progressives des Reels.
   Dépend de script.js déjà chargé; n'écrase aucune fonction métier existante. */
(() => {
  'use strict';
  const feed = document.getElementById('reels-feed');
  if (!feed) return;

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
  const enhance = (card) => {
    if (!card || card.dataset.nextgen === '1') return;
    const video = card.querySelector('video');
    if (!video) return;
    card.dataset.nextgen = '1';
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('preload', 'metadata');
    video.setAttribute('aria-label', 'Vidéo CamerLink Reels');
    if (!card.querySelector('.cl-reel-topline')) {
      const top = document.createElement('div');
      top.className = 'cl-reel-topline';
      top.innerHTML = '<span class="cl-reel-brand">CAMERLINK · REELS</span>';
      card.appendChild(top);
    }
    if (!card.querySelector('.cl-reel-actions')) {
      const actions = document.createElement('div');
      actions.className = 'cl-reel-actions';
      actions.innerHTML = `
        <button class="cl-reel-action" type="button" data-cl-action="like" aria-label="Ajouter aux favoris" title="Favori">♡</button>
        <button class="cl-reel-action" type="button" data-cl-action="share" aria-label="Partager cette vidéo" title="Partager">↗</button>
        <button class="cl-reel-action" type="button" data-cl-action="fullscreen" aria-label="Plein écran" title="Plein écran">⛶</button>
      `;
      card.appendChild(actions);
    }
    if (!card.querySelector('.cl-reel-progress')) {
      const progress = document.createElement('div');
      progress.className = 'cl-reel-progress';
      progress.setAttribute('aria-hidden', 'true');
      progress.innerHTML = '<span></span>';
      card.appendChild(progress);
    }
    if (!card.querySelector('.cl-reel-status')) {
      const status = document.createElement('div');
      status.className = 'cl-reel-status';
      status.hidden = true;
      status.setAttribute('role', 'status');
      status.innerHTML = '<div class="cl-spinner" aria-hidden="true"></div><strong>Préparation de la vidéo…</strong><p>La lecture démarre dès que votre connexion le permet.</p><button type="button" data-cl-action="retry">Réessayer</button>';
      card.appendChild(status);
    }
    const status = card.querySelector('.cl-reel-status');
    const progress = card.querySelector('.cl-reel-progress span');
    let stallTimer = null;
    const clearStall = () => { if (stallTimer) clearTimeout(stallTimer); stallTimer = null; };
    video.addEventListener('loadstart', () => {
      status.hidden = false;
      status.querySelector('strong').textContent = 'Préparation de la vidéo…';
      status.querySelector('p').textContent = 'La lecture démarre dès que votre connexion le permet.';
      status.querySelector('.cl-spinner').hidden = false;
      status.querySelector('button').hidden = true;
    });
    video.addEventListener('waiting', () => {
      clearStall();
      stallTimer = setTimeout(() => {
        if (video.paused || video.readyState < 3) {
          status.hidden = false;
          status.querySelector('strong').textContent = 'Connexion lente';
          status.querySelector('p').textContent = 'La vidéo prend plus de temps que prévu. Vous pouvez relancer la lecture.';
          status.querySelector('.cl-spinner').hidden = true;
          status.querySelector('button').hidden = false;
        }
      }, 4500);
    });
    video.addEventListener('stalled', () => {
      clearStall();
      stallTimer = setTimeout(() => {
        if (video.readyState < 3) {
          status.hidden = false;
          status.querySelector('strong').textContent = 'Chargement interrompu';
          status.querySelector('p').textContent = 'Vérifiez votre connexion puis réessayez.';
          status.querySelector('.cl-spinner').hidden = true;
          status.querySelector('button').hidden = false;
        }
      }, 5000);
    });
    video.addEventListener('canplay', () => { clearStall(); status.hidden = true; });
    video.addEventListener('playing', () => { clearStall(); status.hidden = true; });
    video.addEventListener('error', () => {
      clearStall();
      status.hidden = false;
      status.querySelector('strong').textContent = 'Vidéo indisponible';
      status.querySelector('p').textContent = 'Le fichier ne peut pas être lu. Vérifiez votre connexion et réessayez.';
      status.querySelector('.cl-spinner').hidden = true;
      status.querySelector('button').hidden = false;
    });
    video.addEventListener('timeupdate', () => {
      if (progress && Number.isFinite(video.duration) && video.duration > 0) {
        progress.style.width = Math.max(0, Math.min(100, video.currentTime / video.duration * 100)) + '%';
      }
    });
    video.addEventListener('ended', () => { if (progress) progress.style.width = '0%'; });
    if (navigator.connection && navigator.connection.saveData) {
      video.setAttribute('preload', 'none');
    }
  };

  const enhanceAll = () => feed.querySelectorAll('.reel-card').forEach(enhance);
  enhanceAll();
  if ('MutationObserver' in window) {
    new MutationObserver(enhanceAll).observe(feed, { childList: true, subtree: true });
  }

  feed.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-cl-action]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const action = button.dataset.clAction;
    const card = button.closest('.reel-card');
    const video = card && card.querySelector('video');
    if (!card || !video) return;
    if (action === 'like') {
      const id = card.dataset.reel;
      if (typeof window.toggleFavorite === 'function') await window.toggleFavorite(id);
      else if (typeof window.toast === 'function') window.toast('Connectez-vous pour ajouter cette annonce aux favoris.');
      const isFavorite = typeof window.getFavorites === 'function' && window.getFavorites().map(String).includes(String(id));
      button.textContent = isFavorite ? '♥' : '♡';
      button.setAttribute('aria-label', isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris');
      return;
    }
    if (action === 'retry') {
      const status = card.querySelector('.cl-reel-status');
      status.hidden = true;
      try {
        video.pause();
        video.currentTime = 0;
        video.load();
        const result = video.play();
        if (result && result.catch) await result.catch(() => {});
      } catch (_) {
        status.hidden = false;
      }
      return;
    }
    if (action === 'fullscreen') {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (card.requestFullscreen) await card.requestFullscreen();
        else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      } catch (_) { /* plein écran non pris en charge par l'appareil */ }
      return;
    }
    if (action === 'share') {
      const title = card.querySelector('strong')?.textContent?.trim() || 'CamerLink Reels';
      const url = location.origin + '/#reels-section';
      try {
        if (navigator.share) await navigator.share({ title, text: 'Découvre cette vidéo sur CamerLink', url });
        else if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
          if (typeof window.toast === 'function') window.toast('Lien CamerLink copié.');
        } else if (typeof window.toast === 'function') window.toast('Partage non disponible sur ce navigateur.');
      } catch (_) { /* partage annulé par l'utilisateur */ }
    }
  }, true);

  // CamerLink Pulse: installation native-like, état réseau et retour en ligne.
  // Aucun accès aux données privées; les invites d'installation restent déclenchées par l'utilisateur.
  let installPrompt = null;
  const pulseStyle = document.createElement('style');
  pulseStyle.textContent = `
    .cl-pulse-bar{position:fixed;z-index:9998;left:12px;right:12px;bottom:12px;display:flex;align-items:center;gap:10px;padding:11px 13px;border:1px solid rgba(34,211,238,.28);border-radius:16px;background:rgba(5,8,20,.94);color:#f8fafc;box-shadow:0 12px 40px rgba(0,0,0,.35);backdrop-filter:blur(18px);font:500 13px/1.35 system-ui,sans-serif}
    .cl-pulse-bar[hidden]{display:none!important}.cl-pulse-copy{flex:1}.cl-pulse-bar button{border:0;border-radius:999px;padding:9px 12px;background:linear-gradient(110deg,#0891b2,#7c3aed);color:#fff;font-weight:800;white-space:nowrap}.cl-pulse-dismiss{background:transparent!important;padding:6px!important;font-size:18px}
    @media(min-width:700px){.cl-pulse-bar{left:auto;right:22px;bottom:22px;max-width:420px}}
    @media(prefers-reduced-motion:no-preference){.cl-pulse-bar{animation:cl-pulse-in .22s ease-out}@keyframes cl-pulse-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}}
  `;
  document.head.appendChild(pulseStyle);
  const pulse = document.createElement('aside');
  pulse.className = 'cl-pulse-bar';
  pulse.hidden = true;
  pulse.setAttribute('role','status');
  pulse.innerHTML = '<span aria-hidden="true">✦</span><span class="cl-pulse-copy"></span><button type="button" class="cl-pulse-primary" hidden></button><button type="button" class="cl-pulse-dismiss" aria-label="Fermer">×</button>';
  document.body.appendChild(pulse);
  const pulseCopy = pulse.querySelector('.cl-pulse-copy');
  const pulsePrimary = pulse.querySelector('.cl-pulse-primary');
  const pulseDismiss = pulse.querySelector('.cl-pulse-dismiss');
  let pulseKind = '';
  const showPulse = (kind, message, actionLabel) => {
    pulseKind = kind;
    pulseCopy.textContent = message;
    pulsePrimary.hidden = !actionLabel;
    pulsePrimary.textContent = actionLabel || '';
    pulse.hidden = false;
  };
  const hidePulse = () => { pulse.hidden = true; pulseKind = ''; };
  pulseDismiss.addEventListener('click', hidePulse);
  pulsePrimary.addEventListener('click', async () => {
    if (pulseKind === 'install' && installPrompt) {
      try {
        installPrompt.prompt();
        await installPrompt.userChoice;
      } catch (_) { /* L'installation reste facultative. */ }
      installPrompt = null;
      hidePulse();
    } else if (pulseKind === 'retry') {
      hidePulse();
      window.location.reload();
    }
  });
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      showPulse('install','Installez CamerLink comme une vraie application pour un accès plus rapide.','Installer');
    }
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    showPulse('installed','CamerLink est installée sur votre appareil.','');
    window.setTimeout(hidePulse, 4500);
  });
  const updateNetworkState = () => {
    if (!navigator.onLine) {
      showPulse('offline','Vous êtes hors connexion. Certaines données et vidéos nécessitent Internet.','');
    } else if (pulseKind === 'offline') {
      showPulse('retry','Connexion rétablie. Actualisez pour récupérer les dernières annonces.','Actualiser');
    }
  };
  window.addEventListener('offline', updateNetworkState);
  window.addEventListener('online', updateNetworkState);
  if (!navigator.onLine) updateNetworkState();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.warn('[CamerLink] Service worker non disponible:', error);
      });
    }, { once: true });
  }

})();
