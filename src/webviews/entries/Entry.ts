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
import { StringNormalizer } from '../../bothside/StringUtils';
import { ClientItem } from '../ClientItem';
import { ClientPanel } from '../ClientPanel';
import { createRpcClient } from '../RpcClient';

type Tinstance = InstanceType<typeof UEntry>

export class Entry extends ClientItem<UEntry, FullEntry> {
  static readonly minName = 'entry';
  static readonly klass = Entry;
 
}

class PanelEntry extends ClientPanel {
  static readonly minName = 'entry';
  static readonly titName = 'Entry';
  static get allItems() { return Entry.allItems; }
  // Méthode de filtrage des entrées
  // Retourne celles qui commencent par +search+
  static searchMatchingItems(searched: string): Entry[] {
    const prefixLower = StringNormalizer.toLower(searched);
    const prefixRa = StringNormalizer.rationalize(searched);
    return this.filter((entryData: {[k:string]: any}) => {
      return entryData.entree_min.startsWith(prefixLower) || 
             entryData.entree_min_ra.startsWith(prefixRa);
    }) as Entry[];
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
