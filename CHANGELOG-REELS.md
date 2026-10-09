# Mise à jour CamerLink — Reels vidéo

## Ajout réalisé
- Ajout d'une section « CamerLink Reels » dans la page d'accueil.
- Le flux récupère automatiquement les annonces qui possèdent déjà une `video_url` HTTPS dans la table Supabase `annonces`.
- Présentation verticale 9:16, avec lecture automatique muette et en boucle lorsque la vidéo est visible.
- Mise en pause des autres vidéos lorsque l'utilisateur fait défiler le flux.
- Bouton pour activer/couper le son.
- Accès à la fiche de l'annonce et contact WhatsApp quand le numéro de contact est disponible.
- État vide avec accès à la publication d'annonce.
- Mise en page adaptée au mobile (carrousel horizontal) et aux grands écrans (grille).

## Préservation
Les fichiers existants et les fonctionnalités d'authentification, de publication, de favoris, de stories, de messagerie, de fiches artisans, de partage et d'administration ont été conservés. Les changements fonctionnels sont limités à `index.html`, `script.js` et `style.css`. Aucun changement de schéma Supabase n'est requis.

## Condition pour afficher les vidéos
Les annonces doivent déjà contenir une URL vidéo accessible publiquement via HTTPS dans le champ `video_url`. Le flux n'invente pas de contenu vidéo et n'ajoute pas de données fictives.

## Vérifications effectuées
- Vérification de syntaxe JavaScript avec `node --check script.js`.
- Vérification de la présence unique des conteneurs HTML du flux vidéo.

## Avant déploiement
1. Dézipper cette archive.
2. Remplacer les fichiers correspondants dans le dépôt existant (ou téléverser les fichiers modifiés via GitHub).
3. Déployer sur Vercel comme d'habitude.
4. Tester avec une annonce contenant une vidéo dans `video_url`, sur téléphone et ordinateur.

Note sécurité : la clé Supabase présente dans le navigateur semble être une clé publique/anon. Elle ne doit jamais être une clé `service_role`. Vérifier les politiques Row Level Security (RLS) et les règles de stockage Supabase, car elles sont essentielles pour protéger les données.
