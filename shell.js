/* CamerLink · onglets du haut, barre du bas, espace Découvrir (entreprises).
   Ne modifie pas script.js : il s'appuie sur les boutons existants. */
(function(){
'use strict';
var URL_='https://lviddipduhaelxcvyykc.supabase.co',KEY='sb_publishable_j0C8eL1g6hgAcnL4gU_zRg_jvi0bmYH',REF='lviddipduhaelxcvyykc';

/* ---------- Outils ---------- */
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function safe(u){return /^https:\/\//i.test(u||'')?String(u).replace(/["'()\s]/g,encodeURIComponent):''}
function digits(s){return String(s||'').replace(/\D/g,'')}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()}
function toast(m){var t=document.createElement('div');t.className='bz-toast';t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},2800)}
function session(){try{var s=JSON.parse(localStorage.getItem('sb-'+REF+'-auth-token')||'null');if(s&&s.access_token&&(!s.expires_at||s.expires_at*1000>Date.now()))return{token:s.access_token,uid:s.user&&s.user.id}}catch(e){}return null}
function api(path,o){o=o||{};var ses=session();
  var h={apikey:KEY,Authorization:'Bearer '+(ses?ses.token:KEY),'Content-Type':'application/json'};
  if(o.prefer)h.Prefer=o.prefer;
  return fetch(URL_+'/rest/v1/'+path,{method:o.method||'GET',headers:h,body:o.body?JSON.stringify(o.body):undefined})
   .then(function(r){return r.text().then(function(t){var j=null;try{j=t?JSON.parse(t):null}catch(e){}return{ok:r.ok,data:j}})})
   .catch(function(){return{ok:false,data:null}})}
function needLogin(){toast('Connectez-vous d\'abord');var a=$('#authBtn');if(a)a.click()}

/* ---------- Onglets + barre du bas ---------- */
var MODES={
 home:['.hero','.shops-section','#reels-section','#categoryChips','main','footer'],
 profil:['#profile-section'],
 reels:['#reels-section'],
 statuts:['.shops-section'],
 annonces:['.hero','#categoryChips','main','footer'],
 decouvrir:['#discover-section','footer']
};
var ALL=['.hero','.shops-section','#reels-section','#categoryChips','main','footer','#discover-section','#profile-section'];
var cur='home',modeHistory=[];
function mountBack(){var b=$('#cl-global-back');if(!b){b=document.createElement('button');b.id='cl-global-back';b.type='button';b.innerHTML='<span aria-hidden="true">←</span><span>Retour</span>';b.setAttribute('aria-label','Revenir à la rubrique précédente');var anchor=$('.shell-tabs');if(anchor)anchor.parentNode.insertBefore(b,anchor);else{var h=$('header');if(h&&h.nextSibling)h.parentNode.insertBefore(b,h.nextSibling)}b.onclick=function(){if(modeHistory.length){var prev=modeHistory.pop();setMode(prev,true,true)}else if(cur!=='home'){setMode('home',false,true)}else if(history.length>1){history.back()}else{window.scrollTo({top:0,behavior:'smooth')}}};}return b;}
function setMode(m,noScroll,fromBack){
  if(!MODES[m])m='home';if(m!==cur&&!fromBack)modeHistory.push(cur);if(modeHistory.length>20)modeHistory.shift();cur=m;
  var back=mountBack();back.classList.toggle('visible',m!=='home');
  ALL.forEach(function(sel){$$(sel).forEach(function(el){el.classList.toggle('shell-off',MODES[m].indexOf(sel)<0)})});
  $$('.shell-tab').forEach(function(b){b.classList.toggle('on',b.dataset.m===m)});
  $$('.shell-nav [data-m]').forEach(function(b){b.classList.toggle('on',b.dataset.m===m)});
  try{history.replaceState(null,'',m==='home'?location.pathname+location.search:'#'+m)}catch(e){}
  if(!noScroll)window.scrollTo(0,0);
  if(m==='decouvrir')bzLoad();
  if(m==='profil'&&window.CamerLinkProfile)window.CamerLinkProfile.load();
}
function hdr(){var h=$('header');if(h)document.documentElement.style.setProperty('--hdr',h.offsetHeight+'px')}
function click(id){var e=$(id);if(e)e.click();else toast('Indisponible')}

