/* CamerLink — navigation retour intégrée à l'en-tête */
(() => {
  'use strict';
  const tabs = () => [...document.querySelectorAll('[data-m]')];
  const keyFor = (el) => el?.dataset?.m || (el?.id === 'nav-msg' ? 'messages' : el?.id === 'nav-me' ? 'profil' : '');
  let current = 'home';
  let appHistory = [];
  let restoring = false;

  function clickTab(key) {
    const candidates = tabs().filter(el => keyFor(el) === key);
    const target = candidates.find(el => el.offsetParent !== null) || candidates[0];
    if (target) target.click();
  }
  function isHome(key) { return !key || ['home', 'accueil'].includes(key); }
  function updateButton() {
    const button = document.getElementById('cl-app-back');
    if (!button) return;
    const visible = appHistory.length > 0 || !isHome(current);
    button.hidden = !visible;
    button.setAttribute('aria-hidden', visible ? 'false' : 'true');
    document.querySelector('.cl-top')?.classList.toggle('cl-has-back', visible);
  }
  function goBack() {
    if (appHistory.length) {
      const previous = appHistory.pop();
      restoring = true;
      current = previous;
      clickTab(previous);
      history.replaceState({ ...(history.state || {}), camerlinkTab: current }, '', location.href);
      restoring = false;
      updateButton();
    } else if (!isHome(current)) {
      current = 'home';
      clickTab('home');
      history.replaceState({ camerlinkTab: 'home' }, '', location.href);
      updateButton();
    } else if (history.length > 1) {
      history.back();
    }
  }
  function init() {
    if (document.getElementById('cl-app-back')) return;
    const style = document.createElement('style');
    style.textContent = `
      .cl-top #cl-app-back{
        position:relative; inset:auto; z-index:2; flex:0 0 auto;
        display:inline-flex; align-items:center; justify-content:center; gap:7px;
        min-width:40px; height:40px; padding:0 12px;
        border:1px solid rgba(255,255,255,.14); border-radius:14px;
        color:var(--color-text-main,#fff);
        background:linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.035));
        box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 5px 16px rgba(0,0,0,.12);
        font:650 13px/1 system-ui,sans-serif; letter-spacing:.01em;
        cursor:pointer; touch-action:manipulation; white-space:nowrap;
        transition:background .18s ease,border-color .18s ease,transform .18s ease;
      }
      .cl-top #cl-app-back[hidden]{display:none!important}
      .cl-top #cl-app-back svg{width:18px;height:18px;flex:none}
      .cl-top #cl-app-back:hover{background:rgba(255,255,255,.13);border-color:rgba(255,255,255,.28)}
      .cl-top #cl-app-back:active{transform:scale(.96)}
      .cl-top #cl-app-back:focus-visible{outline:3px solid #facc15;outline-offset:3px}
      .cl-top.cl-has-back{gap:10px}
      .cl-top.cl-has-back .logo-brand{min-width:0}
      @media(max-width:480px){
        .cl-top #cl-app-back{width:38px;min-width:38px;height:38px;padding:0;border-radius:13px}
        .cl-top #cl-app-back .cl-back-label{display:none}
        .cl-top.cl-has-back{padding-left:10px;padding-right:10px;gap:8px}
        .cl-top.cl-has-back .logo-brand{font-size:1.08rem}
        .cl-top.cl-has-back .brand-logo-img{width:26px;height:26px;object-fit:contain}
        .cl-top.cl-has-back .header-actions{gap:3px}
      }
      @media(prefers-reduced-motion:reduce){.cl-top #cl-app-back{transition:none}}
    `;
    document.head.appendChild(style);

    const button = document.createElement('button');
    button.id = 'cl-app-back';
    button.type = 'button';
    button.hidden = true;
    button.setAttribute('aria-label', 'Retour à l’écran précédent');
    button.title = 'Retour';
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg><span class="cl-back-label">Retour</span>';
    button.addEventListener('click', goBack);

    const header = document.querySelector('.cl-top');
    const logo = header?.querySelector('.logo-brand');
    if (header && logo) header.insertBefore(button, logo);
    else document.body.appendChild(button);

    document.addEventListener('click', event => {
      const el = event.target.closest('[data-m],#nav-msg,#nav-me');
      if (!el || restoring) return;
      const next = keyFor(el);
      if (!next || next === current) return;
      if (!isHome(current)) appHistory.push(current);
      else if (!isHome(next)) appHistory.push('home');
      current = next;
      history.pushState({ camerlinkTab: current }, '', location.href);
      updateButton();
    }, true);

    window.addEventListener('popstate', event => {
      const destination = event.state?.camerlinkTab;
      if (destination) {
        restoring = true;
        current = destination;
        const index = appHistory.lastIndexOf(destination);
        if (index >= 0) appHistory = appHistory.slice(0, index);
        else if (isHome(destination)) appHistory = [];
        clickTab(destination);
        restoring = false;
        updateButton();
      } else {
        goBack();
      }
    });
    if (history.state?.camerlinkTab) current = history.state.camerlinkTab;
    else history.replaceState({ ...(history.state || {}), camerlinkTab: current }, '', location.href);
    updateButton();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();