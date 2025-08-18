# Synopsis de programmation

## Démarrage

* La commande appelle la fonction `PanelManager.openPanels`

  Elle crée les trois panneaux avec les éléments minimum, mais aucune données.

  À la fin de cette fonction, `panelManager.loadPanelData` est appelé avec chaque classe d'élément (`Entry`, `Oeuvre` et `Exemple`) pour peupler les panneaux.

* … appel de `panelManager.loadPanelData(context, panneau, classe)`

  La méthode charge les données depuis la base de données avec `<classe>Db.getAll()`.

  Puis elle envoie un message `load` à la webview (TODO: note : la méthode devrait plutôt s'appeller `populate` puisque les données, à ce stade, sont déjà chargées)

  TODO À ce niveau, il y a déjà un problème d'asynchronicité car les données ne sont pas chargées au même rythme et donc, dans certains cas, les données en cache ne sont pas prêtes.
  
  SOLUTION : 

  SOLUTION 1 : mettre les données d'abord en cache (de façon synchrone) puis appeler les trois chargements de panneau
  SOLUTION 2 : utiliser les données réelles plutôt que les données en cache. Mettre une condition dans la méthode get pour utiliser les données réelles en cas de donnée en cache absente. C'EST CETTE SOLUTION QUI A ÉTÉ POUR LE MOMENT ADOPTÉE.