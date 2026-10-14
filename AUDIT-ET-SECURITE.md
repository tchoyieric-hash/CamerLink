# CamerLink — rapport d'audit initial et plan de correction
Date : 14 octobre 2026
Périmètre : archive source fournie, sans connexion à Supabase et sans déploiement.

## Résumé
- Les fichiers JavaScript présents passent `node --check` avant correction.
- La clé Supabase côté navigateur est une clé publique/publishable : ce n'est pas, à elle seule, une preuve de fuite de secret.
- L'accès réel aux tables, buckets, RPC et fonctions administrateur n'a pas pu être confirmé sans examiner les politiques du projet Supabase.
- Le domaine canonique de `index.html` et le domaine par défaut des aperçus de partage ne correspondaient pas au lien de production communiqué par le propriétaire.
- `stories.js` injectait des valeurs de base de données dans du HTML et un gestionnaire inline.
- Le service worker mettait en cache toute réponse GET du même domaine, y compris potentiellement des routes dynamiques.

## Corrections appliquées dans cette archive
1. Canonical, Open Graph et JSON-LD de la page d'accueil alignés sur `https://camer-link-tchoyi-eric.vercel.app/`.
2. Domaine par défaut de `api/share.js` aligné sur la même URL.
3. Valeur de repli de la clé publique de partage alignée sur la clé publishable déjà utilisée par les autres modules. Configurer `SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SITE_URL` dans Vercel reste préférable.
4. `stories.js` construit les cartes via l'API DOM, sans interpolation de données de la base dans du HTML, et n'accepte que des URL HTTPS de Supabase.
5. `statuts.js` filtre les médias vers des URL HTTPS Supabase avant leur rendu.
6. `sw.js` ne met plus en cache les API, les pages d'administration, les routes de partage ou le sitemap. Les navigations sont network-first et le cache est limité à l'app shell et aux ressources statiques publiques.
7. Documentation de la portée, des tests et des étapes restantes.

## Points à vérifier manuellement dans Supabase avant production
- Tables `annonces`, `listings`, `avis`, `etablissements`, `artisan_stories` : RLS activé lorsque nécessaire.
- INSERT : l'identité de l'auteur est contrôlée côté base (pas seulement par l'interface).
- UPDATE/DELETE : un utilisateur ne peut modifier/supprimer que ses propres lignes, sauf rôle administrateur correctement protégé.
- Buckets `annonces-images`, `annonces-videos`, `artisan-stories` : types MIME, taille maximale, lecture publique justifiée et écriture limitée aux utilisateurs autorisés.
- RPC `story_authors` : droits d'exécution limités et données personnelles minimisées.
- Aucun secret `service_role`, mot de passe ou jeton d'administration dans les fichiers publics ou l'historique Git.
- Les pages d'administration doivent être protégées par une autorisation serveur/base, pas uniquement par `noindex` ou par un bouton caché.

## Tests exécutés dans l'archive corrigée
- Contrôle syntaxique Node.js des fichiers JavaScript : à relancer après chaque modification.
- Vérification textuelle des références canoniques et des routes de cache.
- Pas de test navigateur réel, de test réseau Supabase, de test mobile physique, de test RLS ni de test de déploiement effectué.

## Avant tout déploiement
1. Vérifier le domaine officiel et les variables d'environnement.
2. Tester inscription/connexion, publication, édition/suppression, favoris, statuts, vidéos, partage, formulaires et espace admin avec plusieurs comptes.
3. Tester les autorisations avec un utilisateur A puis un utilisateur B.
4. Vérifier la console navigateur, les logs Vercel et les erreurs Supabase.
5. Déployer d'abord une preview et obtenir la validation explicite du propriétaire avant la production.
