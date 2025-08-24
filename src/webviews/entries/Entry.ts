/**
 * Module pour les Entrées
 * 
 * Chaque module Entrée, Oeuvres et Exemples est composé de trois
 * parties interactives :
 * 
 *  1) Le modèle, gérant les éléments en tant que tels, les Entry par exemple
 *  2) Le panneau, qui interagit avec le Dom (DOMEntry ou PanelEntry)
 *  3) La section Rpc (RpcEntry) qui permet de communiquer avec l'extension,
 *     pour enregistrer des informations ou obtenir des données des autres
 *     panneaux.
 */
import { UEntry } from '../../bothside/UEntry';
import { FullEntry } from '../../extension/models/Entry';
import { StringNormalizer } from '../../extension/services/cache/CacheTypes';
import { ClientItem } from '../ClientItem';
import { ClientPanel } from '../ClientPanel';
import { createRpcClient } from '../RpcClient';

type Tinstance = InstanceType<typeof UEntry>

export class Entry extends ClientItem<UEntry, FullEntry> {
  static readonly minName = 'entry';
  static readonly klass = Entry;
 
  // /**
  //  * Recherche d'entrées par préfixe (optimisée)
  //  * Méthode spécifique Entry
  //  */
  // protected static searchMatchingItems(prefix: string): CachedEntryData[] {
 // }
}
class PanelEntry extends ClientPanel {
  static readonly minName = 'entry';
  static readonly titName = 'Entry';
  static get allItems(){ return Entry.allItems; }
 static populate(items: Entry[]): void {
    items.forEach((item: Entry, index: number) => {
      console.log("Je dois écrire l'item", item.data);
      const data = item.data;
      const clone = this.cloneItemTemplate() as DocumentFragment;
      const mainElement = clone.querySelector('.' + this.minName);
      if ( mainElement ) {
        mainElement.setAttribute('data-id', data.id);
        mainElement.setAttribute('data-index', index.toString());
      }

      // Régler les props
      Object.keys(data).forEach(prop => {
        const value = ((data as unknown) as Record<string, string>)[prop] as string;
        clone
          .querySelectorAll(`[data-prop="${prop}"]`)
          .forEach( element => {
            if ( value.startsWith('<') ) {
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
  }

  // Méthode de filtrage des entrées
  // Retourne celles qui commencent par +search+
  static searchMatchingItems(searched: string): Entry[] {
    // On rationalise l'entrée pour rechercher plus efficacement
    // dans la liste.
    const prefixLower = StringNormalizer.toLower(searched);
    const prefixRa = StringNormalizer.rationalize(searched);
    
    return this.filter((entry: any) => {
      return entry.entree_min.startsWith(prefixLower) || 
             entry.entree_min_ra.startsWith(prefixRa);
    }) as CachedEntryData[];
 
    return [];
  }

}

const RpcEntry = createRpcClient();
RpcEntry.on('populate', (params) => {
  const items = Entry.deserializeItems(params.data);
  console.log("[CLIENT Entry] Items désérialisé", items);
  PanelEntry.populate(items);
});

// Pour exposer globalement
(window as any).Entry = Entry ;
