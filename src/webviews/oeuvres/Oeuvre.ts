import '../common';
import { CacheManager } from '../CacheManager';
import { CachedOeuvreData, StringNormalizer } from '../CacheTypes';
import { CommonClassItem, ItemData } from '../CommonClassItem';

export interface OeuvreData extends ItemData {
  titre_affiche: string;
  titre_original?: string;
  titre_francais?: string;
  annee?: number;
  auteurs?: string;
}

export class Oeuvre extends CommonClassItem {
  static readonly minName = 'oeuvre';

  private static readonly REG_ARTICLES = /\b(an|a|the|le|la|les|l'|de|du)\b/i ;
  
  // Cache manager spécifique aux oeuvres
  private static _cacheManagerInstance: CacheManager<OeuvreData, CachedOeuvreData> = new CacheManager();
  
  protected static get cacheManager(): CacheManager<OeuvreData, CachedOeuvreData> {
    return this._cacheManagerInstance;
  }
  // pour test
  static get cacheManagerForced() { return this.cacheManager ; }
  
  static readonly ERRORS = {
    'no-items': 'Aucune œuvre dans la base, bizarrement…',
  };

  static formateProp(prop: string, value: any): string {
    switch(prop) {
      case 'annee':
        return value ? value.toString() : '';
      default: 
        return value || '';
    }
  }

  /**
   * Prépare une œuvre pour le cache de recherche
   * SEULE méthode spécifique - le reste hérite de CommonClassItem !
   */
  static prepareItemForCache(oeuvre: OeuvreData): CachedOeuvreData {
    // Créer un array avec tous les titres disponibles
    const titres: string[] = [];

    if (oeuvre.titre_francais) {
      titres.push(StringNormalizer.rationalize(oeuvre.titre_francais));
    }
    if (oeuvre.titre_original) {
      titres.push(StringNormalizer.rationalize(oeuvre.titre_original));
    }
    if (oeuvre.titre_affiche) {
      titres.push(StringNormalizer.rationalize(oeuvre.titre_affiche));
    }
  
    // Il faut supprimer les articles dans les titres
    titres.forEach(titre => {
      if ( titre.match(this.REG_ARTICLES)) {
        titres.push(titre.replace(this.REG_ARTICLES, ""));
      }
    });

    const uniqTitres: string[] = [];
    titres.forEach(titre => {
      if ( uniqTitres.includes(titre) ) { return ; }
      uniqTitres.push(titre);
    });

    // Versions minuscules pour recherche
    const titresLookUp = uniqTitres.map(titre => StringNormalizer.toLower(titre));
    // console.info("titres min", titresLookUp);
    
    return {
      id: oeuvre.id,
      titre_affiche: oeuvre.titre_affiche,
      titre_original: oeuvre.titre_original,
      titre_francais: oeuvre.titre_francais,
      titres: titres,
      titresLookUp: titresLookUp,
      annee: oeuvre.annee,
      auteurs: oeuvre.auteurs,
    };
  }

  /**
   * Recherche d'œuvres par titre (optimisée)
   * Méthode spécifique Oeuvre
   */
  protected static searchMatchingItems(searchTerm: string): CachedOeuvreData[] {
    const searchLower = StringNormalizer.toLower(searchTerm);
    
    return this.filter((oeuvre: any) => {
      return oeuvre.titresLookUp.some((titre: string) => {
        
        const res: boolean = titre.startsWith(searchLower);
        console.log("Le titre %s répond %s avec %s", oeuvre.titre_affiche, res, searchLower);
        return res ;
      });
    }) as CachedOeuvreData[];
  }
}


(window as any).Oeuvre = Oeuvre ;