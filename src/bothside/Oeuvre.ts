import { UniversalDicoElement } from './UniversalDicoElement';

export class Oeuvre extends UniversalDicoElement {
  public titre_affiche: string = '--- titre affiché non défini ---' ;
  constructor( data: {[k:string]:any} ){
    super(data);
  }
}