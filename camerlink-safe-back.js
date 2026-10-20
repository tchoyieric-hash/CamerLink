/* CamerLink — navigation retour non intrusive.
   N'ajoute aucun listener popstate/pushState et ne modifie pas le routeur existant. */
(function () {
  'use strict';
  if (window.__clSafeBackLoaded) return;
  window.__clSafeBackLoaded = true;

  var button = null;
  var lastMode = 'home';

  function isVisible(el) {
    if (!el || el.hidden) return false;
    var style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0;
  }

  function findOverlay() {
    var selectors = [
      '#cl-quote-modal:not([hidden])',
      '#authModal.open', '#publishModal.open', '#publishStoryModal.open', '#claimModal.open',
      '#storyViewerModal.open', '#wa-viewer.open', '.modal-overlay.open', '.cl-growth-overlay:not([hidden])'
    ];
    for (var i = selectors.length - 1; i >= 0; i--) {
      var nodes = document.querySelectorAll(selectors[i]);
      for (var j = nodes.length - 1; j >= 0; j--) {
        if (isVisible(nodes[j])) return nodes[j];
      }
    }
    return null;
  }

  function currentMode() {
    return document.body.getAttribute('data-cl-mode') || 'home';
  }

  function update() {
    if (!button) return;
    var overlay = findOverlay();
    var mode = currentMode();
    button.hidden = !overlay && mode === 'home';
    var label = overlay ? 'Fermer la fenêtre' : 'Retour à l’accueil';
    if (button.getAttribute('aria-label') !== label) button.setAttribute('aria-label', label);
  }

  function closeOverlay(overlay) {
    if (!overlay) return false;
    var close = overlay.querySelector(
      '.cl-growth-close, .modal-close, .close-story-btn, #wa-close, [data-close], [aria-label="Fermer"], [aria-label="Close"]'
    );
    if (close) {
      close.click();
      return true;
    }
    // N'effectue pas de fermeture générique qui pourrait laisser l'application dans un état incohérent.
    return false;
  }

  function goBack() {
    var overlay = findOverlay();
    if (overlay && closeOverlay(overlay)) {
      window.setTimeout(update, 80);
      return;
    }
    var home = document.querySelector('.shell-nav [data-m="home"], .shell-tab[data-m="home"]');
    if (currentMode() !== 'home' && home) {
      home.click(); // réutilise le routeur CamerLink existant
    } else if (window.history.length > 1) {
      window.history.back();
    }
    window.setTimeout(update, 100);
  }

  function mount() {
    if (button || !document.body) return;
    button = document.createElement('button');
    button.id = 'cl-safe-back';
    button.type = 'button';
    button.hidden = true;
    button.innerHTML = '<span aria-hidden="true">←</span><span>Retour</span>';
    button.setAttribute('aria-label', 'Retour à l’accueil');
    button.addEventListener('click', goBack);
    document.body.appendChild(button);

    lastMode = currentMode();
    update();

    // Observer uniquement l'état de navigation du body : pas de surveillance globale des styles.
    var modeObserver = new MutationObserver(function () {
      var mode = currentMode();
      if (mode !== lastMode) lastMode = mode;
      update();
    });
    modeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-cl-mode'] });

    // Les modales natives CamerLink utilisent class/hidden; la surveillance ne modifie jamais ces attributs.
    var overlayObserver = new MutationObserver(update);
    overlayObserver.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    document.addEventListener('click', function (event) {
      if (event.target.closest('.modal-close, .close-story-btn, #wa-close, [data-close], .cl-growth-close')) {
        window.setTimeout(update, 80);
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') window.setTimeout(update, 80);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();