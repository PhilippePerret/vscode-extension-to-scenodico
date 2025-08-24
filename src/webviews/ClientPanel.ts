import { Entry } from "./entries/Entry";
import { Exemple } from "./exemples/Exemple";
import { Oeuvre } from "./oeuvres/Oeuvre";

// type Tel = typeof Entry | typeof Oeuvre | typeof Exemple;
// type Tel_i = Entry | Oeuvre | Exemple ;

export abstract class ClientPanel {
  static readonly titName: string;
  static _container: HTMLElement | null;
  static _itemTemplate: HTMLTemplateElement | null;
  static _searchInput: HTMLInputElement | null;
  protected static get allItems(): any[]{ return []; };

  static get container(): HTMLElement | null { return this._container || (this._container = document.querySelector('main#items')); }
  static get itemTemplate(): HTMLTemplateElement | null { return this._itemTemplate || (this._itemTemplate = document.querySelector('template#item-template')); }
  static get searchInput(): HTMLInputElement | null { return this._searchInput || (this._searchInput = document.querySelector('#search-input')); }

  static cloneItemTemplate(): DocumentFragment | null {
    return this.itemTemplate!.content.cloneNode(true) as DocumentFragment;
  }

  static observePanel(): void {
    const Input = this.searchInput as HTMLInputElement;
    // Fonction de filtrage dont on va se servir pour
    // le listener du champ input-search
    const filterItems = () => {
      const searched = Input.value.trim();
      const allCount = this.allItems.length; 
      const matchingItems: any[] = this.searchMatchingItems(searched);
      const matchingCount = matchingItems.length;
      console.log('[CLIENT %s] Filtering with "%s" - %i founds / %i', this.titName, searched, matchingCount, allCount);
      const matchingIds = new Set(matchingItems.map(item => item.id));
      this.allItems.forEach(item => {
        const display = matchingIds.has(item.id) ? 'block' : 'none';
        if ( item.display !== display) {
          // <= L'item a changé d'état
          // => Il faut le modifier dans le DOM
          const obj = document.querySelector(`main#items > div.item[data-id="${item.id}"]`) as HTMLDivElement;
          obj.style.display = display;
          item.display = display;
          item.selected = false; // TODO en faire plus
        };
      });
    // TODO Traiter la sélection (toujours la mettre au premier élément visible)
    };
    // Écouter le champ de filtre
    Input.addEventListener('input', filterItems);
    Input.addEventListener('keyup', filterItems);
  }
  
  // Fonction de recherche qui doit être surclassée par toutes les
  // classes héritière
  static searchMatchingItems(search: string): any[] {
    return [];
  }
}