function mountNav(){
  mountBack();
  // Délégation d'événements robuste pour les onglets du haut et la barre du bas.
  $('.shell-tab').forEach(function(b){b.addEventListener('click',function(){setMode(b.dataset.m)})});
  var nav=$('.shell-nav');
  if(nav&&!nav.dataset.shellBound){
    nav.dataset.shellBound='1';
    nav.addEventListener('click',function(ev){
      var b=ev.target.closest('button');
      if(!b||!nav.contains(b))return;
      if(b.id==='nav-add'){ev.preventDefault();click('#pubBtn');return}
      if(b.id==='nav-msg'){ev.preventDefault();click('#msgInboxBtn');return}
      if(b.dataset.m){ev.preventDefault();setMode(b.dataset.m)}
    });
  }
  $('.shell-nav [data-m]').forEach(function(b){b.classList.toggle('on',b.dataset.m===cur)});
  // recopie la pastille de messages
  var src=$('#msgBadge'),dst=$('#nav-badge');
  function sync(){var t=(src&&src.textContent||'').trim();dst.textContent=t;dst.classList.toggle('show',!!t&&t!=='0')}
  if(src){sync();new MutationObserver(sync).observe(src,{childList:true,characterData:true,subtree:true})}
  hdr();window.addEventListener('resize',hdr);setTimeout(hdr,500);
}

/* ---------- Découvrir : hiérarchie secteurs > catégories ---------- */
var SECTORS=[
 {id:'resto',ico:'🍽️',name:'Restauration & Hôtellerie',cats:['Restaurant','Bar / Snack','Boulangerie / Pâtisserie','Hôtel','Traiteur']},
 {id:'edu',ico:'🎓',name:'Éducation',cats:['École maternelle / primaire','Collège / Lycée','Université / Institut','Formation professionnelle','Crèche']},
 {id:'sante',ico:'🏥',name:'Santé',cats:['Hôpital / Clinique','Pharmacie','Laboratoire','Cabinet médical','Dentiste']},
 {id:'shop',ico:'🛍️',name:'Commerce & Boutiques',cats:['Boutique','Supermarché','Quincaillerie','Couture / Mode','Informatique / Téléphonie']},
 {id:'serv',ico:'🛠️',name:'Services & Artisanat',cats:['Électricité / Plomberie','Menuiserie','Garage / Mécanique','Pressing / Blanchisserie','Photographie / Événementiel']},
 {id:'immo',ico:'🏠',name:'Immobilier, Transport & Finance',cats:['Immobilier','Transport / Livraison','Banque / Microfinance','Assurance']}
];
var OTHER={id:'autre',ico:'📌',name:'Autres',cats:[]};
function sectorOf(cat){var n=norm(cat);
  for(var i=0;i<SECTORS.length;i++)for(var j=0;j<SECTORS[i].cats.length;j++){var c=norm(SECTORS[i].cats[j]);if(n===c)return SECTORS[i]}
  for(i=0;i<SECTORS.length;i++)for(j=0;j<SECTORS[i].cats.length;j++){c=norm(SECTORS[i].cats[j]);if(n.length>3&&(n.indexOf(c)>-1||c.indexOf(n)>-1))return SECTORS[i]}
  return OTHER}

var biz=[],loaded=false,st={sector:'all',cat:'all',text:''},box;
function logoHtml(b){var u=safe(b.logo_url);return '<div class="logo">'+(u?'<img src="'+u+'" alt="" loading="lazy">':esc((b.name||'?').charAt(0).toUpperCase()))+'</div>'}

