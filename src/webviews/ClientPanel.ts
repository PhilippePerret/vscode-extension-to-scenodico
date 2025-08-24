import { Entry } from "./entries/Entry";
import { Exemple } from "./exemples/Exemple";
import { Oeuvre } from "./oeuvres/Oeuvre";

type Tel = typeof Entry | typeof Oeuvre | typeof Exemple;

export abstract class ClientPanel<Tel> {
  static _container: HTMLElement | null;
  static _itemTemplate: HTMLTemplateElement | null;

  static get container(): HTMLElement | null {
    return this._container || (this._container = document.querySelector('main#items'));
  }
  static get itemTemplate(): HTMLTemplateElement | null {
    return this._itemTemplate || (this._itemTemplate = document.querySelector('template#item-template'));
  }
  static cloneItemTemplate(): DocumentFragment | null {
    return this.itemTemplate!.content.cloneNode(true) as DocumentFragment;
  }
}

