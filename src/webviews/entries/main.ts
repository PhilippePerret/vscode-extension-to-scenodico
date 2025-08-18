// Point d'entrée principal pour le panneau entries
import '../common';
import { Entry } from './Entry';

// Exposer les classes globalement pour compatibilité avec le système existant
(window as any).Entry = Entry;

// Code de recherche/filtrage pour les entrées
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('#search-input') as HTMLInputElement;
  // Pour conserver l'état de chaque définition
  const DomItemsState: Record<string, string> = {};
  // Par défaut, les définitions sont toujours affichées
  Entry.getAll().forEach(item => DomItemsState[item.id] = 'block');
  
  // Fonction de filtrage
  function filterEntries() {
    const searchTerm = searchInput.value.trim();
    const allItems = Entry.getAll();
    const allCount: number = allItems.length;
    console.log(`[SEARCH ENTRY] Filtering with term: "${searchTerm}", total entries: ${allCount}`);

    // Utiliser la méthode de recherche optimisée du cache
    // + la persistance de l'état des définitions
    if (Entry.isCacheBuilt) {
      console.log('[SEARCH ENTRY] Using cache-based search');
      const matchingItems = Entry.searchMatchingTerm(searchTerm);
      const matchingCount = matchingItems.length;
      console.log('[SEARCH ENTRY] Cache search found %i matches / %i', matchingCount, allCount);
      // TODO On pourrait directement renvoyer ce Set par searchByPrefix
      const matchingIds = new Set(matchingItems.map(entry => entry.id));

      allItems.forEach(entry => {
        const display: string = matchingIds.has(entry.id) ? 'block' : 'none'; 
        // [SEARCH ENTRY] Etat pour %s : actual: %s, nouveau %s", entry.id, DomItemsState[entry.id]);
        if (DomItemsState[entry.id] !== display) {
          // Seulement quand l'état de l'élément a changé
          const domObj = document.querySelector(`main#items > div.item[data-id="${entry.id}"]`) as HTMLDivElement;
          domObj.style.display = display;
          DomItemsState[entry.id] = display;
        }
      });
      // TODO
      // Déselectionner l'élément courant (si ce n'est pas le même) et sélectionner le premier élément
      // affiché.
      console.log(`[SEARCH ENTRY] Result:  %i shown, %i hidden`, matchingCount, allCount - matchingCount);
    } else {
      console.error('[SEARCH ENTRY] Cache not built - Problème à résoudre. ');
    }
  }

  // Écouter les événements de saisie
  searchInput.addEventListener('input', filterEntries);
  searchInput.addEventListener('keyup', filterEntries);

  console.log('[ENTRIES] Search functionality initialized');
});

console.log('[ENTRIES] Panel initialized with TypeScript modules');
