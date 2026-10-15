/* CamerLink · profils publics et abonnements */
(function(){
'use strict';
var URL='https://lviddipduhaelxcvyykc.supabase.co';
var KEY='sb_publishable_j0C8eL1g6hgAcnL4gU_zRg_jvi0bmYH';
var sb=window.supabase&&window.supabase.createClient?window.supabase.createClient(URL,KEY):null;
var root=document.getElementById('profile-section');
if(!sb||!root)return;
var busy=false;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function toast(s){var t=document.getElementById('toast');if(t){t.textContent=s;t.classList.add('show');setTimeout(function(){t.classList.remove('show')},2600)}else alert(s)}
function currentId(){var m=location.hash.match(/^#profil\/([0-9a-f-]{36})$/i);return m?m[1]:null}
function showProfile(id){
 if(!id||busy)return;busy=true;root.classList.remove('shell-off');
 root.innerHTML='<div class="pf-login"><p>Chargement du profil…</p></div>';
 Promise.all([
  sb.from('profils').select('id,username,full_name,avatar_url,bio,created_at').eq('id',id).maybeSingle(),
  sb.rpc('camerlink_follow_stats',{target_user:id}),
  sb.from('annonces').select('id,title,image_url,video_url,created_at').eq('user_id',id).order('created_at',{ascending:false}).limit(60)
 ]).then(function(res){
  busy=false;var p=res[0].data,auth=res[0].error,stats=res[1].data&&res[1].data[0],ads=res[2].data||[];
  if(auth||!p){root.innerHTML='<div class="pf-login"><h3>Profil indisponible</h3><p>Ce profil n’existe pas encore ou n’est pas accessible.</p><button class="main" id="pp-home">Retour à l’accueil</button></div>';document.getElementById('pp-home').onclick=function(){location.hash='#home'};return}
  var own=res[1].error?false:!!(sb.auth.getSession&&false);
  sb.auth.getSession().then(function(sess){
   var me=sess.data&&sess.data.session&&sess.data.session.user;
   var isMe=!!me&&me.id===id;
   var following=!!(stats&&stats.is_following),followers=Number(stats&&stats.followers_count||0),followingCount=Number(stats&&stats.following_count||0);
   var name=p.full_name||p.username||'Artisan CamerLink',av=p.avatar_url?'<img src="'+esc(p.avatar_url)+'" alt="Photo de '+esc(name)+'">':esc((name[0]||'C').toUpperCase());
   var posts=ads.map(function(a){var media=a.video_url||a.image_url;return '<div class="pf-cell">'+(media?(a.video_url?'<video src="'+esc(media)+'" muted playsinline controls></video>':'<img src="'+esc(media)+'" alt="'+esc(a.title||'Publication')+'">'):'')+'<div class="pr">'+esc(a.title||'Publication')+'</div></div>'}).join('');
   root.innerHTML='<div class="pf-top"><button class="pf-ic" id="pp-back" aria-label="Retour">←</button><h2>'+esc(name)+'</h2><button class="pf-ic" id="pp-share" aria-label="Partager le profil">↗</button></div><div class="pf-head"><div class="pf-av"><div class="im">'+av+'</div></div><div class="pf-stats"><div><b>'+ads.length+'</b><span>Publications</span></div><div><b>'+followers+'</b><span>Abonnés</span></div><div><b>'+followingCount+'</b><span>Abonnements</span></div></div></div><div class="pf-info"><div class="nm">'+esc(name)+'</div><div class="bio">'+esc(p.bio||'Découvrez les services et publications sur CamerLink.')+'</div><div class="ct">🇨🇲 Cameroun</div></div><div class="pf-btns">'+(isMe?'<button class="main" id="pp-own">Mon espace</button>':(me?'<button class="main" id="pp-follow">'+(following?'Abonné ✓':'＋ S’abonner')+'</button>':'<button class="main" id="pp-login">Se connecter pour s’abonner</button>'))+'<button id="pp-share2">Partager</button></div><div class="pf-tabs"><button class="on">▦ Publications</button></div><div class="pf-grid">'+(posts||'<div class="pf-empty" style="grid-column:1/-1">Aucune publication pour le moment.</div>')+'</div><div class="pf-ver">CamerLink · Profil public</div>';
   document.getElementById('pp-back').onclick=function(){location.hash='#home'};
   var share=function(){var url=location.origin+location.pathname+'#profil/'+id;if(navigator.share)navigator.share({title:name+' · CamerLink',url:url}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(url).then(function(){toast('Lien copié')}).catch(function(){toast(url)});else toast(url)};
   document.getElementById('pp-share').onclick=share;document.getElementById('pp-share2').onclick=share;
   var ownBtn=document.getElementById('pp-own');if(ownBtn)ownBtn.onclick=function(){location.hash='#profil'};
   var login=document.getElementById('pp-login');if(login)login.onclick=function(){var b=document.getElementById('authBtn');if(b)b.click()};
   var follow=document.getElementById('pp-follow');if(follow)follow.onclick=function(){
    if(follow.disabled)return;follow.disabled=true;
    var action=following?sb.from('abonnements').delete().eq('follower_id',me.id).eq('followed_id',id):sb.from('abonnements').insert({follower_id:me.id,followed_id:id});
    action.then(function(r){follow.disabled=false;if(r.error){toast(r.error.code==='23505'?'Vous êtes déjà abonné.':'Action impossible. Réessayez.');return}toast(following?'Désabonnement effectué':'Vous êtes maintenant abonné');showProfile(id)}).catch(function(){follow.disabled=false;toast('Erreur réseau. Réessayez.')})
   };
  });
 }).catch(function(){busy=false;root.innerHTML='<div class="pf-login"><p>Erreur réseau lors du chargement du profil.</p></div>'});
}
window.CamerLinkOpenProfile=function(id){if(!id)return;location.hash='#profil/'+id};
function route(){var id=currentId();if(id)showProfile(id)}
window.addEventListener('hashchange',route);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',route);else route();
})();