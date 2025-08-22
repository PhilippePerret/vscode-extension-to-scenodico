import { UniversalDicoElement } from './UniversalDicoElement';

export class UOeuvre extends UniversalDicoElement {
  [key: string]: any;
  
  // Mettre en forme les auteurs
  protected static mef_auteurs(auteurs: string): string {
    const regauteurs = /(.+?) ([A-Z \-]+?)\(([HF]), (.+?)\)/;
    while (auteurs.match(regauteurs)) {
      auteurs = auteurs.replace(regauteurs, (_: string, prenom: string, nom: string, sexe: string, fonctions: string): string => {
        return `
        <span class="prenom">${prenom}</span>
        <span class="nom">${nom}</span>
        <span class="sexe">${sexe}</span>
        (<span class="fonctions">${fonctions}</span>)
        `;
      });
    }
    return auteurs.trim();
  }


  constructor( data: {[k:string]:any} ){
    super(data);
  }
}