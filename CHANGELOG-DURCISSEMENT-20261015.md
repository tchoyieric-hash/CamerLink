# CamerLink — durcissement et tests (15 octobre 2026)

## Ajouts
- `vercel.json` : en-têtes `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy` (caméra, micro et géolocalisation désactivés pour l'API de la page), et `Cache-Control: no-cache` sur `sw.js`.
- `script.js` : compteurs affichés (vues, avis) convertis en nombres avant insertion dans le HTML.
- `tests/` + `npm test` : 23 contrôles automatiques (syntaxe, JSON, ressources référencées, chargement de l'application dans un faux navigateur, fonctions utilitaires, `api/share.js` avec données hostiles, exclusions du service worker). À relancer après chaque modification.
- `.vercelignore` : `tests/` et `package.json` ne sont pas servis.

## Revue d'injection HTML
Les 62 interpolations restantes de `script.js` ont été relues : elles sont échappées, numériques ou constantes. `shell.js` échappe ses données. Aucune autre injection trouvée.

## Limites
- Pas de Content-Security-Policy : l'application utilise des gestionnaires `onclick` inline et des styles inline, une CSP stricte les bloquerait. À étudier après un découpage supplémentaire.
- Les tests ne remplacent pas un test navigateur ni la revue des règles RLS/Storage Supabase.
