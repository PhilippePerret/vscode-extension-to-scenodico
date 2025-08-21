/**
 * Ce module contient les éléments utiles aussi bien côté extension (serveur)
 * que côté client (webview)
 */
import { UniversalDicoElement } from './UniversalDicoElement';

export class Entry extends UniversalDicoElement {

   static readonly GENRES = {
    'nm': 'n.m.',
    'nf': 'n.f.',
    'np': 'n.pl.',
    'vb': 'verbe',
    'adj': 'adj.',
    'adv': 'adv.'
  };

  constructor(data: {[key: string]: any}){
    super(data);
    // TODO D'autres traitement ici propres à l'élément, sinon le
    // constructeur ne se justifie pas.
  }

}