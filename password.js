(() => {
  'use strict';
  const SB_URL = 'https://lviddipduhaelxcvyykc.supabase.co';
  const SB_KEY = 'sb_publishable_j0C8eL1g6hgAcnL4gU_zRg_jvi0bmYH';
  const ADMIN_WA = '237656725369';
  const $ = (id) => document.getElementById(id);
  if (!window.supabase) return;
  const sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { autoRefreshToken: false } });

  function toast(msg) {
    const t = $('toast');
    if (!t) { alert(msg); return; }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 3500);
  }

  /* 1) Lien "Mot de passe oublié" */
  const submit = $('phoneSubmit');
  if (submit) {
    const p = document.createElement('p');
    p.className = 'form-hint';
    p.style.textAlign = 'center';
    p.innerHTML = '<a href="#" id="pwForgot" style="color:var(--a1);font-weight:600">Mot de passe oublié ?</a>';
    submit.insertAdjacentElement('afterend', p);
    $('pwForgot').addEventListener('click', (e) => {
      e.preventDefault();
      const num = ($('authPhone') || {}).value || '';
      const msg = "Bonjour CamerLink, j'ai oublié mon mot de passe." +
        (num ? ' Mon numéro : ' + num + '.' : '') + ' Merci de le réinitialiser.';
      window.open('https://wa.me/' + ADMIN_WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  }

  /* 2) Changer son mot de passe */
  document.body.insertAdjacentHTML('beforeend',
    '<div id="pwModal" class="modal-overlay" role="dialog" aria-modal="true"><div class="modal-sheet">' +
    '<div class="modal-header"><h3>🔑 Changer mon mot de passe</h3><button type="button" class="modal-close" id="pwClose" aria-label="Fermer">×</button></div>' +
    '<div class="form-group"><label for="pwNew">Nouveau mot de passe (8 caractères minimum)</label><input class="form-sheet-el" id="pwNew" type="password" autocomplete="new-password"></div>' +
    '<div class="form-group"><label for="pwNew2">Répétez le mot de passe</label><input class="form-sheet-el" id="pwNew2" type="password" autocomplete="new-password"></div>' +
    '<button type="button" class="btn-submit-modal" id="pwSave">Enregistrer</button>' +
    '<p class="form-error" id="pwErr" role="alert"></p></div></div>');

  const footer = document.querySelector('footer');

  /* 3) Lien Informations légales dans le pied de page */
  if (footer) {
    const legal = document.createElement('p');
    legal.style.marginTop = '8px';
    legal.innerHTML = '<a href="legal.html" style="color:var(--a1);font-weight:600">Informations légales · Contact</a>';
    footer.appendChild(legal);
  }

  const link = document.createElement('p');
  link.hidden = true;
  link.innerHTML = '<a href="#" id="pwChange" style="color:var(--a1);font-size:.85rem;font-weight:600">🔑 Changer mon mot de passe</a>';
  if (footer) footer.appendChild(link);

  async function refresh() {
    try {
      const { data } = await sb.auth.getSession();
      link.hidden = !(data && data.session);
    } catch (e) { link.hidden = true; }
  }
  refresh();
  document.addEventListener('click', () => setTimeout(refresh, 800));

  const close = () => $('pwModal').classList.remove('active');
  $('pwClose').addEventListener('click', close);
  $('pwModal').addEventListener('click', (e) => { if (e.target.id === 'pwModal') close(); });
  $('pwChange').addEventListener('click', (e) => {
    e.preventDefault();
    $('pwNew').value = '';
    $('pwNew2').value = '';
    $('pwErr').textContent = '';
    $('pwModal').classList.add('active');
  });

  $('pwSave').addEventListener('click', async () => {
    const a = $('pwNew').value, b = $('pwNew2').value, err = $('pwErr'), btn = $('pwSave');
    err.textContent = '';
    if (a.length < 8) { err.textContent = 'Minimum 8 caractères.'; return; }
    if (a !== b) { err.textContent = 'Les deux mots de passe sont différents.'; return; }
    btn.disabled = true;
    try {
      const { error } = await sb.auth.updateUser({ password: a });
      if (error) throw error;
      close();
      toast('Mot de passe changé.');
    } catch (ex) {
      const m = String((ex && ex.message) || '');
      err.textContent = /same|different/i.test(m) ? 'Choisissez un mot de passe différent de l\'ancien.'
        : /weak|password/i.test(m) ? 'Mot de passe trop faible. Essayez-en un plus long.'
        : 'Impossible de changer. Reconnectez-vous puis réessayez.';
    } finally { btn.disabled = false; }
  });
})();
