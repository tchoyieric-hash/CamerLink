# CamerLink — page profil personnelle (15 octobre 2026)

## Nouveau
Onglet « Profil » de la barre du bas : une page personnelle qui assemble trois écrans de référence.

- **En-tête** : avatar (logo de l'entreprise ou initiale) avec « + » pour publier un statut, statistiques réelles (annonces, vues, favoris), nom, présentation, ville, numéro de compte masqué, boutons « Modifier le profil » et « Partager le profil ».
- **Statuts** : bouton « Nouveau » et statuts actifs (24 h) avec visionneuse.
- **Onglets** : mes annonces, mes vidéos, mes favoris, en grille de trois colonnes ; un appui ouvre la fiche de l'annonce.
- **Menu** (bouton ☰) : carte du profil, « Inviter des ami(e)s », raccourcis (messages, mes annonces, favoris, publier, annonces, découvrir, reels, statuts), « Paramètres et confidentialité » (thème, mentions légales, vider le cache), « Aide et assistance » (WhatsApp du support publié dans `legal.html`), changer de compte, déconnexion.
- Visiteur non connecté : carte de connexion et menu public.

## Fichiers
- `profil-page.js` (nouveau) : module avec dépendances injectées.
- `profil.css` : feuille déjà présente, branchée et complétée.
- `script.js` : expose `window.CamerLinkApp` (client Supabase, utilisateur, favoris, ouverture d'annonce, connexion, statut).
- `shell.js` : mode `profil`, `window.CamerLinkShell.setMode`, l'onglet Profil ne déclenche plus « Connexion/Déconnexion ».
- `index.html` : section `#profile-section`, `profil.css`, `profil-page.js`.
- `sw.js` : cache `camerlink-v6`.

## Données
- Lecture : `annonces` (user_id), `artisan_stories` (artisan_id), `etablissements` (user_id), `business_spaces` (owner_id), `favoris` via les identifiants locaux.
- Écriture : uniquement `auth.updateUser` (nom affiché et présentation, stockés dans les métadonnées du compte). Aucune table ni règle Supabase à modifier.
- Aucun système d'abonnés/abonnements n'existe dans CamerLink : ces compteurs ne sont pas affichés.

## Correctif transversal
`font: 600 14px inherit` est une déclaration invalide (le mot-clé `inherit` ne peut pas figurer dans le raccourci `font`) : le navigateur l'ignorait. Corrigé dans `profil.css` et `shell.css` (étiquettes de la barre du bas). Un test empêche sa réapparition.

## Vérifié
- 8 tests fonctionnels de la page (faux DOM) : connexion, identité et échappement du HTML, statistiques, numéro masqué, statuts HTTPS uniquement, onglets, ouverture d'annonce, menu, accordéon, partage, modification du profil, visionneuse, erreur réseau avec nouvel essai.
- 3 tests d'intégration (point d'accès, ordre des scripts, CSS).

## Non vérifié
- Rendu réel dans le navigateur et sur téléphone (aperçu visuel fait à part, pas la page déployée).
- Que les règles Supabase autorisent la lecture de `etablissements`/`business_spaces` pour son propre compte : sinon l'identité retombe sur le nom affiché ou « Mon profil ».
- `auth.updateUser` : fonctionne avec les comptes par téléphone créés par `phone-signup` ; à confirmer en preview.

## À savoir
`profil.html` (maquette statique avec une image factice) n'est toujours utilisé nulle part et peut être supprimé.

---

# Ajout : photo de profil

- « Modifier le profil » permet de changer ou retirer la photo, avec aperçu avant enregistrement.
- Formats JPEG, PNG, WebP ; photo d'origine jusqu'à 15 Mo. Elle est recadrée en carré centré, réduite à 512 px et compressée en JPEG avant l'envoi.
- Stockage : bucket `annonces-images`, chemin `<id utilisateur>/avatar-<horodatage>.jpg`, même convention que les images d'annonces (donc mêmes règles d'accès). L'adresse est enregistrée dans les métadonnées du compte (`avatar_url`) ; aucune table à modifier.
- La photo du compte passe avant le logo de l'entreprise.
- Ancienne photo supprimée après remplacement ou retrait, uniquement si son chemin est `<id utilisateur>/avatar-…` ; sans conséquence si les règles Supabase l'interdisent.
- En cas d'échec de l'enregistrement après l'envoi, le fichier envoyé est supprimé (pas d'orphelin).
- 6 tests supplémentaires (format, taille, envoi, remplacement, retrait, chemin étranger, échecs, recadrage).

À vérifier en preview : que les règles du bucket `annonces-images` autorisent l'écriture dans `<id utilisateur>/avatar-….jpg` (si elles n'acceptent que certains noms de fichier, l'erreur s'affiche dans la fenêtre et rien n'est enregistré).

---

# Ajout : repérage de la nouvelle page

- `profil.html` (ancienne maquette statique) redirige désormais vers `/#profil`, la nouvelle page. La page profil se trouve dans `index.html`, onglet « Profil » de la barre du bas.
- Le menu affiche « CamerLink · version … » en bas : permet de vérifier quelle version est réellement en ligne.
- Cache : `profil.css?v=3`, `profil-page.js?v=2`, `config.js?v=2`, service worker `camerlink-v7`.
