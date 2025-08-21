import { UniversalDicoElement } from './UniversalDicoElement';

export class UOeuvre extends UniversalDicoElement {
  [key: string]: any;

  public titre_affiche: string = '--- titre affiché non défini ---' ;
  constructor( data: {[k:string]:any} ){
    super(data);
  }
}