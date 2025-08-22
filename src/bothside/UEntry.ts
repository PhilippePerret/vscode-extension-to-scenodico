/**
 * Ce module contient les éléments utiles aussi bien côté extension (serveur)
 * que côté client (webview)
 */
import { UniversalDicoElement } from './UniversalDicoElement';

export class UEntry extends UniversalDicoElement {
  [key: string]: any;
  
   static readonly GENRES = {
    'nm': 'n.m.',
    'nf': 'n.f.',
    'np': 'n.pl.',
    'vb': 'verbe',
    'adj': 'adj.',
    'adv': 'adv.'
  };

  static genre(id:string):string { return this.GENRES[id as keyof typeof this.GENRES];}

  constructor(data: {[key: string]: any}){
    super(data);
    // TODO D'autres traitement ici propres à l'élément, sinon le
    // constructeur ne se justifie pas.
  }

}