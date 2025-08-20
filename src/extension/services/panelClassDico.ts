import { Entry } from '../models/Entry';
import { PanelClass } from './panelClass';

export class PanelClassDico extends PanelClass {
  protected _type = 'dictionnaire';
  protected _title = 'Dictionnaire';
  protected _classe = Entry ;
  protected _column = 1 ;

  protected static sortFonction(a: Entry, b: Entry): number {
    return a.entree.localeCompare(b.entree, 'fr', {
      sensitivity: 'base',
      numeric: true,
      caseFirst: 'lower'
    });
  }

  protected getDB(): any {
    const { EntryDb } = require('../db/EntryDb');
    return EntryDb ;
  }
}