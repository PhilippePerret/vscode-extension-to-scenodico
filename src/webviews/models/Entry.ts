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

  static get(entryId: string): Entry {
    // Pour le moment on fait comme ça, mais ensuite on fera une Map
    const entryData = PanelEntry.allItems.find(item => item.data.id === entryId);
    const entry = new Entry(entryData.data);
    console.log("Entrée trouvée : ", entry);
    return entry;
  }
  
  constructor(data: FullEntry) {
    super(data);
    this.id = data.id;
  }
  private _obj: HTMLDivElement | undefined = undefined ;
  private id: string;

  scrollTo(){
    this.isNotVisible && this.setVisible();
    this.obj.scrollIntoView({behavior: 'auto', block: 'center'});
    return this; // chainage
  }
  select(){
    this.obj.classList.add('selected');
    return this; // chainage
  }
  setVisible(){
    this.obj.style.display = 'block';
    this.data.display = 'block';
  }
  get isNotVisible(){ return this.data.display === 'none'; }

  get obj(): HTMLDivElement {
    return (this._obj as HTMLDivElement) || (this._obj = document.querySelector(`main#items > div[data-id="${this.id}"]`) as HTMLDivElement);
  }
  
 
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

  // Scroll jusqu'à l'élément et le sélectionne
  static scrollToAndSelectEntry(entryId: string){
    Entry.get(entryId).scrollTo().select();
  }
}

const RpcEntry = createRpcClient();
RpcEntry.on('populate', (params) => {
  const items = Entry.deserializeItems(params.data);
  console.log("[CLIENT Entry] Items désérialisé", items);
  PanelEntry.populate(items);
});

RpcEntry.on('display-entry', (params) => {
  console.log("[CLIENT] Je dois afficher l'entrée '%s'", params.entry_id);
  PanelEntry.scrollToAndSelectEntry(params.entry_id);
});

// Pour exposer globalement
(window as any).Entry = Entry ;
