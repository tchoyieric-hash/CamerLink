(function(){
  var URL_='https://lviddipduhaelxcvyykc.supabase.co';
  var KEY='sb_publishable_j0C8eL1g6hgAcnL4gU_zRg_jvi0bmYH';
  var H={apikey:KEY,Authorization:'Bearer '+KEY};
  var groups=[],cur=0,idx=0,timer=null,seenKey='wa_seen_stories';
  var seen=[];try{seen=JSON.parse(localStorage.getItem(seenKey)||'[]')}catch(e){}

  function q(path){return fetch(URL_+'/rest/v1/'+path,{headers:H}).then(function(r){return r.ok?r.json():[]}).catch(function(){return[]})}
  function isVideo(u){return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(u||'')}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ago(d){var m=Math.round((Date.now()-new Date(d))/60000);if(m<1)return"à l'instant";if(m<60)return'il y a '+m+' min';var h=Math.round(m/60);return h<24?'il y a '+h+' h':'hier'}

  // Repère le titre de la zone et l'ancienne rangée de cercles
  function findHeading(){
    var els=document.querySelectorAll('h1,h2,h3,h4,div,span,p'),best=null;
    for(var i=0;i<els.length;i++){
      var t=(els[i].textContent||'').replace(/\s+/g,' ').trim();
      if(/Statuts\s*&\s*Reels\s*Artisans/i.test(t)&&(!best||t.length<best.textContent.length))best=els[i];
    }
    return best;
  }
  function findOldRow(heading){
    var sec=heading.parentElement,row=null;
    for(var d=0;d<3&&sec&&!row;d++){
      var all=sec.querySelectorAll('*');
      for(var i=0;i<all.length;i++){
        if(/^\s*Mon statut\s*$/i.test(all[i].textContent)&&all[i].children.length===0){
          var it=all[i];while(it.parentElement&&it.parentElement.children.length<2)it=it.parentElement;
          row=it.parentElement;break;
        }
      }
      sec=sec.parentElement;
    }
    return row;
  }

  function load(){
    return q('artisan_stories?select=id,artisan_id,media_url,caption,created_at&expires_at=gt.'+encodeURIComponent(new Date().toISOString())+'&order=created_at.asc').then(function(rows){
      if(!rows.length)return[];
      return fetch(URL_+'/rest/v1/rpc/story_authors',{method:'POST',headers:Object.assign({'Content-Type':'application/json'},H),body:'{}'})
        .then(function(r){return r.ok?r.json():[]}).catch(function(){return[]}).then(function(names){
        var nm={};names.forEach(function(n){nm[n.artisan_id]=n.display_name});
        var map={};
        rows.forEach(function(r){
          var g=map[r.artisan_id]||(map[r.artisan_id]={id:r.artisan_id,items:[],name:nm[r.artisan_id]||'CamerLink'});
          g.items.push(r);
        });
        return Object.keys(map).map(function(k){return map[k]}).sort(function(a,b){
          var la=a.items[a.items.length-1].created_at,lb=b.items[b.items.length-1].created_at;return lb>la?1:-1});
      });
    });
  }

  function isSeen(g){return g.items.every(function(i){return seen.indexOf(i.id)>-1})}

  function render(row,oldRow){
    row.innerHTML='<div class="wa-item" id="wa-mine"><div class="wa-ring mine">+</div><div class="wa-name">Mon statut</div></div>'+
      groups.map(function(g,i){
        var last=g.items[g.items.length-1];
        var m=isVideo(last.media_url)?'<video src="'+esc(last.media_url)+'#t=0.5" muted playsinline preload="metadata"></video>':'<img src="'+esc(last.media_url)+'" alt="" loading="lazy">';
        return '<div class="wa-item" data-i="'+i+'"><div class="wa-ring '+(isSeen(g)?'seen':'')+'">'+m+'</div><div class="wa-name">'+esc(g.name)+'</div></div>';
      }).join('');
    row.querySelector('#wa-mine').onclick=function(){
      var r=oldRowEl||oldRow;var old=r&&r.firstElementChild;if(old)old.click();
    };
    row.querySelectorAll('[data-i]').forEach(function(el){el.onclick=function(){open(+el.dataset.i)}});
  }

  var V=document.getElementById('wa-viewer'),stage=document.getElementById('wa-stage');
  function open(i){cur=i;idx=0;V.classList.add('open');show()}
  function close(){clearTimeout(timer);V.classList.remove('open');var m=stage.querySelector('img,video');if(m)m.remove();refresh()}
  function show(){
    clearTimeout(timer);
    var g=groups[cur],it=g.items[idx];
    if(seen.indexOf(it.id)<0){seen.push(it.id);try{localStorage.setItem(seenKey,JSON.stringify(seen))}catch(e){}}
    document.getElementById('wa-who').textContent=g.name;
    document.getElementById('wa-av').textContent=(g.name||'A').charAt(0).toUpperCase();
    document.getElementById('wa-when').textContent=ago(it.created_at);
    document.getElementById('wa-cap').textContent=it.caption||'';
    document.getElementById('wa-cap').style.display=it.caption?'block':'none';
    var bars=document.getElementById('wa-bars');
    bars.innerHTML=g.items.map(function(_,k){return '<i><b style="width:'+(k<idx?100:0)+'%"></b></i>'}).join('');
    var old=stage.querySelector('img,video');if(old)old.remove();
    var el,dur=5000;
    if(isVideo(it.media_url)){el=document.createElement('video');el.src=it.media_url;el.autoplay=true;el.playsInline=true;el.onended=next;
      el.onloadedmetadata=function(){fill(el.duration*1000)};}
    else{el=document.createElement('img');el.src=it.media_url;fill(dur);timer=setTimeout(next,dur)}
    stage.insertBefore(el,stage.firstChild);
  }
  function fill(ms){
    var b=document.querySelectorAll('#wa-bars i b')[idx];if(!b)return;
    b.style.transition='none';b.style.width='0';
    requestAnimationFrame(function(){requestAnimationFrame(function(){b.style.transition='width '+ms+'ms linear';b.style.width='100%'})});
  }
  function next(){var g=groups[cur];if(idx<g.items.length-1){idx++;show()}else if(cur<groups.length-1){cur++;idx=0;show()}else close()}
  function prev(){if(idx>0){idx--;show()}else if(cur>0){cur--;idx=0;show()}else show()}
  document.getElementById('wa-next').onclick=next;
  document.getElementById('wa-prev').onclick=prev;
  document.getElementById('wa-close').onclick=close;

  var rowEl,oldRowEl;
  function refresh(){if(rowEl)render(rowEl,oldRowEl)}

  function hideOld(){
    var all=document.querySelectorAll('body *');
    for(var i=0;i<all.length;i++){
      var el=all[i];
      if(el.children.length!==0||(rowEl&&rowEl.contains(el))||V.contains(el))continue;
      var t=(el.textContent||'').trim();
      if(t!=='Artisan'&&t!=='Mon statut')continue;
      var item=el.parentElement,row=item&&item.parentElement;
      if(!row||row===document.body||(rowEl&&row.contains(rowEl)))continue;
      row.classList.add('wa-hidden');
      if(/^Mon statut$/i.test(t)&&!oldRowEl)oldRowEl=row;
    }
  }
  function init(){
    var h=findHeading();if(!h)return;
    rowEl=document.createElement('div');rowEl.id='wa-status-row';
    h.parentElement.insertBefore(rowEl,h.nextSibling);
    hideOld();
    var busy=false;new MutationObserver(function(){if(busy)return;busy=true;setTimeout(function(){hideOld();busy=false},150)}).observe(document.body,{childList:true,subtree:true});
    load().then(function(g){groups=g;render(rowEl,oldRowEl)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,600)});
  else setTimeout(init,600);
})();
