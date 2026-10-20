/* CamerLink Social Discovery — connects shortcuts to existing app features. */
(() => {
  'use strict';
  if (window.__clSocialDiscoveryLoaded) return;
  window.__clSocialDiscoveryLoaded = true;
  const $ = (s) => document.querySelector(s);
  document.addEventListener('click', (event) => {
    const jump = event.target.closest('[data-cl-jump]');
    if (jump) {
      const target = $(jump.getAttribute('data-cl-jump'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const cityButton = event.target.closest('[data-cl-city]');
    if (cityButton) {
      const city = cityButton.getAttribute('data-cl-city');
      const filter = $('#cityFilter');
      if (filter) {
        const option = Array.from(filter.options).find(o => o.value.toLocaleLowerCase('fr').includes(city.toLocaleLowerCase('fr')) || o.textContent.toLocaleLowerCase('fr').includes(city.toLocaleLowerCase('fr')));
        if (option) {
          filter.value = option.value;
          filter.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      const note = $('#cl-social-map-note');
      if (note) note.textContent = 'Ouverture de la carte de ' + city + '. Le filtre des annonces a été appliqué si cette ville est disponible dans la liste.';
      window.open('https://www.openstreetmap.org/search?query=' + encodeURIComponent(city + ', Cameroun'), '_blank', 'noopener,noreferrer');
      return;
    }
    if (event.target.closest('#cl-social-camera')) {
      const publish = $('#pubBtn') || $('#nav-add');
      if (publish) publish.click();
      else {
        const note = $('#cl-social-map-note');
        if (note) note.textContent = 'Le formulaire de publication est introuvable sur cette page. Rechargez puis réessayez.';
      }
    }
  });
})();
