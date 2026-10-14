# CamerLink — module messagerie et service worker (15 octobre 2026)

## Messagerie extraite (`messagerie.js`)
- Boîte de réception, conversations, badge « non lus » et abonnement temps réel déplacés hors de `script.js` (1 444 → 1 256 lignes).
- Les dépendances (`sb`, `toast`, modales, utilisateur courant, liste d'annonces, `shopInfo`) sont injectées par `script.js` via `CamerLinkMessagerie.create(ctx)` : le module ne lit aucune variable interne de `script.js`.
- `window.openChat` reste global (utilisé par les fiches d'annonces et d'artisans).
- Ordre de chargement : `config.js` → `utils.js` → `messagerie.js` → `script.js` → `statuts.js` → `shell.js` → `register-sw.js`.

## Service worker activé (`register-sw.js`)
- Enregistré en HTTPS ou en local uniquement ; une erreur d'enregistrement n'affecte pas l'application.
- Cache `camerlink-v5` : interface et fichiers statiques publics. Jamais en cache : API, admin, `/annonce/`, `/artisan/`, sitemap.
- Navigations en réseau d'abord, repli sur l'accueil hors-ligne.

## Vérifié
- Comparaison avant/après : 131 appels identiques, dans le même ordre, au chargement.
- 8 nouveaux tests (suite : 31 contrôles) : messagerie avec faux DOM et messages piégés (HTML échappé, envoi, refus de message à soi-même, refus sans connexion, badge, abonnement temps réel), enregistrement du service worker et liste d'installation.

## Non vérifié
- Aucun test dans un vrai navigateur ni sur téléphone : le mode hors-ligne et le temps réel Supabase doivent être testés en preview.
- Après déploiement, si une ancienne version s'affiche : actualiser en forçant le rechargement (le cache est versionné et l'ancien est supprimé à l'activation).

## Suite possible
Extraire de la même façon : favoris, statuts/stories, authentification, administration.
