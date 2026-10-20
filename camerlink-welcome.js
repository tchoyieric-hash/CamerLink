/* CamerLink — welcome / authentication gate */
(function(){
  'use strict';
  var gate=document.getElementById('cl-welcome-gate');
  var authBtn=document.getElementById('authBtn');
  var authModal=document.getElementById('authModal');
  var form=document.getElementById('phoneForm');
  var title=authModal&&authModal.querySelector('.modal-header h3');
  var submit=document.getElementById('phoneSubmit');
  var register=document.getElementById('cl-welcome-register');
  var login=document.getElementById('cl-welcome-login');
  if(!gate||!authBtn)return;
  function authenticated(){return /déconnexion/i.test(authBtn.textContent||'');}
  function sync(){gate.hidden=authenticated();}
  function openAuth(isRegister){
    if(title)title.textContent=isRegister?'Créer mon compte CamerLink':'Connexion à CamerLink';
    if(submit)submit.textContent=isRegister?'Créer mon compte':'Se connecter';
    var help=form&&form.querySelector('p:not(.form-error)');
    if(help)help.textContent=isRegister?'Utilise ton numéro de téléphone et choisis un mot de passe d’au moins 6 caractères.':'Entre le numéro et le mot de passe associés à ton compte.';
    var close=authModal&&authModal.querySelector('[data-close="authModal"]');
    if(close)close.setAttribute('aria-label','Fermer la fenêtre de connexion');
    var modal=window.jQuery; // no dependency; the existing modal uses the active class
    if(authModal)authModal.classList.add('active');
  }
  if(register)register.addEventListener('click',function(){openAuth(true);});
  if(login)login.addEventListener('click',function(){openAuth(false);});
  if(window.MutationObserver){
    new MutationObserver(sync).observe(authBtn,{childList:true,characterData:true,subtree:true});
  }
  sync();
  // Re-check after Supabase restores a saved session asynchronously.
  window.setTimeout(sync,250);
  window.setTimeout(sync,1000);
})();
