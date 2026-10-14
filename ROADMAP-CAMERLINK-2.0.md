# CamerLink 2.0 — feuille de route premium, IA et proximité
Statut : recommandations et fondations. Les fonctionnalités ci-dessous ne sont pas toutes implémentées par cette archive.

## 1. Expérience premium
- Hiérarchie visuelle claire : recherche en premier, catégories lisibles, annonces avec prix et localisation visibles.
- États de chargement, listes vides, erreurs réseau et confirmations cohérents.
- Boutons adaptés au tactile, navigation mobile accessible, contrastes et réduction des animations selon `prefers-reduced-motion`.
- Images responsives, formats modernes et chargement différé.
- Mesurer les Core Web Vitals avant d'ajouter des animations lourdes.

## 2. Sécurité et confiance
- Vérification des professionnels en plusieurs niveaux : téléphone confirmé, identité contrôlée par un opérateur, entreprise vérifiée.
- Expliquer précisément ce que signifie chaque badge ; ne jamais afficher « vérifié » avant le contrôle réel.
- Limitation de débit côté serveur, validation de données et protections anti-spam.
- Journal d'audit des actions administratives sans y stocker de secrets.
- Modération et signalement d'annonces, avec procédure d'appel.

## 3. Recherche assistée par IA
Étape initiale peu coûteuse : interprétation locale des termes de recherche (ville, catégorie, budget) et classement de résultats existants.
Étape ultérieure : embeddings/recherche sémantique ou API d'IA côté serveur, avec limites de coût, journalisation minimale et contrôle des données envoyées au fournisseur.
Exemple : « Je cherche un mécanicien à Bonamoussadi pour une Toyota, moins de 20 000 FCFA ».
Ne jamais inventer la disponibilité, le prix ou la vérification d'un vendeur. Les suggestions doivent renvoyer aux annonces réelles.

## 4. Proximité et vie privée
- Recherche par ville/quartier utilisable sans activer la géolocalisation.
- Demander la permission de localisation uniquement après une action explicite.
- Ne pas enregistrer de coordonnées exactes si une ville ou un quartier suffit.
- Trier par distance uniquement si les données de position sont fiables et si l'utilisateur a consenti.
- Prévoir une option « utiliser ma ville » et une option de suppression des données.

## 5. Paiements et modèle économique
- Intégrer un prestataire Mobile Money compatible avec le Cameroun après vérification contractuelle et juridique.
- Commencer par des paiements de services ou de mise en avant clairement décrits.
- Ne pas proposer de séquestre ni conserver les fonds des clients sans partenaire autorisé et cadre adapté.
- Offres possibles : annonces mises en avant, abonnement Business, statistiques, badge professionnel après vérification.

## Ordre recommandé
1. Sécurité/RLS et stabilisation.
2. UX mobile, performance et tests.
3. Recherche locale améliorée sans IA externe.
4. Vérification professionnelle et modération.
5. IA côté serveur après mesure de la demande et du coût.
6. Paiement uniquement quand le flux commercial et les responsabilités sont définis.
