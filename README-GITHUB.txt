CamerLink — fichiers du logo prêts à ajouter dans GitHub

CONTENU
- public/: fichiers PNG du logo, icônes et favicons
- integration-head.html: balises pour les favicons et la couleur du navigateur

INSTALLATION
1. Ouvre le dépôt GitHub de CamerLink.
2. Ouvre le dossier public existant. S’il n’existe pas, crée-le seulement si la structure de ton projet le permet.
3. Téléverse les fichiers PNG contenus dans le dossier public/ de cette archive dans le dossier public/ du dépôt. Ne téléverse pas le dossier public comme public/public.
4. Enregistre/valide les changements (Commit changes).
5. Les images seront accessibles par des chemins tels que /camerlink-logo.png.

IMPORTANT
Ces fichiers ajoutent les images seulement. Pour afficher le logo dans la barre de navigation, la connexion et l’inscription, le code de ces pages doit aussi être modifié pour utiliser /camerlink-logo.png. Les balises de integration-head.html doivent être ajoutées au head ou aux métadonnées du framework. Ce paquet ne modifie ni ne déploie automatiquement le site en production.
