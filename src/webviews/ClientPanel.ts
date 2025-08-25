import { Entry } from "./models/Entry";
import { Exemple } from "./models/Exemple";
import { Oeuvre } from "./models/Oeuvre";

type AnyElementClass = Entry | Oeuvre | Exemple;

export abstract class ClientPanel {
  static readonly minName: string;
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
  static populate(items: AnyElementClass[]): void {
    (this.container as HTMLDivElement).innerHTML = '';
    items.forEach((item: AnyElementClass, index: number) => {
      const data = item.data;
      const clone = this.cloneItemTemplate() as DocumentFragment;
      const mainElement = clone.querySelector('.' + this.minName);
      if (mainElement) {
        mainElement.setAttribute('data-id', data.id);
        mainElement.setAttribute('data-index', index.toString());
      }
      // Régler les props
      Object.keys(data).forEach(prop => {
        let value = ((data as unknown) as Record<string, string>)[prop] as string;
        value = String(value);
        clone
          .querySelectorAll(`[data-prop="${prop}"]`)
          .forEach(element => {
            if (value.startsWith('<')) {
              element.innerHTML = value;
            } else {
              element.textContent = value;
            }
          });
      });
      // Et on l'ajoute au conteneur
      this.container && this.container.appendChild(clone);
    });

    // TODO Ici, plus tard, on pourra appeler afterDisplayItems
    this.afterDisplayItems();

    // Pour observer le panneau (les boutons, le champ de filtre, etc.)
    this.observePanel();
  }

  // Méthode appelée après l'affichage des éléments et avant
  // l'observation du panneau
  static afterDisplayItems():void {}

  // Attention, certains panneaux ont leur propre méthode, qui peut 
  // aussi appeler celle-ci
  static observePanel(): void {
   // Écouter le champ de filtre en haut des panneaux
    const Input = this.searchInput as HTMLInputElement;
    Input.addEventListener('input', this.filterItems.bind(this));
    Input.addEventListener('keyup', this.filterItems.bind(this));
  }

  static filterItems(ev: any) {
    const Input = this.searchInput as HTMLInputElement;
    const searched = Input.value.trim();
    const allCount = this.allItems.length;
    const matchingItems: any[] = this.searchMatchingItems(searched);
    const matchingCount = matchingItems.length;
    console.log('[CLIENT %s] Filtering with "%s" - %i founds / %i', this.titName, searched, matchingCount, allCount);
    const matchingIds = new Set(matchingItems.map(item => item.data.id));
    this.allItems.forEach(item => {
      const display = matchingIds.has(item.data.id) ? 'block' : 'none';
      if (item.data.display !== display) {
        // <= L'item a changé d'état
        // => Il faut le modifier dans le DOM
        const obj = document.querySelector(`main#items > div.item[data-id="${item.data.id}"]`) as HTMLDivElement;
        obj.style.display = display;
        item.data.display = display;
        item.data.selected = false; // TODO en faire plus
      };
    });
    // TODO Traiter la sélection (toujours la mettre au premier élément visible)
  };
  // Méthode de filtrage qui reçoit les évènements Input


  // Fonction de recherche qui doit être surclassée par toutes les
  // classes héritière
  static searchMatchingItems(search: string): any[] {
    return [];
  }
  static filter(filtre: (item: AnyElementClass) => boolean): AnyElementClass[] {
    const result: AnyElementClass[] = [];
    this.allItems.forEach(item => { filtre(item.data) && result.push(item); });
    return result;
  }

}

