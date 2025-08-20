# Todo list

* [tout repenser](#version-2)
* Faire un script (langage ?) pour transformer les données réelles actuelles en données dans la base de données.
  - pour les entrées, passer par un format intermédiaire en YAML
  - pour les films (oeuvres) et les exemples, transformer les données YAML réelle (migrer). Par exemple, utiliser le `id` du film/oeuvre que pour le moment la donnée ne consigne pas (l'id est seulement défini dans le fichier des exemples) 
  - en d'autres termes, produire, à partir des données actuelles, des fichiers YAML conformes ou peut-être des données XML avec un DTD (c'est le bon nom ?) strict qui ne permettent pas les erreurs.
  - ensuite produire l'interface qui prendra ces données YAML et les injectera dans une bdd vierge
* Faire un script (TypeScript) qui transforme les données persistantes en fichier YAML et XML valides. Je veux toujours avoir les données en format YAML pour modification possibles à la main (peut-être faut-il imaginer un script qui, à chaque ouverture de l'extension, va vérifier la concordance des données et signale les écarts — c'est très important)
* Faire un script (outil de l'extension) qui lance la fabrication du livre (Prawn-for-book en ruby).
* Pouvoir afficher tous les exemples associés à une entrée (la méthode `getByEntry` est déjà implémentée)

## Développement

* Faire une class `ItemsState` qui gère l'état des items de chaque panneau, aussi bien au niveau de l'affichage (affiché/masqué) qu'au niveau de la sélection.

## Fonctionnalités

* Quand on clique sur un élément, on désélectionne le courant et on le sélectionne. Faire faire à Claude un objet Selection qui va conserver les sélections de chaque panneau (qui peuvent être multiples).
* Quand on filtre les listes et qu'il ne reste plus qu'un seul élément, quand on fait Enter, on le sélectionne (ou alors est-il sélectionné par défaut ?). Ou on sort du champ car le premier élément est automatiquement sélectionné.
* Ajout d'une nouvelle définition (possibilité de taper son nom dans le champ de recherche, avec 0 found, l'application demande s'il faut créer la nouvelle définition)
* Ajout d'un nouveau film. Champ de formulaire complexe avec possibilité de rechercher sur le net les données du film, par TMDB. Donc :
  - on tape "n" pour ajouter un nouveau film
  - on entre le titre du film dans un des champs titre, de préférence le titre original
  - un bouton permet de lancer la recherche des informations sur TDMB (on attend)
  - le retour d'information est traité, on en tire l'année, les auteurs (réalisateur, scénaristes, auteurs du texte original, etc.)
  - l'extension propose un id, à partir du titre et de l'année, modifiable (dès que l'id est modifié, on vérifie son unicité dans la table en cache)
  - on peut ajuster toute les données à la main, notamment préciser le sexe des intervenants
  - on valide et après check des informations, on persiste
* Ajout d'un nouvel exemple (à partir de pleins d'endroits : depuis une définition, on peut taper `ne` et ça ouvre un formulaire pour choisir le titre du film — ou alors ça bascule dans le champ de recherche du panneau Exemple ?, depuis un film, évidemment, toujours avec `ne` ou depuis le panneau exemple, de façon générale et pour chaque titre d'oeuvre)  
  - formulaire (auto complétion) pour choisir l'entrée concernée (on vérifie qu'il n'y pas déjà un exemple pour cette entrée)


## Plus tard

* Imaginer un script qui produise une simulation du livre dans un nouveau panneau (ou dans un navigateur) avec toutes les données formatées, les index, etc. (c'est quand même du boulot).



---



<a name="version-2"></name>

## Tout repenser (version 2)

Comme je viens d’apprendre que les panneaux ne pouvaient pas communiquer, je dois repenser intégralement la gestion des données pour que chaque panneau puisse y avoir accès.

### Idées directrices

* Toutes les données sont conservées (mises en cache et préparées) côté extension. Les panneaux font appel à l’extension lorsqu’ils ont besoin d’informations
* Pour la construction/gestion des panneaux, l’extension envoie toujours au panneau son propre cache de données (pour, par exemple, pouvoir gérer le filtrage des données sans appel à l’extension.)
* 
