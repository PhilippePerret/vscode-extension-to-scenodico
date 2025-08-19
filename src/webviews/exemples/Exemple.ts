import { CommonClassItem, ItemData } from '../CommonClassItem';
import { AnyCachedData, CachedExempleData, StringNormalizer } from '../CacheTypes';
import { CacheManager } from '../CacheManager';
import { Oeuvre } from '../oeuvres/Oeuvre';
import { Entry } from '../entries/Entry';

export interface ExempleData extends ItemData {
  content: string;
  oeuvre_id: string;
  entry_id: string;
}

export class Exemple extends CommonClassItem {
  static readonly minName = 'exemple';
  
  // Cache manager spécifique aux exemples
  private static _cacheManagerInstance: CacheManager<ExempleData, CachedExempleData> = new CacheManager();
  
  protected static get cacheManager(): CacheManager<ExempleData, CachedExempleData> {
    return this._cacheManagerInstance;
  }
  
  static readonly ERRORS = {
    'no-items': 'Aucun exemple dans la base, bizarrement…',
  };

  static formateProp(prop: string, value: any): string {
    return value || '';
  }

  /**
   * Finalise la donnée pour le cache
   */
  static finalizeCachedItem(exemple: AnyCachedData): AnyCachedData {
    // Résoudre le titre de l'œuvre
    let oeuvreTitle: string | undefined;
    if (exemple.oeuvre_id) {
      try {
        if (Oeuvre.isCacheBuilt) {
          const oeuvre = Oeuvre.get(exemple.oeuvre_id);
          oeuvreTitle = oeuvre ? oeuvre.titre_affiche : undefined;
        }
      } catch (error) {
        console.warn(`[Exemple] Could not resolve oeuvre ${exemple.oeuvre_id}:`, error);
      }
    }
    exemple.oeuvre_titre = oeuvreTitle ;
    
    // Résoudre l'entrée associée
    let entryEntree: string | undefined;
    try {
      if (Entry.isCacheBuilt) {
        const entry = Entry.get(exemple.entry_id);
        entryEntree = entry ? entry.entree : undefined;
      }
    } catch (error) {
      console.warn(`[Exemple] Could not resolve entry ${exemple.entry_id}:`, error);
    }
    exemple.entry_entree = entryEntree ;
 
    return exemple;
  }
  /**
   * Prépare un exemple pour le cache de recherche
   * SEULE méthode spécifique - le reste hérite de CommonClassItem !
   * 
   * TODO En fait, il faut une méthode en deux temps :
   *  - le premier ne fait que mettre les données de l'item dans
   *    la donnée cachée
   *  - le deuxième temps, une fois toutes les données de tous les
   *    types chargées, prépare les données spéciales qui ont besoin
   *    des autres types.
   */
  static prepareItemForCache(exemple: ExempleData): CachedExempleData {
    const contentNormalized = StringNormalizer.toLower(exemple.content);
    const contentRationalized = StringNormalizer.rationalize(exemple.content);
   
    return {
      id: exemple.id,
      content: exemple.content,
      content_min: contentNormalized,
      content_min_ra: contentRationalized,
      oeuvre_id: exemple.oeuvre_id,
      oeuvre_titre: undefined,
      entry_id: exemple.entry_id,
      entry_entree: undefined
    };
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
   * QUESTION Comment faire la différence entre les différents modes
   * de recherche ? peut-être avec un préfix ('content' pour recher-
   * che sur le contenu, 'dico:' ou 'entree:' pour la recherche sur 
   * les entrées et rien pour la recherche sur le film)
   */
  static searchMatchingTerm(searchTerm: string): CachedExempleData[] {
    const searchLower = StringNormalizer.toLower(searchTerm);
    const searchRa = StringNormalizer.rationalize(searchTerm);
    const mode: string = 'by oeuvre' ; // doit pouvoir être déterminé depuis searchLower

    switch (mode) {
      case 'by oeuvre':
        /*
        TODO Ça doit être affiné : 
        - on appelle la méthode Oeuvre.searchMatchingTerm(searchLower) pour
          obtenir les oeuvres possibles
        - on boucle sur chaque oeuvre pour obtenir les exemples. On retourne 
          la liste obtenue.
        */
        const oeuvreId = 'DITD' ; // à déterminer en fonction du début cherché
        return this.getByOeuvre(oeuvreId) as CachedExempleData[];
      case 'by entry':
        return [] as CachedExempleData[];
      case 'by content':
        return this.filter((exemple: any) => {
          return exemple.content_min.includes(searchLower) ||
            exemple.content_min_ra.includes(searchRa);
        }) as CachedExempleData[];
      default:
        return [] ; // ne doit jamais être atteint, juste pour lint
    }
 }

  /**
   * Récupère tous les exemples associés à une oeuvre
   * Méthode spécifique Exemple
   */
  static getByOeuvre(oeuvreId: string): CachedExempleData[] {
    return this.filter((exemple: any) => exemple.oeuvre_id === oeuvreId) as CachedExempleData[];
  }

  /**
   * Récupère tous les exemples associés à une entrée
   * Méthode spécifique Exemple
   */
  static getByEntry(entryId: string): CachedExempleData[] {
    return this.filter((exemple: any) => exemple.entry_id === entryId) as CachedExempleData[];
  }
  
  // Méthodes typées pour plus de confort (optionnel)
  static get(id: string): CachedExempleData | null {
    return super.get(id) as CachedExempleData | null;
  }
  
  static getAll(): CachedExempleData[] {
    return super.getAll() as CachedExempleData[];
  }

  /**
   * Post-traitement après affichage : ajouter les titres des films
   * IMPORTANT: Cette méthode est appelée après l'affichage initial
   * 
   * Fonctionnement
   * --------------
   * Pour optimiser le traitement, en considérant qu'on peut avoir
   * des milliers d'exemples, on ne passe pas par le DOM mais par
   * les données (getAll). Puisqu'elles sont relevées dans l'ordre,
   * c'est-à-dire par film, il suffit d'ajouter un titre au premier
   * exemple qu'on trouve qui a un film différent du précédent.
   * 
   */
  static afterDisplayItems(): boolean {
    console.log('[EXEMPLES] afterDisplayItems - Grouping examples by oeuvre');
    
    const mainConteneur = this.container as HTMLElement | null ;
    
    if ( mainConteneur === null ) {
      // Ça ne devrait jamais arriver
      console.error('[EXEMPLES] No container found for grouping');
      return false;
    }
    // Film courant
    let currentOeuvreId = '' ;
    Exemple.getAll().forEach(exemple => {
      if ( exemple.oeuvre_id === currentOeuvreId ) { return ; }
      // Le film change, il faut mettre un titre avant
      const domObj = document.querySelector(`main#items > div.item[data-id="${exemple.id}"]`) as HTMLDivElement ;
      currentOeuvreId = exemple.oeuvre_id as string ;
      const titleObj = document.createElement('h2');
      const oeuvre = Oeuvre.get(currentOeuvreId) ;
      if ( !oeuvre ) {
        console.log("Oeuvre introuvable, Oeuvre.cacheManager vaut", Oeuvre.cacheManagerForced);
        throw new Error("L'œuvre devrait être définie.");
      }
      console.log("oeuvre répondant à l'id %s", currentOeuvreId, oeuvre);
      const titre = oeuvre ? oeuvre.titre_affiche : "œuvre introuvable" ;
      console.log("Titre", titre);
      titleObj.innerHTML = titre ;
       // Ajouter bouton d'ajout d'exemple
      const btnAdd = document.createElement('button');
      btnAdd.className = 'btn-add';
      btnAdd.innerHTML = '<i class="codicon codicon-add"></i>';
      btnAdd.setAttribute('data-oeuvre_id', currentOeuvreId);
      titleObj.appendChild(btnAdd);
      domObj.parentNode?.insertBefore(titleObj, domObj);
    });
    console.log('[EXEMPLES] Titling completed');
    return true;
  }
}
