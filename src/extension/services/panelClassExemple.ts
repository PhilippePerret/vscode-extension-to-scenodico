import { PanelClass } from './panelClass';
import { Exemple } from '../models/Exemple';

export class PanelClassExemple extends PanelClass {
  protected _type = 'exemple' ;
  protected _title = 'Exemple' ;
  protected _classe = Exemple ;
  protected _column = 3 ;

  protected static sortFonction(a: Exemple, b: Exemple): number {
    // First sort by oeuvre ID (oeuvre_id)
    const oeuvreComparison = a.oeuvre_id.localeCompare(b.oeuvre_id);
    if (oeuvreComparison !== 0) {
      return oeuvreComparison;
    }
    // Then sort by indice
    return a.indice - b.indice;
  }

  protected getDB(): any {
    const { ExempleDb } = require('../db/ExempleDb');
    return ExempleDb ;
  }
}