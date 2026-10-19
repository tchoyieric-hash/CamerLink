/* CamerLink Growth Suite — devis, partage, favoris localement. Backend requis: migration quote_requests. */
(function () {
  'use strict';
  if (window.__camerlinkGrowthSuiteLoaded) return;
  window.__camerlinkGrowthSuiteLoaded = true;

  var SB_URL = 'https://lviddipduhaelxcvyykc.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aWRkaXBkdWhhZWx4Y3Z5eWtjIiwiaWF0IjoxNzkwNTgxMTM3LCJleHAiOjIxMDYxNTcxMzN9.L5iaUIW0IQ0hX5uOiOuK-lo_zkf926Xs6CDjCjrpffk';
  // The anon key is public by design; database access must be restricted by RLS.
  var supabase = window.supabase && window.supabase.createClient ? window.supabase.createClient(SB_URL, SB_KEY) : null;
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]); }); };

  function toast(msg) {
    var t = document.getElementById('toast');
    if (t) { t.textContent = msg; t.classList.add('show'); setTimeout(function(){ t.classList.remove('show'); }, 3000); }
    else window.alert(msg);
  }
  function addStyle() {
    if (document.getElementById('cl-growth-style')) return;
    var l = document.createElement('link'); l.id = 'cl-growth-style'; l.rel = 'stylesheet'; l.href = '/camerlink-growth-suite.css?v=1'; document.head.appendChild(l);
  }
  function buildModal() {
    if (document.getElementById('cl-quote-modal')) return;
    var wrap = document.createElement('div');
    wrap.id = 'cl-quote-modal'; wrap.className = 'cl-growth-overlay'; wrap.hidden = true;
    wrap.innerHTML = '<section class="cl-growth-dialog" role="dialog" aria-modal="true" aria-labelledby="cl-quote-title">' +
      '<button class="cl-growth-close" type="button" aria-label="Fermer">×</button>' +
      '<p class="cl-growth-eyebrow">CAMERLINK · SERVICES</p><h2 id="cl-quote-title">Demander un devis</h2>' +
      '<p class="cl-growth-muted">Décrivez votre besoin. Votre demande sera visible uniquement par vous et le professionnel concerné.</p>' +
      '<form id="cl-quote-form"><label>Quel service recherchez-vous ?<input name="service" required maxlength="100" placeholder="Ex. plombier, couturier, électricien"></label>' +
      '<label>Votre ville<select name="city" required><option value="">Choisir une ville</option><option>Yaoundé</option><option>Douala</option><option>Bafoussam</option><option>Bamenda</option><option>Buea</option><option>Garoua</option><option>Maroua</option><option>Ngaoundéré</option><option>Bertoua</option><option>Ebolowa</option><option>Kribi</option><option>Autre</option></select></label>' +
      '<label>Budget estimé (FCFA, facultatif)<input name="budget" type="number" min="0" max="1000000000" inputmode="numeric" placeholder="Ex. 25000"></label>' +
      '<label>Détails du travail<textarea name="details" required minlength="10" maxlength="2000" rows="4" placeholder="Expliquez ce qu’il faut réaliser…"></textarea></label>' +
      '<label>Identifiant du professionnel (facultatif)<input name="artisan_id" maxlength="80" placeholder="Laisser vide pour une demande générale"></label>' +
      '<button class="cl-growth-primary" type="submit">Envoyer ma demande</button><p class="cl-growth-feedback" role="status"></p></form></section>';
    document.body.appendChild(wrap);
    wrap.querySelector('.cl-growth-close').addEventListener('click', closeModal);
    wrap.addEventListener('click', function(e){ if(e.target === wrap) closeModal(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModal(); });
    wrap.querySelector('#cl-quote-form').addEventListener('submit', submitQuote);
  }
  function openModal() {
    buildModal();
    var m = document.getElementById('cl-quote-modal'); m.hidden = false;
    var first = m.querySelector('input'); if (first) first.focus();
  }
  function closeModal() { var m = document.getElementById('cl-quote-modal'); if(m) m.hidden = true; }
  async function submitQuote(e) {
    e.preventDefault();
    var form = e.currentTarget, feedback = form.querySelector('.cl-growth-feedback'), button = form.querySelector('button[type=submit]');
    if (!supabase) { feedback.textContent = 'Le service de devis est momentanément indisponible.'; return; }
    button.disabled = true; feedback.textContent = 'Envoi en cours…';
    try {
      var auth = await supabase.auth.getUser();
      if (!auth.data || !auth.data.user) { feedback.textContent = 'Connectez-vous pour envoyer une demande de devis.'; button.disabled = false; return; }
      var d = new FormData(form), budget = d.get('budget');
      var payload = {
        requester_id: auth.data.user.id,
        artisan_id: String(d.get('artisan_id') || '').trim() || null,
        service: String(d.get('service') || '').trim(),
        city: String(d.get('city') || '').trim(),
        budget_fcfa: budget ? Number(budget) : null,
        details: String(d.get('details') || '').trim(),
        status: 'pending'
      };
      var result = await supabase.from('quote_requests').insert(payload).select('id').single();
      if (result.error) throw result.error;
      form.reset(); feedback.textContent = 'Demande envoyée. Vous pourrez suivre son statut depuis votre espace.';
      toast('Demande de devis envoyée'); setTimeout(closeModal, 1300);
    } catch (err) {
      console.error('[CamerLink devis]', err);
      feedback.textContent = /quote_requests|relation/i.test(String(err.message || err))
        ? 'Le module de devis attend l’activation de sa migration Supabase. Réessayez après déploiement complet.'
        : 'Impossible d’envoyer la demande. Vérifiez votre connexion puis réessayez.';
    } finally { button.disabled = false; }
  }
  function mountActions() {
    if (!document.body || document.getElementById('cl-growth-actions')) return;
    var bar = document.createElement('div'); bar.id = 'cl-growth-actions'; bar.className = 'cl-growth-actions';
    bar.innerHTML = '<button type="button" data-action="quote">＋ Demander un devis</button><button type="button" data-action="share">↗ Partager CamerLink</button>';
    document.body.appendChild(bar);
    bar.addEventListener('click', function(e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.action === 'quote') openModal();
      if (b.dataset.action === 'share') shareApp();
    });
  }
  async function shareApp() {
    var data = { title: 'CamerLink — Le Cameroun connecté', text: 'Découvre des annonces, des artisans et des services près de toi sur CamerLink.', url: location.origin + '/' };
    try {
      if (navigator.share) await navigator.share(data);
      else if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(data.url); toast('Lien CamerLink copié'); }
      else window.prompt('Copiez le lien CamerLink :', data.url);
    } catch (e) { if (e && e.name !== 'AbortError') toast('Partage indisponible sur cet appareil.'); }
  }
  function addListingShortcuts() {
    // Do not overwrite existing app controls; provide universal share links on eligible listing cards.
    document.querySelectorAll('[data-annonce-id], .annonce-card[data-id], .ad-card[data-id]').forEach(function(card) {
      if (card.dataset.clGrowthShare === '1') return;
      var id = card.getAttribute('data-annonce-id') || card.getAttribute('data-id');
      if (!id) return;
      card.dataset.clGrowthShare = '1';
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cl-growth-card-share'; btn.textContent = '↗ Partager';
      btn.addEventListener('click', function(ev) {
        ev.preventDefault(); ev.stopPropagation();
        var url = location.origin + '/?annonce=' + encodeURIComponent(id);
        if (navigator.share) navigator.share({title:'Annonce CamerLink',url:url}).catch(function(){});
        else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function(){toast('Lien de l’annonce copié');});
        else window.prompt('Copiez le lien :', url);
      });
      card.appendChild(btn);
    });
  }
  function init() {
    addStyle(); mountActions(); addListingShortcuts();
    var observer = new MutationObserver(function(){ mountActions(); addListingShortcuts(); });
    observer.observe(document.body, {childList:true,subtree:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();