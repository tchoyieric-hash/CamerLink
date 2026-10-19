/* CamerLink — navigation des 7 espaces, sans remplacer les flux existants */
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const go = (id) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
  };
  function openAuth() { const b = $('#authBtn'); if (b) b.click(); }
  function openMessages() { const b = $('#msgInboxBtn'); if (b) b.click(); else go('messages-section'); }
  function openPublish() { const b = $('#pubBtn'); if (b) b.click(); }
  function build() {
    if ($('#cl-seven-nav')) return;
    const artisan = document.createElement('section');
    artisan.id = 'cl-artisan-space';
    artisan.className = 'cl-page-space';
    artisan.innerHTML = '<div class="cl-space-inner"><p class="cl-eyebrow">ESPACE PROFESSIONNEL</p><h2>Développez votre activité avec <span>CamerLink</span></h2><p>Publiez vos offres, présentez vos réalisations et échangez avec vos clients depuis les outils déjà disponibles.</p><div class="cl-action-grid"><button type="button" data-cl-action="publish">＋ Publier une annonce</button><button type="button" data-cl-action="reel">▶ Ajouter un Reel</button><button type="button" data-cl-action="profile">◉ Ouvrir mon profil</button><button type="button" data-cl-action="messages">▤ Mes messages</button></div><p class="cl-small-note">Connectez-vous pour accéder aux fonctions réservées à votre compte.</p><button type="button" class="cl-primary" data-cl-action="auth">Se connecter / créer un compte</button></div>';
    const profile = $('#profile-section');
    if (profile && profile.parentNode) profile.parentNode.insertBefore(artisan, profile.nextSibling);
    else document.body.appendChild(artisan);
    const nav = document.createElement('nav');
    nav.id = 'cl-seven-nav';
    nav.setAttribute('aria-label','Navigation CamerLink');
    nav.innerHTML = '<button data-cl-go="top" aria-label="Accueil"><b>⌂</b><span>Accueil</span></button><button data-cl-go="listings-grid"><b>▦</b><span>Annonces</span></button><button data-cl-go="reels-section"><b>▶</b><span>Reels</span></button><button data-cl-action="messages"><b>▤</b><span>Messages</span></button><button data-cl-go="profile-section"><b>◉</b><span>Profil</span></button><button data-cl-go="cl-artisan-space"><b>✦</b><span>Artisan</span></button><button data-cl-action="auth"><b>↗</b><span>Compte</span></button>';
    document.body.appendChild(nav);
    nav.addEventListener('click', e => {
      const btn = e.target.closest('button'); if (!btn) return;
      nav.querySelectorAll('button').forEach(x => x.classList.toggle('is-active', x === btn));
      if (btn.dataset.clGo === 'top') { window.scrollTo({top:0,behavior:'smooth'}); return; }
      if (btn.dataset.clGo) { go(btn.dataset.clGo); return; }
      if (btn.dataset.clAction === 'messages') openMessages();
      if (btn.dataset.clAction === 'auth') openAuth();
      if (btn.dataset.clAction === 'publish') openPublish();
      if (btn.dataset.clAction === 'reel') { go('reels-section'); const b=$('#addVideoBtn'); if(b) setTimeout(()=>b.click(),350); }
      if (btn.dataset.clAction === 'profile') go('profile-section');
    });
    document.addEventListener('click', e => {
      const b=e.target.closest('[data-cl-action]'); if(!b || nav.contains(b)) return;
      const a=b.dataset.clAction;
      if(a==='publish') openPublish(); if(a==='auth') openAuth(); if(a==='messages') openMessages();
      if(a==='reel'){go('reels-section'); const x=$('#addVideoBtn'); if(x)setTimeout(()=>x.click(),350);}
      if(a==='profile') go('profile-section');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();