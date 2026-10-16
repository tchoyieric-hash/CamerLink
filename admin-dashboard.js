(() => {
'use strict';
const SB_URL='https://lviddipduhaelxcvyykc.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aWRkaXBkdWhhZWx4Y3Z5eWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1ODExMzcsImV4cCI6MjEwNjE1NzEzN30.L5iaUIW0IQ0hX5uOiOuK-lo_zkf926Xs6CDjCjrpffk';
const sb=window.supabase.createClient(SB_URL,SB_KEY),$=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let status='pending';
function notice(t){$('notice').textContent=t;$('notice').hidden=false}
function state(t,d){$('state').innerHTML='<h1>'+esc(t)+'</h1><p>'+esc(d)+'</p>'}
async function count(table){const {count,error}=await sb.from(table).select('*',{count:'exact',head:true});return error?null:(count??0)}
function stat(label,value,hint){return '<article class="stat"><div class="label">'+label+'</div><div class="number">'+(value===null?'—':Number(value).toLocaleString('fr-FR'))+'</div><div class="hint">'+hint+'</div></article>'}
async function loadStats(){const defs=[['Annonces','annonces','Publications enregistrées'],['Commentaires Reels','reel_comments','Tous statuts confondus'],['J’aime Reels','reel_likes','Interactions enregistrées'],['Espaces entreprises','etablissements','Vitrines professionnelles']];const vals=await Promise.all(defs.map(d=>count(d[1])));$('stats').innerHTML=defs.map((d,i)=>stat(d[0],vals[i],d[2])).join('');if(vals.some(v=>v===null))notice('Certaines statistiques sont indisponibles (table absente ou droits de lecture).')}
async function loadComments(){$('comments').innerHTML='<p class="muted">Chargement des commentaires…</p>';const {data,error}=await sb.from('reel_comments').select('*').eq('status',status).order('created_at',{ascending:false}).limit(100);if(error){$('comments').innerHTML='<p class="muted">Lecture impossible : '+esc(error.message)+'</p>';return}if(!data?.length){$('comments').innerHTML='<p class="muted">Aucun commentaire dans cette catégorie.</p>';return}
$('comments').innerHTML=data.map(c=>{const text=c.comment??c.content??c.body??c.text??'[Texte non trouvé]',id=c.id,date=c.created_at?new Date(c.created_at).toLocaleString('fr-FR'):'Date inconnue',reel=c.annonce_id??c.reel_id??'—';const next=status==='approved'?'rejected':'approved';const action=status==='pending'?'<button class="action approve" data-action="approved" data-id="'+esc(id)+'">✓ Approuver</button><button class="action reject" data-action="rejected" data-id="'+esc(id)+'">✕ Refuser</button>':'<button class="action '+(next==='approved'?'approve':'reject')+'" data-action="'+next+'" data-id="'+esc(id)+'">'+(next==='approved'?'Approuver':'Refuser')+'</button>';return '<article class="comment"><div class="comment-body"><div class="meta">Reel/annonce '+esc(reel)+' · '+esc(date)+'</div><p class="comment-text">'+esc(text)+'</p><div class="meta">ID : '+esc(id)+'</div></div><div class="actions">'+action+'</div></article>'}).join('')}
async function changeStatus(id,next){const btn=document.querySelector('[data-id="'+CSS.escape(String(id))+'"][data-action="'+next+'"]');if(btn){btn.disabled=true;btn.textContent='En cours…'}const {error}=await sb.from('reel_comments').update({status:next}).eq('id',id);if(error){notice('La base a refusé la modification : '+error.message+'. Il faut une politique RLS qui autorise les administrateurs via is_admin().');if(btn)btn.disabled=false;return}notice('Commentaire mis à jour.');await loadComments()}
document.addEventListener('click',e=>{const f=e.target.closest('[data-status]');if(f){status=f.dataset.status;document.querySelectorAll('[data-status]').forEach(x=>x.classList.toggle('active',x===f));loadComments();return}const a=e.target.closest('[data-action][data-id]');if(a)changeStatus(a.dataset.id,a.dataset.action)});
async function loadReports(){
 const box=$('reports');box.innerHTML='<p class="muted">Chargement des signalements…</p>';
 const {data,error}=await sb.rpc('admin_list_reports');
 if(error){box.innerHTML='<p class="muted">Lecture impossible : '+esc(error.message)+'</p>';return}
 if(!data?.length){box.innerHTML='<p class="muted">Aucun signalement enregistré.</p>';return}
 box.innerHTML=data.map(r=>'<article class="comment"><div class="comment-body"><div class="meta">Signalement #'+esc(r.id)+' · '+esc(r.created_at?new Date(r.created_at).toLocaleString('fr-FR'):'date inconnue')+' · statut : '+esc(r.status)+'</div><p><strong>'+esc(r.annonce_title||('Annonce #'+r.annonce_id))+'</strong></p><p class="comment-text">'+esc(r.reason||'Motif non précisé')+'</p><p class="comment-text">'+esc(r.details||'')+'</p></div><div class="actions">'+(r.status!=='reviewed'?'<button class="action approve" data-report-status="reviewed" data-id="'+esc(r.id)+'">Traité</button>':'')+(r.status!=='dismissed'?'<button class="action reject" data-report-status="dismissed" data-id="'+esc(r.id)+'">Classer sans suite</button>':'')+'</div></article>').join('');
}
async function updateReport(id,next){
 const {error}=await sb.rpc('admin_update_report',{report_id:Number(id),next_status:next});
 if(error){notice('Modification du signalement impossible : '+error.message);return}
 notice('Signalement mis à jour.');await loadReports();
}
async function loadPremium(){
 const box=$('premium-requests');box.innerHTML='<p class="muted">Chargement des demandes Premium…</p>';
 const {data,error}=await sb.rpc('admin_list_premium_requests');
 if(error){box.innerHTML='<p class="muted">Lecture impossible : '+esc(error.message)+'</p>';return}
 if(!data?.length){box.innerHTML='<p class="muted">Aucune demande Premium enregistrée.</p>';return}
 box.innerHTML=data.map(p=>'<article class="comment"><div class="comment-body"><div class="meta">Demande #'+esc(p.id)+' · '+esc(p.created_at?new Date(p.created_at).toLocaleString('fr-FR'):'date inconnue')+' · '+esc(p.status)+'</div><p><strong>'+esc(p.type||'Offre Premium')+'</strong></p><p class="comment-text">'+esc(p.message||'Aucun message')+'</p><div class="meta">Annonce : '+esc(p.annonce_id??'—')+' · établissement : '+esc(p.etablissement_id??'—')+' · utilisateur : '+esc(p.user_id)+'</div>'+(p.processed_at?'<div class="meta">Traitée le '+esc(new Date(p.processed_at).toLocaleString('fr-FR'))+'</div>':'')+'</div><div class="actions">'+(p.status!=='approved'?'<button class="action approve" data-premium-status="approved" data-days="'+(p.type==='boost'?3:30)+'" data-id="'+esc(p.id)+'">Confirmer paiement et activer</button>':'')+(p.status!=='rejected'?'<button class="action reject" data-premium-status="rejected" data-id="'+esc(p.id)+'">Refuser</button>':'')+'</div></article>').join('');
}
async function updatePremium(id,next,days){
 if(next==='approved'&&!window.confirm('As-tu vérifié le paiement réel auprès de l’opérateur ou sur le reçu officiel ? La référence déclarée seule ne suffit pas. Si oui, confirmer activera la promotion.'))return;
 if(next==='rejected'&&!window.confirm('Refuser cette demande Premium ?'))return;
 const result = next==='approved'
   ? await sb.rpc('admin_decide_premium',{p_request_id:Number(id),p_approve:true,p_days:Number(days)||30})
   : await sb.rpc('admin_update_premium_request',{request_id:Number(id),next_status:next});
 const {error}=result;
 if(error){notice('Modification de la demande impossible : '+error.message);return}
 notice(next==='approved'?'Paiement confirmé : promotion activée.':'Demande Premium mise à jour.');await loadPremium();
}
document.addEventListener('click',e=>{
 const r=e.target.closest('[data-report-status][data-id]');if(r){updateReport(r.dataset.id,r.dataset.reportStatus);return}
 const p=e.target.closest('[data-premium-status][data-id]');if(p){updatePremium(p.dataset.id,p.dataset.premiumStatus,p.dataset.days);return}
});
$('reload-reports').addEventListener('click',loadReports);$('reload-premium').addEventListener('click',loadPremium);
$('refresh').addEventListener('click',async()=>{$('notice').hidden=true;await loadStats();await loadComments()});$('reload-comments').addEventListener('click',loadComments);
(async()=>{try{const {data:{session},error:se}=await sb.auth.getSession();if(se)throw se;if(!session){state('Connexion requise','Connecte-toi sur CamerLink, puis rouvre cette page.');return}const {data:admin,error}=await sb.rpc('is_admin');if(error){state('Vérification impossible','Le contrôle administrateur est indisponible. Aucun contenu admin ne sera affiché.');return}if(admin!==true){state('Accès réservé','Ce compte ne figure pas parmi les administrateurs autorisés.');return}$('state').hidden=true;$('dashboard').hidden=false;await loadStats();await Promise.all([loadComments(),loadReports(),loadPremium()])}catch(e){state('Erreur de connexion','Impossible de vérifier les autorisations. Réessaie après connexion.')}})();
})();