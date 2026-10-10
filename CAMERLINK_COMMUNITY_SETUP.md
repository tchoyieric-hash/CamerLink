# CamerLink Community — activation

Cette évolution ajoute l'interface des avis, l'engagement des Reels, les notifications, des statistiques professionnelles et les demandes de formule Pro. Elle est sur la branche `feature/reel-likes`; elle ne modifie pas `main`.

## Étape obligatoire : installer les tables Supabase

1. Ouvrir le projet Supabase de CamerLink.
2. Aller dans **SQL Editor** puis **New query**.
3. Copier le contenu complet de [supabase/migrations/20261011_camerlink_community.sql](supabase/migrations/20261011_camerlink_community.sql), puis exécuter la requête une seule fois.
4. Actualiser l'aperçu Vercel de la branche et se connecter avec un compte de test.

La migration active Row Level Security (RLS), limite les avis/commentaires à un envoi par utilisateur (avis) et garde les avis/commentaires en attente jusqu'à validation. Les notifications de nouveaux messages sont créées par un trigger SQL. Ne jamais ajouter la clé Supabase `service_role` au navigateur.

## Fonctions ajoutées

- **Avis clients** : note sur 5 et commentaire sur le profil artisan; les avis ne s'affichent publiquement qu'après validation.
- **Reels** : likes persistants et commentaires soumis à validation.
- **Notifications** : bouton d'alertes, compteur et liste; notification automatique à la réception d'un message.
- **Espace artisan** : statistiques calculées à partir des annonces, messages, avis approuvés et likes enregistrés.
- **Offres Pro** : demandes de renseignements et de vérification. Ce n'est pas un système de paiement; aucun paiement n'est prélevé.

## Validation des avis et commentaires

Après vérification réelle d'un avis, un administrateur autorisé peut l'approuver dans SQL Editor, par exemple :

```sql
update public.artisan_reviews
set status = 'approved'
where id = 123 and status = 'pending';
```

Pour approuver un commentaire après modération :

```sql
update public.reel_comments
set status = 'approved'
where id = 123 and status = 'pending';
```

Remplacer `123` par l'identifiant réel, après avoir vérifié le contenu. Ne pas approuver automatiquement des avis ou commentaires.

## Tests de recette

- Envoyer un avis depuis un compte différent de celui de l'artisan : il doit rester caché tant qu'il est en attente.
- Approuver cet avis puis actualiser le profil : il doit apparaître et contribuer à la moyenne.
- Aimer un Reel connecté, actualiser la page et vérifier que le cœur et le compteur sont conservés.
- Publier un commentaire : il reste caché jusqu'à approbation.
- Envoyer un message à un autre compte : vérifier le déclenchement d'une notification pour le destinataire.
- Ouvrir l'espace artisan : les compteurs doivent correspondre aux données existantes.
- Envoyer une demande Pro : elle est enregistrée, mais n'active ni abonnement payant ni badge vérifié automatiquement.

Si la migration SQL n'est pas installée, l'interface affiche une information de configuration et les fonctionnalités dépendantes de ces tables ne peuvent pas persister.
