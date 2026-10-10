# CamerLink — finition futuriste et ajout rapide de vidéos

## Changements
- Finition visuelle plus futuriste : accents cyan/violet, surfaces vitrées, reliefs subtils, états de survol et focus clavier visibles, sans remplacer les composants fonctionnels existants.
- Nouveau bouton **« + Ajouter une vidéo »** dans l'en-tête de CamerLink Reels.
- Le bouton réutilise le formulaire de publication actuel : utilisateur non connecté → ouverture de la connexion ; utilisateur connecté → ouverture du formulaire et focus sur le sélecteur vidéo.
- La vidéo reste facultative pour publier une annonce ; les règles existantes de format, de taille, d'envoi Supabase et d'enregistrement de `video_url` sont conservées.
- Mise en page du bouton adaptée aux petits écrans et respect de la préférence système de réduction des animations.
- Mise à jour des paramètres de cache des fichiers CSS et JavaScript.

## Fonctionnalités conservées
Authentification, annonces, photos, favoris, catégories, filtres, stories/statuts, messagerie, WhatsApp, fiches artisans, administration et flux Reels.

## Vérifications effectuées
- `node --check script.js` : réussi.
- Contrôle des éléments HTML ciblés et de la présence du bouton `addVideoBtn` : réussi.

## À vérifier avant la mise en production
- Le bucket Supabase `annonces-videos` doit exister, être accessible selon les politiques Storage attendues et permettre la lecture publique des vidéos destinées au flux.
- La colonne `annonces.video_url` doit exister.
- Effectuer un test de publication réel avec un compte de test sur mobile et ordinateur. La syntaxe vérifiée ne garantit pas à elle seule les autorisations Supabase ou le fonctionnement de production.

Cette archive n'a pas été déployée et ne modifie pas le dépôt GitHub distant.
