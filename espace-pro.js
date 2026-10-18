/* CamerLink · enrichissement des pages Espace Pro (sans nouvelle table). */
(function(){
'use strict';
var API='https://lviddipduhaelxcvyykc.supabase.co/rest/v1';
var KEY='sb_publishable_j0C8eL1g6hgAcnL4gU_zRg_jvi0bmYH';
var seen='';
function $(s,r){return (r||document).querySelector(s)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function safe(v){return /^https:\/\//i.test(v||'')?v:''}
function api(path){return fetch(API+'/'+path,{headers:{apikey:KEY,Authorization:'Bearer '+KEY}}).then(function(r){return r.ok?r.json():[]}).catch(function(){return[]})}
function mediaUrl(a){return safe(a.image_url)||((a.images_urls||[]).map(safe).filter(Boolean)[0]||'')}
function render(o){
 if(!o||!o.classList.contains('open'))return;
 var h=o.innerHTML;
 var match=h.match(/<h1>([^<]+)<\/h1>/);
 if(!match)return;
 var title=match[1],key=title+'|'+h.length;
 if(o.dataset.proEnhanced===key)return;
 // The detail overlay is created by shell.js. Wait until its content has settled.
 var head=$('.bhead',o);if(!head)return;
 var address=(($('.box',o)||{}).textContent||'');
 var bizName=head.textContent.trim();
 api('business_spaces?select=id,owner_id,name,city,address,phone,whatsapp,cover_url,logo_url&name=eq.'+encodeURIComponent(title.replace(/&amp;/g,'&'))+'&limit=1').then(function(rows){
  if(!o.classList.contains('open')||!rows.length)return;
  var b=rows[0],sig=String(b.id)+'|'+o.innerHTML.length;
  if(o.dataset.proEnhanced===sig)return;
  o.dataset.proEnhanced=sig;
  var phone=String(b.phone||b.whatsapp||'').replace(/\D/g,'');
  if(phone&&!phone.startsWith('237'))phone='237'+phone;
  var links=$('.row',o);
  if(links){
   var msg=document.createElement('a');msg.className='bzb wa';msg.href=phone?'https://wa.me/'+phone+'?text='+encodeURIComponent('Bonjour, je vous contacte depuis CamerLink.'): '#';
   msg.textContent='💬 Écrire';msg.target='_blank';msg.rel='noopener';links.appendChild(msg);
  }
  var loc=[b.address,b.city].filter(Boolean).join(', ');
  if(loc){
   var map=document.createElement('a');map.className='bzb gr';map.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(loc);
   map.target='_blank';map.rel='noopener';map.textContent='📍 Itinéraire';
   if(links)links.appendChild(map);
  }
  var gallery=document.createElement('section');gallery.className='bpro-gallery';
  gallery.innerHTML='<h2>Photos et vidéos</h2><p class="bpro-muted">Découvrez les publications de cet établissement.</p><div class="bpro-media" data-bpro-media>Chargement des médias…</div>';
  var about=$('.box',o);if(about)about.parentNode.insertBefore(gallery,about);else o.appendChild(gallery);
  var reviews=document.createElement('section');reviews.className='bpro-reviews';
  reviews.innerHTML='<h2>⭐ Avis des clients</h2><div data-bpro-reviews>Chargement des avis…</div>';
  gallery.parentNode.insertBefore(reviews,gallery.nextSibling);
  var owner=encodeURIComponent(b.owner_id);
  api('annonces?select=id,title,image_url,images_urls,video_url,description,created_at&user_id=eq.'+owner+'&order=created_at.desc&limit=12').then(function(ads){
   var target=$('[data-bpro-media]',gallery);if(!target)return;
   if(!ads.length){target.innerHTML='<p class="bpro-muted">Les publications de cet établissement apparaîtront ici.</p>';return}
   target.innerHTML=ads.map(function(a){
    var img=mediaUrl(a),video=safe(a.video_url);
    var m=video?'<video src="'+esc(video)+'" controls playsinline preload="metadata"></video>':(img?'<img src="'+esc(img)+'" loading="lazy" alt="'+esc(a.title||'Publication')+'">':'');
    return '<article class="bpro-tile">'+m+'<div>'+esc(a.title||'Publication')+'</div></article>';
   }).join('');
  });
  api('artisan_reviews?select=id,rating,comment,created_at&artisan_id=eq.'+owner+'&order=created_at.desc&limit=10').then(function(rs){
   var target=$('[data-bpro-reviews]',reviews);if(!target)return;
   if(!rs.length){target.innerHTML='<p class="bpro-muted">Aucun avis publié pour le moment.</p>';return}
   var avg=rs.reduce(function(n,r){return n+Number(r.rating||0)},0)/rs.length;
   target.innerHTML='<div class="bpro-average">★ '+avg.toFixed(1)+' / 5 <span>('+rs.length+' avis récents)</span></div>'+rs.map(function(r){return '<article class="bpro-review"><div>'+('★'.repeat(Math.max(0,Math.min(5,Number(r.rating)||0))))+'</div><p>'+esc(r.comment||'Avis client')+'</p><small>'+esc(new Date(r.created_at).toLocaleDateString('fr-FR'))+'</small></article>'}).join('');
  });
 });
}
function scan(){var o=$('#bz-detail');if(o&&o.classList.contains('open'))render(o)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setInterval(scan,900)});else setInterval(scan,900);
})();