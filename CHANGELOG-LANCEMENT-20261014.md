# CamerLink — préparation au lancement (14 octobre 2026)

## Corrections proposées dans cette branche
- Unification des URL de référence et de sitemap vers le domaine de production `https://camerlink.vercel.app/`.
- Ajout des fichiers d'icône existants au `<head>` et déclaration du manifeste PWA.
- Intégration du logo CamerLink dans l'en-tête et le pied de page.
- Styles responsives pour le logo sur mobile.

## À valider avant fusion
- Parcours compte test : inscription/connexion et déconnexion.
- Publication d'une annonce avec image, affichage public et contact WhatsApp.
- Publication/lecture de vidéo Reels et d'un statut 24 h.
- Messagerie, favoris, récupération d'annonce et accès admin.
- Permissions RLS et Storage Supabase, ainsi que politique d'accès aux actions d'administration.
- Tester le site sur Android avec connexion mobile et effacer/actualiser le cache PWA.

Le commit ne certifie pas les autorisations ou l'état réel du projet Supabase. Un déploiement marqué READY confirme le déploiement, pas la validation de tous les parcours utilisateur.
