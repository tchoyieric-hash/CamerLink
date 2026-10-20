/* CamerLink — navigation des 8 interfaces de la maquette. Les écrans utilisent les fonctions existantes de l'application. */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const screenClasses = ['cl-screen-home','cl-screen-reels','cl-screen-profile','cl-screen-market','cl-screen-menu','cl-screen-messages'];
  function setActive(screen) {
    $$('.cl-eight-shortcut').forEach(el => el.classList.toggle('active', el.dataset.screen === screen));
    $$('.cl-nav [data-m],.cl-tabs [data-m]').forEach(el => {
      const m = el.dataset.m;
      el.classList.toggle('active', (screen === 'home' && m === 'home') || (screen === 'reels' && m === 'reels') || (screen === 'profile' && m === 'profil') || (screen === 'market' && m === 'annonces'));
    });
  }
  function mode(name) {
    if (window.CamerLinkShell && typeof window.CamerLinkShell.setMode === 'function') {
      try { window.CamerLinkShell.setMode(name); } catch (_) {}
    }
  }
  function openScreen(screen) {
    document.body.classList.remove(...screenClasses);
    if (screen === 'home') document.body.classList.add('cl-screen-home');
    if (screen === 'reels') document.body.classList.add('cl-screen-reels');
    if (screen === 'profile') document.body.classList.add('cl-screen-profile');
    if (screen === 'market') document.body.classList.add('cl-screen-market');
    if (screen === 'menu') document.body.classList.add('cl-screen-menu');
    if (screen === 'messages') document.body.classList.add('cl-screen-messages');
    setActive(screen);
    if (screen === 'home') { mode('home'); window.scrollTo({top:0,behavior:'smooth'}); }
    else if (screen === 'reels') { mode('reels'); $('#reels-section')?.scrollIntoView({behavior:'smooth',block:'start'}); }
    else if (screen === 'profile') { mode('profil'); const p=$('#profile-section'); p?.classList.remove('shell-off'); p?.scrollIntoView({behavior:'smooth',block:'start'}); }
    else if (screen === 'market') { mode('annonces'); ($('#listings-grid') || $('main'))?.scrollIntoView({behavior:'smooth',block:'start'}); }
    else if (screen === 'messages') { const b=$('#msgInboxBtn'); if (b) b.click(); else $('#nav-msg')?.click(); }
    else if (screen === 'publish') { const b=$('#pubBtn') || $('#nav-add'); b?.click(); }
    else if (screen === 'menu') { mode('artisan'); const s=$('#cl-artisan-space'); if(s){s.classList.remove('shell-off');s.scrollIntoView({behavior:'smooth',block:'start'});} else {mode('profil');$('#profile-section')?.scrollIntoView({behavior:'smooth',block:'start'});} }
    else if (screen === 'community') { $('#cl-community')?.scrollIntoView({behavior:'smooth',block:'center'}); }
  }
  function mount() {
    if ($('#cl-eight-home')) return;
    const hero = document.createElement('section');
    hero.className='cl-eight-hero'; hero.id='cl-eight-home';
    hero.innerHTML='<div class="cl-home-eyebrow"><span></span> LE RÉSEAU QUI RAPPROCHE LE CAMEROUN</div><h1>Tout le Cameroun.<br><span>À portée de main.</span></h1><p>Découvre, partage, échange et trouve ce qu’il te faut près de toi.</p><div class="cl-eight-shortcuts" aria-label="Navigation CamerLink">'+
      '<button class="cl-eight-shortcut" data-screen="home"><b>⌂</b>Accueil</button>'+
      '<button class="cl-eight-shortcut" data-screen="market"><b>▧</b>Annonces & photos</button>'+
      '<button class="cl-eight-shortcut" data-screen="reels"><b>▶</b>Réels</button>'+
      '<button class="cl-eight-shortcut" data-screen="messages"><b>▤</b>Messages</button>'+
      '<button class="cl-eight-shortcut" data-screen="profile"><b>◉</b>Profil</button>'+
      '<button class="cl-eight-shortcut" data-screen="publish"><b>＋</b>Publier</button></div>';

    const target=$('.hero') || $('.shops-section') || $('#categoryChips');
    if(target) target.insertAdjacentElement('beforebegin',hero);
    const community=document.createElement('section');
    community.className='cl-eight-community'; community.id='cl-community';
    community.innerHTML='<div><h2>🇨🇲 CamerLink — le réseau social qui unit les Camerounais</h2><p>Réseaux & amis · Réels & vidéos · Annonces & business · Messages · Statuts 24h · Géolocalisation</p></div><button type="button" data-screen="publish">Rejoins la communauté&nbsp; →</button>';
    const benefits=document.createElement('section');
    benefits.className='cl-eight-benefits';
    benefits.innerHTML='<div><b>☆</b><span><strong>100% Camerounais</strong><br>Notre pays, notre fierté</span></div><div><b>♢</b><span><strong>Sécurisé</strong><br>Vos données sont protégées</span></div><div><b>ϟ</b><span><strong>Rapide & moderne</strong><br>Une expérience fluide</span></div><div><b>♡</b><span><strong>Proche de toi</strong><br>Partout au Cameroun</span></div>';
    const footer=$('footer');
    if(footer){footer.insertAdjacentElement('beforebegin',community);community.insertAdjacentElement('afterend',benefits);}
    document.addEventListener('click',e=>{
      const trigger=e.target.closest('[data-screen]');
      if(trigger){e.preventDefault();openScreen(trigger.dataset.screen);return;}
      const nav=e.target.closest('.cl-nav [data-m],.cl-tabs [data-m]');
      if(!nav)return;
      const m=nav.dataset.m;
      if(m==='home')openScreen('home');
      else if(m==='reels')openScreen('reels');
      else if(m==='profil')openScreen('profile');
      else if(m==='annonces')openScreen('market');
      else if(m==='artisan')openScreen('menu');
    });
    document.body.classList.add('cl-screen-home');
    setActive('home');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();