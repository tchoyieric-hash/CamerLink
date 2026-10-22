# CamerLink — validation de stabilisation finale

Cette branche ajoute une couche CSS isolée pour limiter les débordements sur Android, respecter les zones de sécurité de l'écran et éviter que les grilles d'annonces ou les médias débordent horizontalement. Elle ne change pas le routeur, les scripts d'authentification, les requêtes Supabase ou les données de production.

## Contrôles obligatoires sur l'aperçu Vercel

- [ ] Ouvrir l'accueil en session déconnectée et connectée.
- [ ] Confirmer que l'accueil quitte l'écran initial et ne reste pas en chargement.
- [ ] Se connecter, se déconnecter et actualiser la page.
- [ ] Ouvrir les annonces, photos, profils, Réels, statuts, messages et avis.
- [ ] Publier une photo, une vidéo et un statut avec un compte de test.
- [ ] Vérifier les échanges entre deux comptes de test et les permissions des messages privés.
- [ ] Tester la navigation basse et le bouton Retour Android; ne pas ajouter de nouveau bouton Retour personnalisé pendant ce test.
- [ ] Tester une largeur mobile de 320 px et une largeur desktop.
- [ ] Vérifier la console navigateur et les requêtes réseau lors de tout chargement bloqué.

## Avis Supabase à traiter séparément

Les contrôles de sécurité ont signalé des fonctions SECURITY DEFINER exécutables par des rôles publics ou authentifiés, ainsi que des tables public.admins, public.statut_vues et public.vues_log sans politiques RLS. Il faut lire le corps de chaque fonction, confirmer les besoins d'accès et définir des politiques adaptées avant de modifier les permissions. Ne pas appliquer une révocation globale sans tests : certaines fonctions peuvent être nécessaires aux flux publics des statuts, Réels, profils ou compteurs.

L'avertissement de protection contre les mots de passe compromis doit aussi être traité dans les paramètres Auth de Supabase.

## Limites

Un statut de déploiement Vercel READY confirme que le déploiement a abouti, pas que tous les parcours sont fonctionnels. Cette branche ne doit être fusionnée qu'après tests interactifs sur l'aperçu. Aucune migration Supabase ni modification de la production n'est effectuée par cette couche CSS.
