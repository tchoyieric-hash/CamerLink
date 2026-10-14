# 🌍 CamerLink

**CamerLink** est une Progressive Web App (PWA) de marketplace locale et multi-services conçue spécifiquement pour le marché camerounais. Elle permet aux particuliers et aux professionnels de publier et de découvrir facilement des annonces (véhicules, immobilier, high-tech, services, mode, etc.) à travers les principales villes du pays.

## 🚀 Fonctionnalités Clés
- **Mobile-First & PWA** : Conçue et optimisée pour une utilisation fluide sur smartphone, avec possibilité d'installation directe sur l'écran d'accueil.
- **Multisélection & Géolocalisation** : Filtres dynamiques par ville (Yaoundé, Douala, Bafoussam, etc.) et par catégorie.
- **Gestion Multimédia** : Ajout, lecture et suppression de vidéos courtes (via Supabase Storage) et d'images pour chaque annonce.
- **Tunnel de Vente Direct** : Intégration d'un bouton de contact direct sur WhatsApp avec message pré-rempli pour fluidifier les transactions locales.
- **Sécurité et Authentification** : Gestion sécurisée des comptes utilisateurs et des rôles.

## 🛠️ Stack Technique
- **Frontend** : HTML5, CSS3, JavaScript (Vanilla ES6+), hébergé et déployé en continu sur **Vercel**.
- **Backend & Base de Données** : **Supabase** (PostgreSQL, Authentification, Row Level Security et Storage).
- **Architecture** : Application légère, rapide, taillée pour les conditions de connexion locales.

## 🔗 Liens du Projet
- **Application en ligne** : [https://camer-link-tchoyi-eric.vercel.app](https://camer-link-tchoyi-eric.vercel.app)
- **Développeur** : Tchoyi Eric

## 📁 Structure du code
- `index.html` : page principale ; scripts chargés dans l'ordre `config.js` → `utils.js` → `script.js` → `statuts.js` → `shell.js`.
- `config.js` / `utils.js` : constantes et fonctions pures partagées ; `messagerie.js` : messagerie (dépendances injectées) ; `register-sw.js` + `sw.js` : mode hors-ligne.
- `script.js` : logique applicative ; `statuts.js` : statuts 24 h ; `shell.js` : onglets et pages entreprises.
- `api/share.js` : pages partageables et sitemap (Vercel Function).
- Détails et suite recommandée : `CHANGELOG-REFACTOR-20261015.md`.

## ✅ Tests
`npm test` (Node 18+) lance les contrôles de non-régression de `tests/`. À exécuter avant chaque déploiement.
