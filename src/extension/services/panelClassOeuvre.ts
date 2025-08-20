import { PanelClass } from './panelClass';
import { Oeuvre } from '../models/Oeuvre';

export class PanelClassOeuvre extends PanelClass {
  protected _type = 'oeuvre' ;
  protected _title = 'Œuvre' ; 
  protected _classe = Oeuvre ;
  protected _column = 2 ;

  protected static sortFonction(a: Oeuvre, b: Oeuvre): number {
    const titleA = a.titre_original || a.titre_affiche;
    const titleB = b.titre_original || b.titre_affiche;
    return titleA.localeCompare(titleB, 'fr', {
      sensitivity: 'base',
      numeric: true,
      caseFirst: 'lower'
    });
 }

  protected getDB(): any {
    const { OeuvreDb } = require('../db/OeuvreDb');
    return OeuvreDb;
  }
}