// import '../InterCom-tests';
import { RpcChannel } from '../../bothside/RpcChannel';
import { UExemple } from '../../bothside/UExemple';
import { FullExemple } from '../../extension/models/Exemple';
import { ClientItem } from '../ClientItem';
import { ClientPanel } from '../ClientPanel';
import { createRpcClient } from '../RpcClient';

export class Exemple extends ClientItem<UExemple, FullExemple> {
  static readonly minName = 'exemple';
  static readonly klass = Exemple;

//   static readonly minName = 'exemple';
  
//   /**
//    * Filtrage des exemples 
//    * Méthode spécifique Exemple
//    * 
//    * En mode "normal"
//    * Le filtrage, sauf indication contraire, se fait par rapport aux
//    * titres de film. Le mécanisme est le suivant : l'user tape un
//    * début de titres de film. On en déduit les titres grâce à la
//    * méthode de la classe Oeuvre. On prend l'identifiant et on 
//    * affiche tous les exemples du film voulu.
//    * 
//    * En mode "Entrée", l'utilisateur tape une entrée du dictionnaire
//    * et la méthode renvoie tous les exemples concernant cette entrée.
//    * 
//    * En mode "Contenu", la recherche se fait sur le contenu, partout
//    * et sur toutes les entrées.
//    * 
//    * QUESTION Comment faire la différence entre les différents modes
//    * de recherche ? peut-être avec un préfix ('content' pour recher-
//    * che sur le contenu, 'dico:' ou 'entree:' pour la recherche sur 
//    * les entrées et rien pour la recherche sur le film)
//    */
//   protected static searchMatchingItems(searched: string): CachedExempleData[] {
//     const searchLower = StringNormalizer.toLower(searched);
//     const searchRa = StringNormalizer.rationalize(searched);
//     const mode: string = 'by oeuvre' ; // doit pouvoir être déterminé depuis searchLower

//     switch (mode) {
//       case 'by oeuvre':
//         /*
//         TODO Ça doit être affiné : 
//         - on appelle la méthode Oeuvre.searchMatchingItems(searchLower) pour
//           obtenir les oeuvres possibles
//         - on boucle sur chaque oeuvre pour obtenir les exemples. On retourne 
//           la liste obtenue.
//         */
//         const oeuvreId = 'DITD' ; // à déterminer en fonction du début cherché
//         return this.getByOeuvre(oeuvreId) as CachedExempleData[];
//       case 'by entry':
//         return [] as CachedExempleData[];
//       case 'by content':
//         return this.filter((exemple: any) => {
//           return exemple.content_min.includes(searchLower) ||
//             exemple.content_min_ra.includes(searchRa);
//         }) as CachedExempleData[];
//       default:
//         return [] ; // ne doit jamais être atteint, juste pour lint
//     }
//  }

//   /**
//    * Récupère tous les exemples associés à une oeuvre
//    * Méthode spécifique Exemple
//    */
//   static getByOeuvre(oeuvreId: string): CachedExempleData[] {
//     return this.filter((exemple: any) => exemple.oeuvre_id === oeuvreId) as CachedExempleData[];
//   }
//   /**
//    * Post-traitement après affichage : ajouter les titres des films
//    * IMPORTANT: Cette méthode est appelée après l'affichage initial
//    * 
//    * Fonctionnement
//    * --------------
//    * Pour optimiser le traitement, en considérant qu'on peut avoir
//    * des milliers d'exemples, on ne passe pas par le DOM mais par
//    * les données (getAll). Puisqu'elles sont relevées dans l'ordre,
//    * c'est-à-dire par film, il suffit d'ajouter un titre au premier
//    * exemple qu'on trouve qui a un film différent du précédent.
//    * 
//    */
//   static afterDisplayItems(): boolean {
//     console.log('[EXEMPLES] afterDisplayItems - Grouping examples by oeuvre');
    
//     const mainConteneur = this.container as HTMLElement | null ;
    
//     if ( mainConteneur === null ) {
//       // Ça ne devrait jamais arriver
//       console.error('[EXEMPLES] No container found for grouping');
//       return false;
//     }
//     // Film courant
//     let currentOeuvreId = '' ;
//     this.cacheManager.getAll().forEach(exemple => {
//       if ( exemple.oeuvre_id === currentOeuvreId ) { return ; }
//       // Le film change, il faut mettre un titre avant
//       const domObj = document.querySelector(`main#items > div.item[data-id="${exemple.id}"]`) as HTMLDivElement ;
//       currentOeuvreId = exemple.oeuvre_id as string ;
//       const titleObj = document.createElement('h2');
//       const oeuvre = this.cacheManager.get(exemple.oeuvre_id as string);
//       console.log("oeuvre répondant à l'id %s", currentOeuvreId, oeuvre);
//       if ( !oeuvre ) {
//         console.log("Oeuvre introuvable, this.cacheManager vaut", this.cacheManager);
//         throw new Error("L'œuvre devrait être définie.");
//       }
//       const titre = oeuvre ? oeuvre.titre_affiche : "œuvre introuvable" ;
//       console.log("Titre", titre);
//       titleObj.innerHTML = titre ;
//        // Ajouter bouton d'ajout d'exemple
//       const btnAdd = document.createElement('button');
//       btnAdd.className = 'btn-add';
//       btnAdd.innerHTML = '<i class="codicon codicon-add"></i>';
//       btnAdd.setAttribute('data-oeuvre_id', currentOeuvreId);
//       titleObj.appendChild(btnAdd);
//       domObj.parentNode?.insertBefore(titleObj, domObj);
//     });
//     console.log('[EXEMPLES] Titling completed');
//     return true;
//   }
}
class PanelExemple extends ClientPanel {
 static titName = 'Exemple';
}


const RpcEx: RpcChannel = createRpcClient();
RpcEx.on('populate', (params) => {
  const items = Exemple.deserializeItems(params.data);
  console.log("[CLIENT-Exemple] Items désérialisés", items);
});
(window as any).Exemple = Exemple;