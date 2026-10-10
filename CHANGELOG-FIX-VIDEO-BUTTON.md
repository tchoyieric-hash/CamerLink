# Correctif du bouton Ajouter une vidéo

- Le bouton Reels ouvre la fenêtre de publication et amène l'utilisateur au contrôle natif de sélection vidéo.
- Suppression de la dépendance à `input.click()` immédiatement après l'ouverture de la modale, souvent bloquée sur mobile.
- Mise en évidence de la zone vidéo et consignes explicites pour Android/iOS.
- Amélioration de l'affichage mobile des Reels : cartes verticales défilables horizontalement au lieu de colonnes trop étroites.

À vérifier après déploiement : authentification, bucket Supabase `annonces-videos`, règles Storage et insertion de `video_url` dans `annonces`.
