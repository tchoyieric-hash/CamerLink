/* CamerLink — retour cohérent entre sections, fenêtres et navigation Android. */
(function () {
  'use strict';
  if (window.__camerLinkBackNavigationLoaded) return;
  window.__camerLinkBackNavigationLoaded = true;

  var modeStack = [];
  var knownMode = document.body.getAttribute('data-cl-mode') || 'home';
  var button;
  var replayingPop = false;
  var overlayWasActive = false;

  function visible(el) {
    if (!el || el.hidden) return false;
    var s = window.getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity || 1) > 0;
  }

  function activeOverlay() {
    var selectors = [
      '.bzo.open',
      '#cl-quote-modal:not([hidden])',
      '#authModal.open', '#publishModal.open', '#publishStoryModal.open', '#claimModal.open',
      '.modal-overlay.open',
      '#storyViewerModal.open',
      '#wa-viewer.open'
    ];
    for (var i = selectors.length - 1; i >= 0; i--) {
      var list = document.querySelectorAll(selectors[i]);
      for (var j = list.length - 1; j >= 0; j--) if (visible(list[j])) return list[j];
    }
    var dialogs = document.querySelectorAll('[role="dialog"], .modal-sheet');
    for (var k = dialogs.length - 1; k >= 0; k--) {
      var parent = dialogs[k].closest('.modal-overlay, .cl-growth-overlay, .bzo');
      if (parent && visible(parent)) return parent;
    }
    return null;
  }

  function currentMode() {
    return document.body.getAttribute('data-cl-mode') || 'home';
  }

  function update() {
    if (!button) return;
    var overlay = activeOverlay();
    var mode = currentMode();
    button.hidden = !overlay && mode === 'home';
    var label = overlay ? 'Fermer et revenir en arrière' : 'Retour à la section précédente';
    // Ne pas réécrire l'attribut s'il n'a pas changé : l'observateur DOM surveille aussi les attributs.
    if (button.getAttribute('aria-label') !== label) button.setAttribute('aria-label', label);
  }

  function addButton() {
    if (button) return;
    button = document.createElement('button');
    button.id = 'cl-global-back';
    button.type = 'button';
    button.hidden = true;
    button.innerHTML = '<span aria-hidden="true">←</span><span>Retour</span>';
    button.setAttribute('aria-label', 'Retour à la section précédente');
    button.addEventListener('click', goBack);
    document.body.appendChild(button);
    update();
  }

  function closeOverlay(overlay) {
    if (!overlay) return false;
    var close = overlay.querySelector(
      '.cl-growth-close, .modal-close, .close-story-btn, #wa-close, [data-close], [aria-label="Fermer"], [aria-label="Close"], .back'
    );
    if (close && close !== button) {
      close.click();
      return true;
    }
    if (overlay.classList.contains('open')) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      overlay.hidden = true;
      return true;
    }
    return false;
  }

  function goBack() {
    var overlay = activeOverlay();
    if (overlay && closeOverlay(overlay)) {
      window.setTimeout(update, 30);
      return;
    }
    if (modeStack.length) {
      var previous = modeStack.pop();
      var target = document.querySelector('.shell-tab[data-m="' + previous + '"]') ||
                   document.querySelector('.shell-nav [data-m="' + previous + '"]');
      if (target) target.click();
      else window.location.hash = previous === 'home' ? '' : previous;
    } else if (currentMode() !== 'home') {
      var home = document.querySelector('.shell-nav [data-m="home"], .shell-tab[data-m="home"]');
      if (home) home.click();
      else window.location.href = '/';
    } else if (window.history.length > 1) {
      window.history.back();
    }
    window.setTimeout(update, 80);
  }

  document.addEventListener('click', function (event) {
    var target = event.target.closest('.shell-tab[data-m], .shell-nav [data-m]');
    if (!target || target.id === 'cl-global-back' || replayingPop) return;
    var next = target.dataset.m;
    if (next && next !== knownMode) {
      modeStack.push(knownMode);
      if (modeStack.length > 30) modeStack.shift();
      // shell.js updates the URL with replaceState during the same click.
      // Push only after its handler has finished, otherwise its replaceState erases our entry.
      window.setTimeout(function () {
        try { window.history.pushState({ clMode: next }, '', next === 'home' ? location.pathname + location.search : '#' + next); } catch (e) {}
      }, 0);
    }
  }, true);

  var modeObserver = new MutationObserver(function () {
    var next = currentMode();
    if (next !== knownMode) knownMode = next;
    update();
  });
  modeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-cl-mode'] });

  var overlayObserver = new MutationObserver(function () {
    var isActive = !!activeOverlay();
    if (isActive && !overlayWasActive) {
      try { window.history.pushState({ clOverlay: true }, '', window.location.href); } catch (e) {}
    }
    overlayWasActive = isActive;
    update();
  });
  overlayObserver.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'hidden', 'aria-hidden'] });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') window.setTimeout(update, 30);
  });
  window.addEventListener('popstate', function () {
    var overlay = activeOverlay();
    if (overlay) {
      closeOverlay(overlay);
      overlayWasActive = false;
      window.setTimeout(update, 30);
      return;
    }
    var next = (window.location.hash || '').replace(/^#/, '') || 'home';
    if (next !== currentMode()) {
      var target = document.querySelector('.shell-tab[data-m="' + next + '"]') ||
                   document.querySelector('.shell-nav [data-m="' + next + '"]');
      if (target) {
        replayingPop = true;
        if (modeStack.length) modeStack.pop();
        target.click();
        replayingPop = false;
      }
    }
    window.setTimeout(update, 30);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addButton, { once: true });
  else addButton();
})();
