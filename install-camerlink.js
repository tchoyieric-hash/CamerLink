(function () {
  'use strict';

  var button = document.getElementById('installAppBtn');
  if (!button) return;

  var installPrompt = null;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    navigator.standalone === true;

  if (isInstalled) {
    button.hidden = true;
    button.style.display = 'none';
    return;
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    installPrompt = event;
    button.textContent = '⬇ Installer';
    button.setAttribute('aria-label', 'Installer CamerLink');
  });

  window.addEventListener('appinstalled', function () {
    installPrompt = null;
    button.hidden = true;
    button.style.display = 'none';
  });

  button.addEventListener('click', async function () {
    if (installPrompt) {
      installPrompt.prompt();
      try {
        await installPrompt.userChoice;
      } catch (error) {
        console.warn('[CamerLink] Résultat de l’installation indisponible.', error);
      }
      installPrompt = null;
      return;
    }

    if (isIOS) {
      window.alert('Pour installer CamerLink sur iPhone : appuyez sur Partager, puis « Sur l’écran d’accueil ».');
      return;
    }

    window.alert('Pour installer CamerLink : ouvrez le menu ⋮ de Chrome, puis choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ». Si cette option n’apparaît pas, rechargez la page et réessayez après quelques instants.');
  });
})();
