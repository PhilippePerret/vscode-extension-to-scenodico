// Point d'entrée principal pour le panneau oeuvres
import { allowedNodeEnvironmentFlags } from 'process';
import '../common';
import { Oeuvre } from './Oeuvre';

// Exposer les classes globalement pour compatibilité avec le système existant
(window as any).Oeuvre = Oeuvre;

// Code de recherche/filtrage pour les oeuvres
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('#search-input') as HTMLInputElement;
  
  // Pour conserver l'état des items dans l'affichage
  // TODO Implémenter une class ItemsState (commune aux trois éléments)
  // conservera l'état de l'affichage ainsi que la sélection.
  const DomItemsState: Record<string, string> = {};

  // Par défaut, on indique que l'état des oeuvres est "visible"
  Oeuvre.getAll().forEach(item => DomItemsState[item.id] = 'block' ) ;

  if (searchInput) {
    // Fonction de filtrage
    function filterOeuvres() {
      const searchTerm = searchInput.value.trim();
      const allOeuvres = Oeuvre.getAll() ; 
      const allCount: number = allOeuvres.length ;
      console.log(`[OEUVRE-SEARCH] Filtering with term: "${searchTerm}", total oeuvres: ${allCount}`);
      
      // Utiliser la méthode de recherche optimisée du cache
      if (Oeuvre.isCacheBuilt) {
        console.log('[OEUVRE-SEARCH] Using cache-based search');
        const matchingOeuvres = Oeuvre.searchMatchingTerm(searchTerm);
        const matchingCount = matchingOeuvres.length ;
        console.log(`[OEUVRE-SEARCH] Cache search found ${matchingCount} matches / ${allCount}`);
        const matchingIds = new Set(matchingOeuvres.map(oeuvre => oeuvre.id));
        
        allOeuvres.forEach(oeuvre => {
          // Le principe est celui-ci : si l'oeuvre change d'état
          // (visible<->invisible) on touche le DOM, sinon on passe
          // à la suivante. C'est une table en cache (visibleItems)
          // qui conserve l'état (c'est un Record)
          const display: string = matchingIds.has(oeuvre.id) ? 'block' : 'none' ;
          // console.log("[OEUVRE SEARCH] Etat pour %s : actuel: %s nouveau: %s", oeuvre.id, DomItemsState[oeuvre.id], display);
          if ( DomItemsState[oeuvre.id] !== display ) {
            const domObj = document.querySelector(`main#items > div.item[data-id="${oeuvre.id}"]`) as HTMLDivElement;
            if ( domObj ) {
              domObj.style.display = display ;
              DomItemsState[oeuvre.id] = display ;
            }
          }
        }) ;
        // TODO
        // Déselectionner l'élément courant et sélectionner le premier élément de la liste
       console.log(`[OEUVRE-SEARCH] Result: ${matchingCount} shown, ${allCount - matchingCount} hidden`);
      } else {
        console.error('[OEUVRE-SEARCH] Cache not built - Can\'t filter');
      }
    }
    
    // Écouter les événements de saisie
    searchInput.addEventListener('input', filterOeuvres);
    searchInput.addEventListener('keyup', filterOeuvres);
    
    console.log('[OEUVRES] Search functionality initialized');
  }
});

console.log('[OEUVRES] Panel initialized with TypeScript modules');