function bzLoad(){
  box=$('#discover-section');if(!box)return;
  if(loaded){bzHome();return}
  box.innerHTML='<div class="bz"><p class="sub">Chargement…</p></div>';
  api('business_spaces?select=id,owner_id,name,category,description,city,address,phone,whatsapp,opening_hours,logo_url,cover_url,website_url&status=eq.published&order=created_at.desc')
   .then(function(r){biz=r.data||[];loaded=true;bzHome()});
}
function listHtml(){
  var rows=biz.filter(function(b){
    var sec=sectorOf(b.category);
    if(st.sector!=='all'&&sec.id!==st.sector)return false;
    if(st.cat!=='all'&&norm(b.category)!==norm(st.cat))return false;
    if(st.text&&norm([b.name,b.category,b.city,b.description].join(' ')).indexOf(norm(st.text))<0)return false;
    return true});
  var html='';
  SECTORS.concat([OTHER]).forEach(function(s){
    var it=rows.filter(function(b){return sectorOf(b.category).id===s.id});
    if(!it.length)return;
    html+='<div class="sect">'+s.ico+' '+esc(s.name)+' <small>('+it.length+')</small></div><div class="grid">'+
     it.map(function(b){return '<div class="card" data-id="'+esc(b.id)+'">'+logoHtml(b)+'<div style="min-width:0"><h3>'+esc(b.name)+'</h3><p>'+esc([b.city,b.address].filter(Boolean).join(' · '))+'</p><span class="tag">'+esc(b.category)+'</span></div></div>'}).join('')+'</div>'});
  return html||'<div class="empty">Aucune entreprise ici pour l\'instant.<br>Soyez la première à créer sa page !</div>';
}
function bzHome(){
  var sec=SECTORS.filter(function(s){return s.id===st.sector})[0];
  var h='<div class="bz"><h1>Découvrir</h1><p class="sub">Restaurants, écoles, hôpitaux, boutiques et services du Cameroun.</p>'+
   '<div class="cta"><div><b>Vous avez une entreprise ?</b><span>Créez votre page et faites-vous connaître.</span></div><button class="bzb" id="bz-create">Créer ma page</button></div>'+
   '<input class="s" id="bz-q" placeholder="Rechercher une entreprise, une ville…" value="'+esc(st.text)+'">'+
   '<div class="chips"><div class="chip '+(st.sector==='all'?'on':'')+'" data-s="all">✨ Tout</div>'+
   SECTORS.map(function(s){return '<div class="chip '+(st.sector===s.id?'on':'')+'" data-s="'+s.id+'">'+s.ico+' '+esc(s.name)+'</div>'}).join('')+'</div>';
  if(sec)h+='<div class="chips sm"><div class="chip '+(st.cat==='all'?'on':'')+'" data-c="all">Toutes</div>'+sec.cats.map(function(c){return '<div class="chip '+(norm(st.cat)===norm(c)?'on':'')+'" data-c="'+esc(c)+'">'+esc(c)+'</div>'}).join('')+'</div>';
  h+='<div id="bz-out">'+listHtml()+'</div></div>';
  box.innerHTML=h;
  var inp=$('#bz-q');inp.oninput=function(){st.text=inp.value;$('#bz-out').innerHTML=listHtml();bindCards()};
  $$('[data-s]',box).forEach(function(e){e.onclick=function(){st.sector=e.dataset.s;st.cat='all';bzHome()}});
  $$('[data-c]',box).forEach(function(e){e.onclick=function(){st.cat=e.dataset.c;bzHome()}});
  $('#bz-create').onclick=openForm;
  bindCards();
}
function bindCards(){$$('.card',box).forEach(function(c){c.onclick=function(){openDetail(c.dataset.id)}})}

/* ---------- Page d'une entreprise ---------- */
function overlay(id){var o=$('#'+id);if(!o){o=document.createElement('div');o.id=id;o.className='bzo bz';document.body.appendChild(o)}return o}
function closeOv(o){o.classList.remove('open');document.body.style.overflow=''}
function openOv(o){o.classList.add('open');o.scrollTop=0;document.body.style.overflow='hidden'}

