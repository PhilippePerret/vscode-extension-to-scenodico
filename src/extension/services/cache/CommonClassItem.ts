import { CacheManager, CacheableItem } from './CacheManager';
import { AnyCachedData, CachedExempleData } from './CacheTypes';

// export interface ItemData extends CacheableItem {
//   id: string;
//   [key: string]: any;
// }

export abstract class CommonClassItem {
//   private static _container: HTMLElement | null = null;
//   private static _template: HTMLTemplateElement | null = null;

//   // Propriétés qui doivent être définies par les classes filles
//   static readonly minName: string;
//   static readonly ERRORS: { [key: string]: string };

//   // Cache manager - chaque classe fille doit fournir sa propre instance
//   protected static get cacheManager(): CacheManager<any, any> {
//     throw new Error('cacheManager getter must be implemented by subclass');
//   }
 
//   static get container(): HTMLElement | null {
//     return this._container || (this._container = document.querySelector('main#items'));
//   }

//   static get template(): HTMLTemplateElement | null {
//     return this._template || (this._template = document.querySelector('template#item-template'));
//   }

//   static error(errorId: string): string {
//     // Cette propriété doit être définie par chaque classe fille
//     const errors = (this as any).ERRORS;
//     return errors?.[errorId] || `Unknown error: ${errorId}`;
//   }

//   /**
//    * Formate une propriété pour l'affichage
//    * DOIT être surchargée par chaque classe fille
//    */

//  // Doit être écrasé par chaque classe fille (il semble que je doive
//   // faire comme ça pour ne pas avoir d'erreur d'absence de méthode)
//   protected static searchMatchingItems(searched: string): AnyCachedData[]{
//     throw new Error(`La méthode searchMatchingItems doit être implémentée par la classe ${this.name}`);
//   }

//  /**
//    * Peuple le panneau de l'élément avec les données mises en cache
//    */
//   public static populatePanel(): typeof CommonClassItem {
//     const container = this.container as HTMLDivElement;
//     container.innerHTML = '';
//     const items = this.getAll();
//     if (items.length === 0) {
//       container.innerHTML = `<div class="no-${this.minName}">${this.error('no-items')}</div>`;
//       return this;
//     }
//     items.forEach((item, index) => {
//       // Clone the template
//       const clone = this.template!.content.cloneNode(true) as DocumentFragment;

//       // Set the id and index attributes on the main element
//       const mainElement = clone.querySelector('.' + this.minName);
//       if (mainElement) {
//         if (item.id) {
//           mainElement.setAttribute('data-id', item.id);
//         }
//         mainElement.setAttribute('data-index', index.toString());
//       }

//       // Populate all elements with data-prop attributes
//       Object.keys(item).forEach(prop => {
//         const elements = clone.querySelectorAll(`[data-prop="${prop}"]`);
//         elements.forEach(element => {
//           if ( item[prop].startsWith('<') ) {
//             element.innerHTML = item[prop];
//           } else {
//             element.textContent = item[prop];
//           }
//         });
//       });

//       // Append to container
//       container!.appendChild(clone);
//     });

//     // Call afterDisplayItems for specific panel types with correct context
//     this.afterDisplayItems();

//     return this; // pour le chainage
//   }


//   /**
//    * Méthode qui observe le panneau, à commencer par la captation des
//    * touches et le champ de recherche/filtrage
//    * TODO Mettre un picto filtrage devant le champ
//    * 
//    */
//   public static observePanel(): typeof CommonClassItem {
//     const searchInput = document.querySelector('#search-input') as HTMLInputElement;
//     // Pour conserver l'état de chaque définition
//     // TODO Voir si on ne peut pas tout simplement mettre la propriété
//     // displayed et selected dans la donnée en cache.
//     const DomItemsState: Record<string, string> = {};
//     // Par défaut, les définitions sont toujours affichées
//     this.forEach(item => DomItemsState[item.id] = 'block');

//     // Fonction de filtrage
//     const filterEntries = () => {
//       const searchTerm = searchInput.value.trim();
//       const allItems = this.getAll();
//       const allCount = allItems.length;
//       console.log(`[SEARCH ENTRY] Filtering with term: "${searchTerm}", total entries: ${allCount}`);
//       const matchingItems: AnyCachedData[] = this.searchMatchingItems(searchTerm);
//       const matchingCount = matchingItems.length;
//       console.log('[SEARCH ENTRY] Cache search found %i matches / %i', matchingCount, allCount);
//       // TODO On pourrait directement renvoyer ce Set par searchByPrefix
//       const matchingIds = new Set(matchingItems.map(item => item.id));

//       allItems.forEach(item => {
//         const display: string = matchingIds.has(item.id) ? 'block' : 'none';
//         // [SEARCH item] Etat pour %s : actual: %s, nouveau %s", item.id, DomItemsState[item.id]);
//         if (DomItemsState[item.id] !== display) {
//           // Seulement quand l'état de l'élément a changé
//           const domObj = document.querySelector(`main#items > div.item[data-id="${item.id}"]`) as HTMLDivElement;
//           domObj.style.display = display;
//           DomItemsState[item.id] = display;
//         }
//       });
//       // TODO
//       // Déselectionner l'élément courant (si ce n'est pas le même) et sélectionner le premier élément
//       // affiché.
//       console.log(`[SEARCH ${this.minName}] Result:  %i shown, %i hidden`, matchingCount, allCount - matchingCount);
//     };

//     // Écouter les événements de saisie
//     searchInput.addEventListener('input', filterEntries);
//     searchInput.addEventListener('keyup', filterEntries);

//     return this; // pour le chainage
//   }
//   /**
//    * Récupère un élément par son ID
//    * @param id - ID de l'élément à récupérer
//    */
//   static get(id: string): AnyCachedData | null {
//     console.log("-> Oeuvre.get(%s)", id, this.cacheManager);
//     return this.cacheManager.get(id);
//   }

//   /**
//    * Récupère tous les éléments du cache
//    */
//   static getAll(): AnyCachedData[] {
//     return this.cacheManager.getAll();
//   }

//   /**
//    * Itère sur tous les éléments du cache
//    * @param callback - Fonction appelée pour chaque élément
//    */
//   static forEach(callback: (item: AnyCachedData, id: string) => void): void {
//     this.cacheManager.forEach(callback);
//   }

//   /**
//    * Filtre les éléments du cache
//    * @param predicate - Fonction de filtrage
//    */
//   static filter(predicate: (item: AnyCachedData, id: string) => boolean): AnyCachedData[] {
//     return this.cacheManager.filter(predicate);
//   }

//   /**
//    * Efface le cache
//    */
//   static clearCache(): void {
//     this.cacheManager.clear();
//   }

//   /**
//    * Vérifie si le cache est construit
//    */
//   static get isCacheBuilt(): boolean {
//     return this.cacheManager.isBuilt;
//   }

//   /**
//    * Retourne la taille du cache
//    */
//   static get cacheSize(): number {
//     return this.cacheManager.size;
//   }

//   /**
//    * Récupère le cache (pour compatibilité avec les tests existants)
//    * @deprecated Utiliser les nouvelles méthodes get(), getAll(), etc.
//    */
//   static get searchCache(): AnyCachedData[] | null {
//     const manager = this.cacheManager;
//     return manager.isBuilt ? manager.getAll() : null;
//   }

//   /**
//    * Post-traitement après affichage des éléments
//    * Doit être surclassé par les méthodes propres aux différents panneaux
//    */
//   static afterDisplayItems(): boolean {
//     return true;
//   }
}
