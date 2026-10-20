/* Eight-screen CamerLink navigation layer; preserves existing business logic. */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  function openScreen(screen) {
    document.body.classList.remove('cl-screen-home','cl-screen-reels','cl-screen-profile','cl-screen-market','cl-screen-menu','cl-screen-messages');
    if (screen === 'reels') document.body.classList.add('cl-screen-reels');
    if (screen === 'profile') document.body.classList.add('cl-screen-profile');
    if (screen === 'market') document.body.classList.add('cl-screen-market');
    if (screen === 'menu') document.body.classList.add('cl-screen-menu');
    if (screen === 'messages') document.body.classList.add('cl-screen-messages');
    $$('.cl-eight-shortcut,.cl-nav [data-m]').forEach(el => {
      const key = el.dataset.screen || (el.dataset.m === 'home' ? 'home' : el.dataset.m === 'profil' ? 'profile' : el.dataset.m);
      el.classList.toggle('active', key === screen || (screen === 'market' && key === 'home'));
    });
    if (screen === 'reels') $('#reels-section')?.scrollIntoView({behavior:'smooth',block:'start'});
    else if (screen === 'profile') {
      const profile = $('#profile-section');
      profile?.classList.remove('shell-off');
      profile?.scrollIntoView({behavior:'smooth',block:'start'});
    } else if (screen === 'market') $('#listings-grid')?.scrollIntoView({behavior:'smooth',block:'start'});
    else if (screen === 'messages') {
      const msg = $('#nav-msg') || $('#msgInboxBtn');
      msg?.click();
    } else if (screen === 'publish') {
      const pub = $('#pubBtn') || $('#nav-add');
      pub?.click();
    } else if (screen === 'menu') {
      const space = $('#cl-artisan-space');
      if (space) { space.classList.remove('shell-off'); space.scrollIntoView({behavior:'smooth',block:'start'}); }
      else { const profile = $('#profile-section'); profile?.classList.remove('shell-off'); profile?.scrollIntoView({behavior:'smooth',block:'start'}); }
    } else if (screen === 'community') {
      $('#cl-community')?.scrollIntoView({behavior:'smooth',block:'center'});
    } else window.scrollTo({top:0,behavior:'smooth'});
  }
  function mount() {
    const hero = document.createElement('section');
    hero.className = 'cl-eight-hero';
    hero.id = 'cl-eight-home';
    hero.innerHTML = '<h1>Le Cameroun<br><span>plus proche que jamais !</span></h1><p>Connecte · Partage · Achète · Fais grandir ton business, partout au Cameroun.</p><div class="cl-eight-shortcuts" aria-label="Les huit interfaces CamerLink">'+
      '<button class="cl-eight-shortcut" data-screen="home"><b>⌂</b>Accueil</button>'+
      '<button class="cl-eight-shortcut" data-screen="reels"><b>▶</b>Réels</button>'+
      '<button class="cl-eight-shortcut" data-screen="profile"><b>◉</b>Profil</button>'+
      '<button class="cl-eight-shortcut" data-screen="market"><b>▦</b>Marketplace</button>'+
      '<button class="cl-eight-shortcut" data-screen="messages"><b>▤</b>Messages</button>'+
      '<button class="cl-eight-shortcut" data-screen="publish"><b>＋</b>Publier</button>'+
      '<button class="cl-eight-shortcut" data-screen="menu"><b>☷</b>Mon espace</button>'+
      '<button class="cl-eight-shortcut" data-screen="community"><b>♡</b>Communauté</button></div>';
    const heroTarget = $('.hero') || $('.shops-section') || $('#categoryChips');
    if (heroTarget) heroTarget.insertAdjacentElement('beforebegin', hero);
    const community = document.createElement('section');
    community.className = 'cl-eight-community';
    community.id = 'cl-community';
    community.innerHTML = '<div><h2>🇨🇲 CamerLink — le réseau social qui unit les Camerounais</h2><p>Réseaux & amis · Réels & vidéos · Annonces & business · Messages · Statuts 24h · Géolocalisation</p></div><button type="button" data-screen="publish">Rejoins la communauté&nbsp; →</button>';
    const benefits = document.createElement('section');
    benefits.className = 'cl-eight-benefits';
    benefits.innerHTML = '<div><b>☆</b><span><strong>100% Camerounais</strong><br>Notre pays, notre fierté</span></div><div><b>♢</b><span><strong>Sécurisé</strong><br>Vos données sont protégées</span></div><div><b>ϟ</b><span><strong>Rapide & moderne</strong><br>Une expérience fluide</span></div><div><b>♡</b><span><strong>Proche de toi</strong><br>Partout au Cameroun</span></div>';
    const footer = $('footer');
    if (footer) { footer.insertAdjacentElement('beforebegin', community); community.insertAdjacentElement('afterend', benefits); }
    document.addEventListener('click', e => {
      const trigger = e.target.closest('[data-screen]');
      if (trigger) { e.preventDefault(); openScreen(trigger.dataset.screen); return; }
      const nav = e.target.closest('.cl-nav [data-m]');
      if (nav) {
        const m = nav.dataset.m;
        if (m === 'home') openScreen('home');
        else if (m === 'reels') openScreen('reels');
        else if (m === 'profil') openScreen('profile');
      }
    });
    // Default to the full home/feed view. Existing section and form handlers remain intact.
    document.body.classList.add('cl-screen-home');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();