import { UEntry } from "../bothside/UEntry";
import { UExemple } from "../bothside/UExemple";
import { UOeuvre } from "../bothside/UOeuvre";
import { Entry } from "./models/Entry";
import { Exemple } from "./models/Exemple";
import { Oeuvre } from "./models/Oeuvre";
import { FullEntry } from "../extension/models/Entry";
import { FullOeuvre } from "../extension/models/Oeuvre";
import { FullExemple } from "../extension/models/Exemple";

type Tel_u = FullEntry | FullOeuvre | FullExemple;
type Tel = typeof Entry | typeof Oeuvre | typeof Exemple;

export abstract class ClientItem<Tel, Tel_u> {
  data: Tel_u;
  static klass: any;
  static allItems: any[];
  static deserializeItems(items: string[]) {
    this.allItems = items.map( item => new this.klass(JSON.parse(item)));
    return this.allItems;
  }
  constructor(itemData: Tel_u){
    this.data = itemData;
  } 
}