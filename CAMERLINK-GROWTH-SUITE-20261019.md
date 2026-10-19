# CamerLink Growth Suite — intégration initiale (19 octobre 2026)

## Changements sur cette branche
- Ajout d'un accès flottant à la demande de devis.
- Formulaire de devis connecté au client Supabase existant, avec validation, messages d'erreur et confirmation.
- Espace « Mes devis » pour consulter le statut des demandes.
- Espace « Devis reçus » pour les demandes directement adressées à l'artisan connecté et formulaire de réponse (prix + message).
- Partage de CamerLink via la feuille de partage du téléphone, avec copie du lien en secours.
- Actions de partage sur les cartes d'annonces reconnues par leurs attributs data.
- Favoris persistants localement sur l'appareil pour les cartes d'annonces reconnues.
- Styles mobiles, focus clavier, réduction des animations et ajout des ressources au shell du service worker.
- Migration SQL proposée avec RLS pour la table quote_requests.

## Conditions nécessaires avant activation complète
1. La migration `supabase/migrations/202610190001_quote_requests.sql` n'est pas appliquée automatiquement à Supabase. La tester d'abord dans un environnement de développement.
2. La politique de devis ne donne accès qu'aux demandes du client ou au professionnel expressément ciblé. Les demandes sans artisan_id restent visibles au seul demandeur ; il faut concevoir une file de mise en relation séparée avant de les exposer à des artisans.
3. Les favoris sont pour le moment stockés sur l'appareil, pas synchronisés entre appareils/comptes.
4. La monétisation (paiement Mobile Money, boosts payants, abonnements) n'est pas activée : elle nécessite un prestataire compatible, secrets côté serveur, confirmation de paiement vérifiée côté serveur et tests de remboursement/échec.
5. Le badge « vérifié » ne doit être affiché qu'après un contrôle réel par un opérateur.
6. La modération, les limites anti-spam et l'audit de sécurité Supabase restent à valider avant le lancement public.

## Vérifications avant fusion
- Vérifier le build Vercel de prévisualisation et les ressources chargées.
- Tester la création de devis avec deux comptes distincts.
- Vérifier que le client A ne peut pas lire les devis du client B et que l'artisan A ne peut pas lire/répondre aux devis de l'artisan B.
- Tester navigation mobile, partage, favoris, états vides et erreurs réseau.
- Ne pas fusionner dans main tant que le test de prévisualisation et la revue RLS ne sont pas concluants.
