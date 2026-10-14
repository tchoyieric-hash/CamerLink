# CamerLink — finalisation et vérification (15 octobre 2026)

## Constat
Plusieurs corrections décrites dans `AUDIT-ET-SECURITE.md` n'étaient pas présentes dans le code de l'archive reçue. Elles sont maintenant appliquées.

## Corrections
- `api/share.js` et `robots.txt` : domaine aligné sur `https://camer-link-tchoyi-eric.vercel.app` (comme `index.html`). README corrigé (lien et artefacts de texte).
- `script.js` : suppression de `renderStatuses` (code mort, jamais appelé, injectait `media_url`, `author_name` et `id` sans échappement dans du HTML).
- `statuts.js` : seuls les médias HTTPS du stockage public Supabase sont rendus.
- `stories.js` : réécrit avec l'API DOM (fichier non chargé par `index.html`).
- `sw.js` : v3, ne met plus en cache API, admin, `/annonce/`, `/artisan/`, sitemap ; navigations network-first ; liste d'installation limitée à des fichiers existants.
- `manifest.webmanifest` : icônes 192/512/maskable ajoutées, couleurs alignées sur `index.html` (#050609).
- Retrait de `extras.js` (copie identique de `modifier.js`) et de `camerlink-github-upload.zip` (1 Mo servi publiquement).
- `Typescript` → `supabase/functions/analyze-image/index.ts`, faute `ContentType` corrigée. Cette fonction n'est appelée par aucune page.
- `.vercelignore` : `supabase/`, `*.md` et fichiers d'intégration ne sont plus servis publiquement.

## Vérifié ici
- `node --check` sur tous les fichiers JS ; JSON valides ; toutes les ressources référencées existent.
- `api/share.js` testé avec des données hostiles simulées : balises échappées, canonical correct.

## Non vérifié (hors de portée de cette archive)
- Politiques RLS et Storage Supabase, fonctions RPC (`is_admin`, `story_authors`, `admin_*`), bucket `annonces-videos`, colonne `video_url`.
- Parcours réels (inscription, publication, vidéo, statuts, messagerie, admin) sur navigateur et mobile.
- Déploiement preview Vercel et variables `SITE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

## Décisions laissées au propriétaire
- `sw.js` n'est enregistré nulle part : le mode hors-ligne PWA est inactif. L'activer demande un `navigator.serviceWorker.register('/sw.js')` et un test.
- `modifier.js` et `password.js` ne sont chargés par aucune page ; `profil.html` contient une image factice. À brancher ou supprimer.
- `CHANGELOG-LANCEMENT-20261014.md` cite l'ancien domaine `camerlink.vercel.app` (document historique).
