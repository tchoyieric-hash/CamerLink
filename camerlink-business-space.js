(() => {
'use strict';
if (window.CamerLinkBusinessSpaceLoaded || !window.supabase) return;
window.CamerLinkBusinessSpaceLoaded = true;
const URL = 'https://lviddipduhaelxcvyykc.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aWRkaXBkdWhhZWx4Y3Z5eWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1ODExMzcsImV4cCI6MjEwNjE1NzEzN30.L5iaUIW0IQ0hX5uOiOuK-lo_zkf926Xs6CDjCjrpffk';
const db = window.supabase.createClient(URL, KEY);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let me = null, ownBusiness = null;
const css = document.createElement('style');
css.textContent = `
#businessSpaceModal{position:fixed;inset:0;z-index:10050;background:#030712ef;display:none;align-items:center;justify-content:center;padding:12px}
#businessSpaceModal.active{display:flex}
#businessSpaceModal .bs-sheet{width:min(100%,760px);max-height:92vh;overflow:auto;background:var(--color-surface,#111827);color:var(--color-text-main,#fff);border:1px solid #22d3ee55;border-radius:22px;padding:20px;box-shadow:0 20px 80px #0009}
#businessSpaceModal .bs-top{display:flex;justify-content:space-between;align-items:center;gap:12px}
#businessSpaceModal h2{font-size:1.35rem;margin:0 0 6px}
#businessSpaceModal .bs-muted{opacity:.72;font-size:.88rem}
#businessSpaceModal .bs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
#businessSpaceModal .bs-field{display:flex;flex-direction:column;gap:5px;font-size:.86rem}
#businessSpaceModal input,#businessSpaceModal textarea,#businessSpaceModal select{width:100%;box-sizing:border-box;padding:11px;border-radius:10px;border:1px solid #94a3b855;background:var(--color-surface,#111827);color:inherit;font:inherit}
#businessSpaceModal textarea{min-height:90px}
#businessSpaceModal .bs-btn{border:0;border-radius:11px;padding:11px 14px;background:linear-gradient(90deg,#22d3ee,#8b5cf6);color:#06111b;font-weight:800;cursor:pointer}
#businessSpaceModal .bs-btn:disabled{opacity:.5}
#businessSpaceModal .bs-ghost{border:1px solid #94a3b855;border-radius:11px;padding:9px 12px;background:transparent;color:inherit;cursor:pointer}
#businessSpaceModal .bs-card{padding:14px;margin:10px 0;border:1px solid #94a3b833;border-radius:14px}
#businessSpaceModal h3{margin-bottom:4px}
#businessSpaceModal .bs-status{min-height:22px;font-size:.88rem;margin-top:8px}
#businessSpaceModal .bs-options{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:9px}
#businessSpaceModal .bs-option{border:1px solid #94a3b833;border-radius:13px;padding:12px}
#businessSpaceModal .bs-option strong{display:block;margin-bottom:5px}
`;
document.head.appendChild(css);
function mountPublicShowcase(){
 if(document.getElementById('business-public-showcase'))return;
 const section=document.createElement('section');
 section.id='business-public-showcase';
 section.setAttribute('aria-labelledby','business-public-title');
 section.style.cssText='padding:24px 16px;max-width:1180px;margin:0 auto;width:100%;box-sizing:border-box;';
 section.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px"><div><p style="margin:0;color:#22d3ee;font-size:.78rem;font-weight:800;letter-spacing:.12em">COMMERCES LOCAUX</p><h2 id="business-public-title" style="margin:4px 0;font-size:1.45rem">🍽️ Restaurants & vitrines</h2><p style="margin:0;opacity:.75">Découvrez les restaurants, boutiques et entreprises sur CamerLink.</p></div><button type="button" id="business-showcase-open" class="btn-icon" style="width:auto;padding:10px 14px">🏢 Ouvrir Business Space</button></div><div id="business-public-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:12px"><p style="opacity:.75">Chargement des vitrines…</p></div>';
 const hero=document.querySelector('.hero');
 if(hero)hero.insertAdjacentElement('afterend',section);else document.body.prepend(section);
 section.querySelector('#business-showcase-open').addEventListener('click',open);
 loadPublicShowcase();
}
async function loadPublicShowcase(){
 const root=document.getElementById('business-public-cards');if(!root)return;
 try{
  const r=await db.from('business_spaces').select('id,name,category,description,city,address,phone,whatsapp,opening_hours,logo_url,website_url').eq('status','published').order('created_at',{ascending:false}).limit(12);
  if(r.error)throw r.error;
  const rows=r.data||[];
  if(!rows.length){root.innerHTML='<p style="opacity:.75">Aucune vitrine publiée pour le moment. Les restaurants et entreprises pourront apparaître ici dès leur publication.</p>';return}
  root.innerHTML=rows.map(v=>'<article style="border:1px solid #22d3ee33;border-radius:16px;padding:14px;background:var(--color-surface,rgba(15,23,42,.6));min-width:0">'+(v.logo_url?'<img src="'+esc(v.logo_url)+'" alt="" loading="lazy" style="width:100%;height:120px;object-fit:cover;border-radius:10px;margin-bottom:10px">':'')+'<p style="margin:0 0 5px;color:#22d3ee;font-size:.78rem;font-weight:800">'+esc(v.category||'Entreprise')+'</p><h3 style="margin:0 0 6px;font-size:1.05rem">'+esc(v.name)+'</h3>'+(v.city?'<p style="margin:0 0 6px;opacity:.75">📍 '+esc(v.city)+'</p>':'')+'<p style="margin:0 0 10px;opacity:.85;overflow-wrap:anywhere">'+esc((v.description||'').slice(0,180))+'</p>'+(v.opening_hours?'<p style="margin:0 0 8px;font-size:.86rem">🕒 '+esc(v.opening_hours)+'</p>':'')+(v.whatsapp?'<a target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:0 8px 8px 0" href="https://wa.me/'+esc(String(v.whatsapp).replace(/\\D/g,''))+'">WhatsApp</a>':'')+'<button type="button" data-business-open="'+esc(v.id)+'" style="display:block;border:1px solid #22d3ee66;border-radius:10px;padding:9px 12px;background:transparent;color:inherit;cursor:pointer">Voir les vitrines</button></article>').join('');
  root.querySelectorAll('[data-business-open]').forEach(el=>el.addEventListener('click',open));
 }catch(e){root.innerHTML='<p style="opacity:.75">Les vitrines sont momentanément indisponibles. Réessayez après actualisation.</p>';console.warn('[CamerLink Business Space] vitrine publique:',e)}
}
function mount(){
 if(document.getElementById('businessSpaceModal'))return;
 const btn=document.createElement('button');btn.type='button';btn.id='businessSpaceBtn';btn.className='btn-icon';btn.title='CamerLink Business Space';btn.setAttribute('aria-label','CamerLink Business Space');btn.textContent='🏢';
 const actions=document.querySelector('.header-actions');if(actions){const artisan=document.getElementById('artisanSpaceBtn');if(artisan)artisan.insertAdjacentElement('afterend',btn);else actions.prepend(btn)}
 const modal=document.createElement('div');modal.id='businessSpaceModal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','bsTitle');
 modal.innerHTML=`<div class="bs-sheet"><div class="bs-top"><div><h2 id="bsTitle">🏢 CamerLink Business Space</h2><p class="bs-muted">Une vitrine gratuite pour votre entreprise. Les options payantes sont sur demande, sans paiement automatique.</p></div><button type="button" class="bs-ghost" data-bs-close aria-label="Fermer">✕</button></div><div id="bsContent"><p>Chargement…</p></div><p id="bsStatus" class="bs-status" role="status" aria-live="polite"></p></div>`;
 document.body.appendChild(modal);
 btn.addEventListener('click',open);modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-bs-close]'))close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
}
function close(){const m=document.getElementById('businessSpaceModal');if(m)m.classList.remove('active')}
async function auth(){try{const r=await db.auth.getUser();me=r.data?.user||null}catch(_){me=null}return me}
function askLogin(){const m=document.getElementById('authModal');if(m)m.classList.add('active');else alert('Connectez-vous à CamerLink pour gérer votre entreprise.')}
function status(t){const e=document.getElementById('bsStatus');if(e)e.textContent=t}
async function open(){mount();const m=document.getElementById('businessSpaceModal');m.classList.add('active');status('');await auth();await render()}
function field(label,id,placeholder='',type='text',value=''){return '<label class="bs-field">'+label+'<input id="'+id+'" type="'+type+'" maxlength="1000" placeholder="'+placeholder+'" value="'+esc(value)+'"></label>'}
function renderForm(v){
 v=v||{};return `<section class="bs-card"><h3>${v.id?'Modifier ma vitrine':'Créer ma vitrine gratuite'}</h3><p class="bs-muted">Restaurant, boutique, hôtel, salon, supermarché, agence et autres entreprises.</p><form id="bsForm"><div class="bs-grid">
 <label class="bs-field">Nom de l'entreprise<input id="bsName" required maxlength="120" value="${esc(v.name||'')}" placeholder="Ex. Restaurant Le Bon Goût"></label>
 <label class="bs-field">Catégorie<select id="bsCategory" required><option value="">Choisir une catégorie</option>${['Restaurant','Boutique','Hôtel','Supermarché','Beauté & bien-être','Immobilier','Transport','Agence / services','Loisirs','Autre'].map(c=>'<option '+(v.category===c?'selected':'')+'>'+c+'</option>').join('')}</select></label>
 ${field('Ville','bsCity','Douala, Yaoundé…','text',v.city||'')}${field('Adresse','bsAddress','Quartier, rue…','text',v.address||'')}${field('Téléphone','bsPhone','6 XX XX XX XX','tel',v.phone||'')}${field('WhatsApp','bsWhatsapp','2376XXXXXXXX','tel',v.whatsapp||'')}${field('Horaires','bsHours','Lun-Sam : 8h-20h','text',v.opening_hours||'')}${field('Site web (facultatif)','bsWebsite','https://…','url',v.website_url||'')}${field('URL du logo (facultatif)','bsLogo','https://…','url',v.logo_url||'')}${field('URL de la couverture (facultatif)','bsCover','https://…','url',v.cover_url||'')}</div>
 <label class="bs-field" style="margin-top:10px">Présentation<textarea id="bsDescription" maxlength="2000" placeholder="Présentez votre entreprise, vos produits et vos services…">${esc(v.description||'')}</textarea></label><p class="bs-muted">Ne saisissez que des informations publiques. La vitrine sera visible après publication.</p><button class="bs-btn" type="submit" style="margin-top:12px">Enregistrer la vitrine</button></form></section>`
}
async function render(){
 const c=document.getElementById('bsContent');if(!c)return;
 if(!me){c.innerHTML='<section class="bs-card"><h3>Connectez-vous pour commencer</h3><p class="bs-muted">Votre vitrine est gratuite. Connectez-vous pour la créer et la gérer.</p><button class="bs-btn" id="bsLogin">Connexion</button></section>'+await publicCards();document.getElementById('bsLogin').onclick=askLogin;return}
 let r=await db.from('business_spaces').select('*').eq('owner_id',me.id).order('created_at',{ascending:false}).limit(1);
 if(r.error){c.innerHTML='<section class="bs-card"><h3>Configuration nécessaire</h3><p class="bs-muted">La base Business Space doit être installée avant de pouvoir enregistrer les vitrines.</p><p class="bs-muted">Erreur technique : '+esc(r.error.message)+'</p></section>'+await publicCards();return}
 ownBusiness=(r.data||[])[0]||null;
 c.innerHTML=renderForm(ownBusiness)+(ownBusiness?'<section class="bs-card"><h3>🚀 Gagner en visibilité</h3><p class="bs-muted">La vitrine reste gratuite. Envoyez une demande à l’équipe pour connaître les options et leurs tarifs.</p><div class="bs-options"><div class="bs-option"><strong>📣 Mise en avant</strong><p class="bs-muted">Demander une meilleure visibilité.</p><button class="bs-ghost" data-bs-plan="boost">Demander</button></div><div class="bs-option"><strong>✓ Profil vérifié</strong><p class="bs-muted">Demander une vérification de l’entreprise.</p><button class="bs-ghost" data-bs-plan="verified">Demander</button></div><div class="bs-option"><strong>🎯 Campagne sponsorisée</strong><p class="bs-muted">Demander une campagne promotionnelle.</p><button class="bs-ghost" data-bs-plan="campaign">Demander</button></div></div><p class="bs-muted">Aucun paiement n’est prélevé dans cette version.</p></section>':'')+await publicCards();
 const form=document.getElementById('bsForm');if(form)form.addEventListener('submit',save);
 c.querySelectorAll('[data-bs-plan]').forEach(b=>b.addEventListener('click',()=>requestVisibility(b.dataset.bsPlan,b)));
}
async function publicCards(){
 const r=await db.from('business_spaces').select('id,name,category,description,city,address,phone,whatsapp,opening_hours,logo_url,website_url').eq('status','published').order('created_at',{ascending:false}).limit(24);
 if(r.error)return '<section class="bs-card"><h3>Vitrines des entreprises</h3><p class="bs-muted">La liste publique sera disponible après installation de la migration Business Space dans Supabase.</p></section>';
 const rows=r.data||[];return '<section class="bs-card"><h3>Découvrir les entreprises</h3><p class="bs-muted">Vitrines gratuites sur CamerLink</p>'+(rows.length?rows.map(b=>'<article class="bs-card">'+(b.logo_url?'<img src="'+esc(b.logo_url)+'" alt="" loading="lazy" style="width:58px;height:58px;object-fit:cover;border-radius:12px;float:right">':'')+'<h3>'+esc(b.name)+'</h3><p class="bs-muted">'+esc(b.category)+' · '+esc(b.city)+'</p><p>'+esc(b.description)+'</p>'+(b.address?'<p>📍 '+esc(b.address)+'</p>':'')+(b.opening_hours?'<p>🕒 '+esc(b.opening_hours)+'</p>':'')+(b.phone?'<p>☎ '+esc(b.phone)+'</p>':'')+(b.whatsapp?'<p><a target="_blank" rel="noopener noreferrer" href="https://wa.me/'+esc(b.whatsapp.replace(/\D/g,''))+'">Contacter sur WhatsApp</a></p>':'')+(b.website_url?'<p><a target="_blank" rel="noopener noreferrer" href="'+esc(b.website_url)+'">Site web</a></p>':'')+'</article>').join(''):'<p class="bs-muted">Aucune vitrine publiée pour le moment. Soyez la première entreprise !</p>')+'</section>'
}
async function save(e){
 e.preventDefault();if(!me){askLogin();return}
 const b=e.submitter;b.disabled=true;status('Enregistrement…');
 const row={owner_id:me.id,name:document.getElementById('bsName').value.trim(),category:document.getElementById('bsCategory').value,city:document.getElementById('bsCity').value.trim(),address:document.getElementById('bsAddress').value.trim(),phone:document.getElementById('bsPhone').value.trim(),whatsapp:document.getElementById('bsWhatsapp').value.trim(),opening_hours:document.getElementById('bsHours').value.trim(),website_url:document.getElementById('bsWebsite').value.trim(),logo_url:document.getElementById('bsLogo').value.trim(),cover_url:document.getElementById('bsCover').value.trim(),description:document.getElementById('bsDescription').value.trim(),status:'published',updated_at:new Date().toISOString()};
 try{let r=ownBusiness?await db.from('business_spaces').update(row).eq('id',ownBusiness.id).eq('owner_id',me.id).select().single():await db.from('business_spaces').insert(row).select().single();if(r.error)throw r.error;ownBusiness=r.data;status('Vitrine enregistrée. Elle est gratuite et visible sur CamerLink.');await render()}catch(x){status('Enregistrement impossible : '+(x.message||'vérifiez la migration SQL et les règles d’accès.').slice(0,220))}finally{b.disabled=false}
}
async function requestVisibility(option,b){
 if(!me||!ownBusiness){status('Connectez-vous et créez d’abord votre vitrine.');return}
 b.disabled=true;try{const r=await db.from('business_visibility_requests').insert({business_id:ownBusiness.id,owner_id:me.id,option,message:''});if(r.error)throw r.error;status('Demande enregistrée. L’équipe pourra vous contacter après mise en place du suivi administratif. Aucun paiement effectué.')}catch(x){status('Demande non envoyée : '+(x.message||'migration SQL à vérifier.').slice(0,180))}finally{b.disabled=false}
}
async function start(){mount();mountPublicShowcase();await auth();db.auth.onAuthStateChange(async()=>{await auth();if(document.getElementById('businessSpaceModal')?.classList.contains('active'))render()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();