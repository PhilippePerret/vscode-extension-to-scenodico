import { UniversalDicoElement } from "./UniversalDicoElement";

export class UExemple extends UniversalDicoElement {
  [key: string]: any;

  static get names(): {[k:string]: {sing:string, plur:string}} {
    return {
      min: { sing: "exemple", plur: "exemples"},
      maj: { sing: "EXEMPLE", plur: "EXEMPLES"},
      tit: { sing: "Exemple", plur: "Exemples"},
      tech: { sing: "exemple", plur: "exemples"}
    };
  }
 
}