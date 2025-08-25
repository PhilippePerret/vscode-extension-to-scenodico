import { RpcChannel } from '../../bothside/RpcChannel';
import { UExemple } from '../../bothside/UExemple';
import { FullExemple } from '../../extension/models/Exemple';
import { StringNormalizer } from '../../bothside/StringUtils';
import { ClientItem } from '../ClientItem';
import { ClientPanel } from '../ClientPanel';
import { createRpcClient } from '../RpcClient';

export class Exemple extends ClientItem<UExemple, FullExemple> {
  static readonly minName = 'exemple';
  static readonly klass = Exemple;

}

interface OTitre {
  id: string;
  obj: HTMLDivElement;        // l'objet complet du titre
  display: 'block' | 'none';  // pour savoir s'il est affiché ou non
  titre: string;              // le titre affiché
}

class PanelExemple extends ClientPanel {
  static readonly minName = 'exemple';
  static titName = 'Exemple';
  static modeFiltre = 'by-title';
  static get allItems() { return Exemple.allItems; }
  static BlockTitres: Map<string, OTitre> = new Map();

  static initialize(){
    // On montre le menu qui permet de choisir le mode de filtrage de
    // la liste.
    (document.querySelector('#search-by-div') as HTMLDivElement)
      .classList.remove('hidden');
  }

  static observePanel(): void {
    super.observePanel();
    this.menuModeFiltre.addEventListener('change', this.onChangeModeFiltre.bind(this));
  }
  static onChangeModeFiltre(_ev: any){
    this.modeFiltre = this.menuModeFiltre.value;
    console.info("Le mode de filtrage a été mis à '%s'", this.modeFiltre);
  }
  static get menuModeFiltre(){return (document.querySelector('#search-by') as HTMLSelectElement);}
  
  /**
   * Appelée après l'affichage des exemples, principalement pour
   * afficher les titres des oeuvres dans le DOM.
   */
  static afterDisplayItems(){
    super.afterDisplayItems(); // on ne sait jamais 
    // Principe : on boucle sur tous les éléments (qui sont forcément 
    // classés par oeuvre) et dès qu'on passe à une autre oeuvre on
    // crée un nouveau titre.
    let currentOeuvreId: string = ''; // le titre couramment affiché
    this.allItems.forEach((item: Exemple): undefined => {
      const ditem = item.data;
      if ( ditem.oeuvre_id === currentOeuvreId ) { return ; }
      // --- NOUVEAU TITRE ---
      currentOeuvreId = ditem.oeuvre_id;
      const obj = document.createElement('h2');
      obj.className = 'titre-oeuvre';
      const spanTit = document.createElement('span');
      spanTit.className = 'titre';
      spanTit.innerHTML = ditem.oeuvre_titre;
      obj.appendChild(spanTit);
      const titre = {
        id: ditem.oeuvre_id,
        obj: obj,
        titre: ditem.oeuvre_titre,
        display: 'block'
      } as OTitre;
      // On consigne ce titre pour pouvoir le manipuler facilement
      this.BlockTitres.set(titre.id, titre);

      const firstEx = document.querySelector(`main#items > div[data-id="${ditem.id}"]`);
      this.container?.insertBefore(obj, firstEx);
    });
  }
  /**
   * Filtrage des exemples 
   * Méthode spécifique Exemple
   * 
   * En mode "normal"
   * Le filtrage, sauf indication contraire, se fait par rapport aux
   * titres de film. Le mécanisme est le suivant : l'user tape un
   * début de titres de film. On en déduit les titres grâce à la
   * méthode de la classe Oeuvre. On prend l'identifiant et on 
   * affiche tous les exemples du film voulu.
   * 
   * En mode "Entrée", l'utilisateur tape une entrée du dictionnaire
   * et la méthode renvoie tous les exemples concernant cette entrée.
   * 
   * En mode "Contenu", la recherche se fait sur le contenu, partout
   * et sur toutes les entrées.
   * 
   */
  public static searchMatchingItems(searched: string): Exemple[] {
    const searchLow = StringNormalizer.toLower(searched);
    const searchRa = StringNormalizer.rationalize(searched); 
    let exemplesFound: Exemple[];

    switch (this.modeFiltre) {

      case 'by-title':
        // Filtrage par titre d'œuvre (défaut)
        exemplesFound = this.filter((exData: {[k:string]: any}) => {
          return exData.titresLookUp.some((titre: string) => {
            return titre.substring(0, searchLow.length) === searchLow;
          });
        }) as Exemple[];
        break;
      case 'by-entry':
        // Filtrage pour entrée
        exemplesFound = this.filter((exData: {[k:string]: any}) => {
          const seg = exData.entry4filter.substring(0, searchLow.length);
          return seg === searchLow || seg === searchRa;
        }) as Exemple[];
        break;
      case 'by-content':
         exemplesFound = this.filter((exData: {[k:string]: any}) => {
          return exData.content_min.includes(searchLow) ||
            exData.content_min_ra.includes(searchRa);
        }) as Exemple[];
        break;
      default:
        return [] ; // ne doit jamais être atteint, juste pour lint
    }
    // Traitement des titres
    // On par du principe que les titres des exemples choisis doivent
    // être affichés (note : je pense que ça peut être une méthode
    // communes à tous les filtrages)
    
    // Pour consigner les titres modifiés
    const titres2aff: Map<string, boolean> = new Map();

    exemplesFound.forEach((ex: Exemple) => {
      // Si le titre a déjà été traité, on passe au suivant
      if ( titres2aff.has(ex.data.oeuvre_id)) { return ; }
      titres2aff.set(ex.data.oeuvre_id, true);
    });
    // Ici, on a dans titres2aff les titres à afficher
    this.BlockTitres.forEach((btitre:OTitre) => {
      const dispWanted = titres2aff.has(btitre.id) ? 'block' : 'none';
      if ( btitre.display === dispWanted) { return ; }
      btitre.display = dispWanted ;
      btitre.obj.style.display = dispWanted;
    });

    return exemplesFound;
 }
}


const RpcEx: RpcChannel = createRpcClient();
RpcEx.on('populate', (params) => {
  const items = Exemple.deserializeItems(params.data);
  console.log("[CLIENT-Exemple] Items désérialisés", items);
  PanelExemple.populate(items);
  PanelExemple.initialize();
});
(window as any).Exemple = Exemple;