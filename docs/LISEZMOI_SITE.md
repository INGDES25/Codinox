# Site Codinox & CNX (GitHub Pages)

Site statique : aucune installation, aucun serveur. Trois pages (`index.html`, `telechargements.html`, `tutoriels.html`), un style (`style.css`),
un script (`site.js`) et **un seul fichier de données** : `data/releases.js` (versions, liens, vidéos). On peut aussi ouvrir `index.html`
directement dans un navigateur pour le prévisualiser.

## 1. Mise en ligne (une seule fois)

1. Sur GitHub, crée un dépôt **public** réservé au site et aux téléchargements, par exemple `codinox`.
   **N'y mets pas le code source** de Codinox/CNX : un dépôt public est lisible par tout le monde et ta licence est « tous droits réservés ».
   (Un dépôt privé ne peut pas servir de site gratuit, et ses fichiers ne seraient pas téléchargeables par le public.)
2. Envoie-y le contenu de ce dossier (le fichier `index.html` doit être à la racine du dépôt) : bouton « Add file » > « Upload files ».
3. « Settings » > « Pages » > « Build and deployment » : Source = « Deploy from a branch », branche `main`, dossier `/ (root)`, « Save ».
   Après une ou deux minutes, le site est à `https://TON-COMPTE.github.io/codinox/`.
4. Donne l'adresse du dépôt à la page : `python ajouter_version.py depot https://github.com/TON-COMPTE/codinox`
   (puis renvoie `data/releases.js` sur GitHub).

## 2. Publier une version (à chaque mise à jour)

1. Sur GitHub : « Releases » > « Draft a new release », tag `v1.1` (par exemple), titre, puis glisse les installateurs
   (Codinox-Setup, archive Linux…) dans la zone de dépôt de fichiers (2 Go maximum par fichier) et « Publish release ».
2. Clic droit sur chaque fichier > « Copier l'adresse du lien ».
3. Sur ton ordinateur :

        python ajouter_version.py version codinox 1.1 --note "Terminal intégré" --note "Corrections" ^
            --windows https://github.com/TON-COMPTE/codinox/releases/download/v1.1/Codinox-Setup-1.1.exe --taille-windows "85 Mo" ^
            --linux https://github.com/TON-COMPTE/codinox/releases/download/v1.1/Codinox-linux-x64.tar.gz

   (sous Linux, remplace `^` par `\`). Même commande avec `cnx` pour CNX. La date du jour est utilisée si tu ne la donnes pas (`--date 2027-01-15`).
4. Renvoie le fichier `data/releases.js` modifié sur GitHub. La nouvelle version devient « Dernière version » et l'ancienne passe dans l'historique.
   Rien d'autre à changer : les boutons de la page d'accueil se mettent à jour tout seuls.

`python ajouter_version.py liste` affiche ce qui est publié. Tu peux aussi modifier `data/releases.js` à la main (c'est du texte lisible).

## 3. Ajouter une vidéo

Dépose la vidéo dans une release (par exemple celle nommée `videos`) et/ou publie-la sur YouTube, puis :

    python ajouter_version.py video --titre "Premiers pas" --produit codinox --duree "6 min" ^
        --url https://github.com/TON-COMPTE/codinox/releases/download/videos/premiers-pas.mp4 --voir https://youtu.be/XXXX

`--url` donne le bouton « Télécharger », `--voir` le bouton « Voir en ligne » ; l'un des deux suffit.

**Avec YouTube** (cas courant) : une fois la vidéo publiée sur la chaîne, copie son adresse (bouton « Partager » → copier le lien, du type `https://youtu.be/XXXXXXXXXXX`) et lance :

    python ajouter_version.py video --titre "Premiers pas avec Codinox" --produit codinox --duree "6 min" --voir https://youtu.be/XXXXXXXXXXX

La page Tutoriels affiche alors un lecteur intégré (la vidéo ne se charge qu'au clic sur « Lire la vidéo ici », sans suivi avant) et un bouton « Ouvrir sur YouTube ». `--produit` vaut `codinox`, `cnx` ou `general`. Renvoie ensuite `data/releases.js` sur GitHub : la page se met à jour. La chaîne est déjà liée dans le menu, le pied de page et la page Tutoriels ; pour la changer : `python ajouter_version.py chaine https://www.youtube.com/...`.

## 4. Ce qui est déjà prévu dans la page

* Les versions sans lien s'affichent « Bientôt disponible » (c'est l'état actuel : aucun lien n'est encore renseigné).
* Le fichier correspondant au système du visiteur (Windows ou Linux) passe en premier et porte la mention « Recommandé ».
* Les versions sont triées par numéro (1.10 est plus récente que 1.9). Thème clair ou sombre, au choix du visiteur.
* Les entrées de `releases.js` d'origine (version 1.0 sans date ni lien) sont des **emplacements** : renseigne-les avec `ajouter_version.py` ou à la main.

## Limites

* Testé dans Chromium (Linux) : mise en page ordinateur et téléphone, tri des versions, historique, vidéos, thèmes, liens `javascript:` refusés.
  Les vrais téléchargements ne peuvent être vérifiés qu'une fois les fichiers publiés sur GitHub.
* Le site n'a pas de statistiques de téléchargement ni de formulaire de contact.
* Les textes de présentation sont à relire : ils reprennent les fonctions réelles de Codinox, mais c'est à toi de valider le ton.
