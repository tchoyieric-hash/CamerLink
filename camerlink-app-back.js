/* CamerLink — navigation retour navigateur et bouton Retour */
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
  function isHome(key) {
    return !key || ['home', 'accueil'].includes(key);
  }
  function updateButton() {
    let button = document.getElementById('cl-app-back');
    if (!button) return;
    button.hidden = appHistory.length === 0;
    button.setAttribute('aria-hidden', button.hidden ? 'true' : 'false');
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
      #cl-app-back{position:fixed;z-index:9998;left:14px;bottom:calc(82px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:11px 15px;background:#101a25;color:#fff;font:600 14px/1.1 system-ui,sans-serif;box-shadow:0 8px 24px #0005;cursor:pointer;touch-action:manipulation}
      #cl-app-back[hidden]{display:none!important}
      #cl-app-back svg{width:18px;height:18px;flex:none}
      @media(min-width:700px){#cl-app-back{bottom:24px;left:24px}}
      @media(prefers-reduced-motion:no-preference){#cl-app-back{transition:transform .15s ease,background .15s ease}#cl-app-back:active{transform:scale(.96)}}
    `;
    document.head.appendChild(style);
    const button = document.createElement('button');
    button.id = 'cl-app-back';
    button.type = 'button';
    button.hidden = true;
    button.setAttribute('aria-label', 'Retour à la page précédente');
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg><span>Retour</span>';
    button.addEventListener('click', goBack);
    document.body.appendChild(button);

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