function openDetail(id){
  var b=biz.filter(function(x){return x.id===id})[0];if(!b)return;
  var o=overlay('bz-detail');o.innerHTML='<p class="sub">Chargement…</p>';openOv(o);
  var ses=session(),mine=ses&&ses.uid===b.owner_id;
  api('business_catalog_items?select=id,name,description,price_xaf,is_available&business_id=eq.'+encodeURIComponent(id)+'&order=created_at.desc').then(function(r){
    var items=r.data||[],cov=safe(b.cover_url),wa=digits(b.whatsapp||b.phone),ph=digits(b.phone||b.whatsapp);
    var h='<button class="back" id="bz-back">← Retour</button><div class="cover" style="'+(cov?'background-image:url('+cov+')':'')+'"></div>'+
     '<div class="bhead">'+logoHtml(b).replace('class="logo"','class="logo"')+'<div><h1>'+esc(b.name)+'</h1><span class="tag">'+esc(b.category)+'</span></div></div>'+
     '<div class="row">'+(wa?'<a class="bzb wa" href="https://wa.me/'+wa+'">WhatsApp</a>':'')+(ph?'<a class="bzb gr" href="tel:+'+ph+'">Appeler</a>':'')+(/^https:\/\//i.test(b.website_url||'')?'<a class="bzb gr" href="'+esc(b.website_url)+'" rel="noopener">Site web</a>':'')+'</div>';
    if(b.description)h+='<div class="box"><b>À propos</b>'+esc(b.description)+'</div>';
    if(b.city||b.address)h+='<div class="box"><b>Adresse</b>'+esc([b.address,b.city].filter(Boolean).join(', '))+'</div>';
    if(b.opening_hours)h+='<div class="box"><b>Horaires</b>'+esc(b.opening_hours)+'</div>';
    if(items.length)h+='<div class="sect">Catalogue / Services</div><div class="cat">'+items.map(function(i){return '<div class="item"><div>'+esc(i.name)+'</div>'+(i.description?'<div style="opacity:.7">'+esc(i.description)+'</div>':'')+(i.price_xaf!=null?'<div class="pr">'+Number(i.price_xaf).toLocaleString('fr-FR')+' FCFA</div>':'')+(i.is_available===false?'<div style="opacity:.6">Indisponible</div>':'')+'</div>'}).join('')+'</div>';
    if(mine){
      h+='<div class="sect">Gérer ma page</div><div class="box bzf"><b>Ajouter un produit ou service</b>'+
       '<input id="ci-n" placeholder="Nom (ex : Poulet braisé)" maxlength="120"><input id="ci-p" type="number" min="0" placeholder="Prix en FCFA (facultatif)"><input id="ci-d" placeholder="Description courte" maxlength="300">'+
       '<button class="bzb" id="ci-add">Ajouter</button><p class="err" id="ci-e"></p></div>'+
       '<div class="box bzf"><b>Mise en avant</b><select id="vr-o"><option value="boost">Booster ma page</option><option value="verified">Badge « Vérifié »</option><option value="campaign">Campagne de visibilité</option></select>'+
       '<input id="vr-m" placeholder="Message (facultatif)" maxlength="500"><button class="bzb" id="vr-send">Envoyer la demande</button><p class="err" id="vr-e"></p></div>';
    }
    o.innerHTML=h;
    $('#bz-back',o).onclick=function(){closeOv(o)};
    if(mine){
      $('#ci-add',o).onclick=function(){
        var n=$('#ci-n',o).value.trim();if(n.length<1){$('#ci-e',o).textContent='Nom requis.';return}
        var p=$('#ci-p',o).value;
        api('business_catalog_items',{method:'POST',body:{business_id:id,owner_id:ses.uid,name:n,description:$('#ci-d',o).value.trim(),price_xaf:p===''?null:Number(p)}}).then(function(r){
          if(r.ok){toast('Ajouté');openDetail(id)}else $('#ci-e',o).textContent='Échec de l\'ajout.'})};
      $('#vr-send',o).onclick=function(){
        api('business_visibility_requests',{method:'POST',body:{business_id:id,owner_id:ses.uid,option:$('#vr-o',o).value,message:$('#vr-m',o).value.trim()}}).then(function(r){
          if(r.ok){toast('Demande envoyée, nous vous contactons');$('#vr-m',o).value=''}else $('#vr-e',o).textContent='Échec de l\'envoi.'})};
    }
  });
}

/* ---------- Créer ma page entreprise ---------- */
function openForm(){
  var ses=session();if(!ses){needLogin();return}
  var o=overlay('bz-form');
  var opts=SECTORS.map(function(s){return '<optgroup label="'+esc(s.ico+' '+s.name)+'">'+s.cats.map(function(c){return '<option>'+esc(c)+'</option>'}).join('')+'</optgroup>'}).join('')+'<option>Autre</option>';
  o.innerHTML='<button class="back" id="bf-back">← Retour</button><h1>Créer ma page entreprise</h1><p class="sub">Gratuit. Votre page sera visible dans Découvrir.</p>'+
   '<div class="bzf"><label>Nom de l\'entreprise</label><input id="bf-n" maxlength="120">'+
   '<label>Catégorie</label><select id="bf-c">'+opts+'</select>'+
   '<label>Ville</label><input id="bf-v" maxlength="100" placeholder="Yaoundé"><label>Adresse / quartier</label><input id="bf-a" maxlength="250">'+
   '<label>WhatsApp / Téléphone</label><input id="bf-p" type="tel" maxlength="40" placeholder="6 91 23 45 67">'+
   '<label>Horaires</label><input id="bf-h" maxlength="300" placeholder="Lun-Sam 8h-20h">'+
   '<label>Présentation</label><textarea id="bf-d" rows="4" maxlength="2000"></textarea>'+
   '<button class="bzb" id="bf-ok">Publier ma page</button><p class="err" id="bf-e"></p></div>';
  openOv(o);
  $('#bf-back',o).onclick=function(){closeOv(o)};
  $('#bf-ok',o).onclick=function(){
    var n=$('#bf-n',o).value.trim(),p=$('#bf-p',o).value.trim(),e=$('#bf-e',o);
    if(n.length<2){e.textContent='Indiquez le nom de l\'entreprise.';return}
    if(digits(p).length<8){e.textContent='Indiquez un numéro WhatsApp valide.';return}
    $('#bf-ok',o).disabled=true;
    api('business_spaces',{method:'POST',prefer:'return=representation',body:{owner_id:ses.uid,name:n,category:$('#bf-c',o).value,city:$('#bf-v',o).value.trim(),address:$('#bf-a',o).value.trim(),phone:p,whatsapp:p,opening_hours:$('#bf-h',o).value.trim(),description:$('#bf-d',o).value.trim(),status:'published'}}).then(function(r){
      $('#bf-ok',o).disabled=false;
      if(r.ok&&r.data&&r.data[0]){toast('Votre page est publiée 🎉');loaded=false;closeOv(o);bzLoad();
        setTimeout(function(){api('business_spaces?select=id,owner_id,name,category,description,city,address,phone,whatsapp,opening_hours,logo_url,cover_url,website_url&status=eq.published&order=created_at.desc').then(function(x){biz=x.data||[];loaded=true;bzHome();openDetail(r.data[0].id)})},400)}
      else e.textContent='Échec de la publication. Reconnectez-vous et réessayez.'})};
}

/* ---------- Démarrage ---------- */
function start(){
  box=$('#discover-section');
  mountNav();
  var m=(location.hash||'').replace('#','');
  setMode(MODES[m]?m:'home',true);
}
window.CamerLinkShell={setMode:setMode};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
