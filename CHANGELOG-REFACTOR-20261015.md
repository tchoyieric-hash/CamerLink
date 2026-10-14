# CamerLink — refactoring de `script.js` (15 octobre 2026)

`script.js` passe de 1 781 à 1 444 lignes sans changement de comportement voulu.

## Nouvelle structure
| Fichier | Rôle |
|---|---|
| `config.js` | Constantes et listes de référence (buckets, limites, catégories, villes, quartiers). Expose `window.CamerLinkConfig`. |
| `utils.js` | Fonctions pures : `$`, `esc`, `withTimeout`, `isVideo`, `fmtDate`, `waNumber`, `normPhone`, `qKey`, `normQuartier`. Expose `window.CamerLinkUtils`. |
| `reels.css` | Styles Reels mobiles, auparavant injectés en JavaScript. |
| `script.js` | Logique applicative (annonces, reels, statuts, messagerie, auth, fiches, admin). |
| `profil.js` | Modules de profil extraits de `script.js`. **Non chargé** (voir ci-dessous). |

Ordre de chargement dans `index.html` : `config.js` → `utils.js` → `script.js` → `statuts.js` → `shell.js`.

## Retiré d'`index.html` et de `script.js`
- Gabarit placé après `</html>` : trois vues vides et une barre de navigation de trois boutons sans aucun style CSS. Le gestionnaire de navigation associé est supprimé avec lui. Le HTML se termine maintenant correctement.
- Trois écouteurs `DOMContentLoaded` du profil (aucun élément ciblé n'existe dans `index.html`), déplacés dans `profil.js`.

## Vérifié
- `node --check` sur tous les fichiers.
- Test d'équivalence dans un faux navigateur : l'ancien et le nouveau `script.js` effectuent les mêmes appels (éléments du DOM, requêtes Supabase, `fetch`, URL) dans le même ordre. Seules différences : l'injection de style Reels (désormais `reels.css`, contenu identique) et les trois écouteurs retirés.
- Les fonctions utilitaires donnent des résultats identiques à l'original sur 11 entrées dont des cas limites (numéros +237, accents, HTML).
- Les 7 fonctions globales utilisées par le HTML restent exposées.

## Non vérifié
- Aucun test dans un vrai navigateur : l'équivalence est prouvée au chargement, pas sur chaque clic. Tester publication, favoris, messagerie, statuts et admin en preview avant production.

## Suite recommandée
Les blocs restants de `script.js` partagent un état commun (`currentUser`, `allListings`, `sb`). Les séparer (favoris, messagerie, auth, statuts, admin) demande un objet d'état partagé et des tests navigateur : à faire en preview, un module à la fois.
