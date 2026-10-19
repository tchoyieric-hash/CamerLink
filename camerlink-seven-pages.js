/* Ajoute l'espace artisan et complète la navigation existante, sans doublon. */
(() => {
'use strict';
const $=s=>document.querySelector(s);
const go=id=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});};
const click=id=>{const el=document.getElementById(id);if(el)el.click();};
function init(){
 if(!$('#cl-artisan-space')){
  const s=document.createElement('section');s.id='cl-artisan-space';s.className='cl-page-space';
  s.innerHTML='<div class="cl-space-inner"><p class="cl-eyebrow">ESPACE PROFESSIONNEL</p><h2>Développez votre activité avec <span>CamerLink</span></h2><p>Publiez vos offres, présentez vos réalisations et échangez avec vos clients depuis les outils disponibles.</p><div class="cl-action-grid"><button type="button" data-cl-action="publish">＋ Publier une annonce</button><button type="button" data-cl-action="reel">▶ Ajouter un Reel</button><button type="button" data-cl-action="profile">◉ Ouvrir mon profil</button><button type="button" data-cl-action="messages">▤ Mes messages</button></div><p class="cl-small-note">Connectez-vous pour accéder aux fonctions réservées à votre compte.</p><button type="button" class="cl-primary" data-cl-action="auth">Se connecter / créer un compte</button></div>';
  const p=$('#profile-section');if(p&&p.parentNode)p.parentNode.insertBefore(s,p.nextSibling);else document.body.appendChild(s);
 }
 const nav=$('.shell-nav');
 if(nav&&!nav.querySelector('[data-cl-page="discover"]')){
  const d=document.createElement('button');d.type='button';d.dataset.clPage='discover';d.innerHTML='<span aria-hidden="true">⌕</span><span>Découvrir</span>';nav.insertBefore(d,nav.lastElementChild);
  const a=document.createElement('button');a.type='button';a.dataset.clPage='artisan';a.innerHTML='<span aria-hidden="true">✦</span><span>Artisan</span>';nav.appendChild(a);
  nav.addEventListener('click',e=>{const b=e.target.closest('[data-cl-page]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(b.dataset.clPage==='artisan')go('cl-artisan-space');else go('discover-section');},true);
 }
 document.addEventListener('click',e=>{const b=e.target.closest('[data-cl-action]');if(!b)return;const a=b.dataset.clAction;if(a==='publish')click('pubBtn');if(a==='auth')click('authBtn');if(a==='messages')click('msgInboxBtn');if(a==='profile')click('nav-me');if(a==='reel'){go('reels-section');setTimeout(()=>click('addVideoBtn'),300);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();