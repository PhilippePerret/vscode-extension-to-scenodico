// Point d'entrée principal pour le panneau exemples
import '../common';
import { Exemple } from './Exemple';

// Exposer les classes globalement pour compatibilité avec le système existant
(window as any).Exemple = Exemple;

// Code de recherche/filtrage pour les exemples
document.addEventListener('DOMContentLoaded', () => {

  // Le champ de recherche (qu'on va préparer ci-dessous)
  const searchInput = document.querySelector('#search-input') as HTMLInputElement;

  // Pour conserver l'état de chaque exemple
  // TODO Remplacer par une instance de classe ItemsState
  const DomItemsState: Record<string, string> = {};
  // Au début, les exemples sont toujours affichés
  Exemple.getAll().forEach(item => DomItemsState[item.id] = 'block'); // TODO Cette fonction commune appartiendra à l'instance
  
  // Fonction de filtrage
  /**
   * TODO
   * On doit pouvoir en faire une méthode générique pour les trois
   * types d'élément.
   * Au lieu de…      utiliser…
   *   allExemples     allItems
   *   Exemple.isCacheBuilt  this.isCacheBuilt
   *   matchingEntries matchingItems
   *   
   */
  function filterExemples() {
    const searchTerm = searchInput.value.trim();
    const allExemples = Exemple.getAll();
    const allCount = allExemples.length;
    console.log(`[EXEMPLE-SEARCH] Filtering with term: "${searchTerm}", total exemples: ${allCount}`);
      
    // Utiliser la méthode de recherche optimisée du cache
    console.log('[EXEMPLE-SEARCH] Using cache-based search');
    const matchingExemples = Exemple.searchMatchingTerm(searchTerm); // TODO Renommer la méthode (utiliser le même nom pour les trois types d'éléments)
    const matchingCount = matchingExemples.length;
    console.log('[EXEMPLE SEARCH] Cache search found %i matches / %i', matchingCount, allCount);
    const matchingIds = new Set(matchingExemples.map(exemple => exemple.id));

    allExemples.forEach(exemple => {
      const display = matchingIds.has(exemple.id) ? 'block' : 'none' ;
      // [EXEMPLE SEARCH] Etat pour %s : actual: %s, nouveau %s", entry.id, DomItemsState[entry.id]);
      if ( DomItemsState[exemple.id] !== display ) {
        // <= L'état de l'élément a changé
        // => On modifie son affichage
        const domObj = document.querySelector(`main#views > div.item[data-id="${exemple.id}"]`) as HTMLDivElement ;
        domObj.style.display = display ;
        DomItemsState[exemple.id] = display ;
      }
      //TODO
      //Déselectionner l'élément courant (si différent) et sélectionner le premier affiché
      console.log('[EXEMPLE-SEARCH] Result: %i shown, %i hidden', matchingCount, allCount - matchingCount);
    });
    
    // Écouter les événements de saisie
    searchInput.addEventListener('input', filterExemples);
    searchInput.addEventListener('keyup', filterExemples);
    
    console.log('[EXEMPLES] Search functionality initialized');
  }
});

console.log('[EXEMPLES] Panel initialized with TypeScript modules');
