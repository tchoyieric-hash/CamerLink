# CamerLink — intégration progressive des améliorations (20 octobre 2026)

## Changements de cette branche
- Ajout du bouton Retour dans un module isolé : `camerlink-safe-back.js` et `camerlink-safe-back.css`.
- Le bouton réutilise la navigation existante en cliquant sur l'onglet Accueil ; il ne modifie pas `history.pushState`, `popstate` ni le routeur.
- Le bouton ferme d'abord les modales qui exposent déjà un bouton de fermeture CamerLink.
- Les deux ressources sont chargées depuis `index.html` et ajoutées au cache du service worker ; la version du cache PWA est incrémentée.
- Les demandes de devis, le partage et les favoris sont déjà dans la suite de croissance fusionnée précédemment. Les favoris restent locaux à l'appareil et le module devis requiert la migration SQL indiquée plus bas.

## Vérifications effectuées ici
- Vérification que `index.html` référence le JS et le CSS.
- Vérification que `sw.js` met les deux ressources en cache et change le nom du cache.
- Contrôle syntaxique du fichier JS : JS parsed successfully.
- Les tests réels dans un navigateur mobile, le test Vercel preview et le test Supabase avec deux comptes restent à effectuer avant fusion.

## Tests manuels obligatoires avant fusion
1. Ouvrir Accueil : le bouton Retour doit être masqué.
2. Ouvrir Réels, Statuts, Annonces, Découvrir et Profil : Retour doit revenir à Accueil sans bloquer les commandes.
3. Ouvrir et fermer Connexion, Publication, Statut, Devis et visionneuse de story : la fermeture doit rester gérée par les boutons natifs.
4. Vérifier le plein écran des Reels, l'envoi/lecture de messages, les avis, les annonces et l'upload photo/vidéo.
5. Vérifier l'application installée (PWA) après mise à jour du cache.
6. Pour les devis : appliquer la migration `supabase/migrations/202610190001_quote_requests.sql` d'abord sur une base de test et vérifier les politiques RLS avec deux utilisateurs différents. Ne pas appliquer automatiquement la migration en production.

## Non inclus / nécessite un service externe
- Paiements Mobile Money, abonnements et boosts payants réels.
- Vérification humaine des artisans.
- Notifications push serveur et modération anti-spam complète.
Ces éléments nécessitent un fournisseur, une configuration serveur ou une procédure opérationnelle ; ils ne doivent pas être simulés comme s'ils étaient actifs.
