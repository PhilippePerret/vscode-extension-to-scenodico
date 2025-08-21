import { UniversalDicoElement } from './UniversalDicoElement';

export class UOeuvre extends UniversalDicoElement {
  [key: string]: any;

  constructor( data: {[k:string]:any} ){
    super(data);
  }
}