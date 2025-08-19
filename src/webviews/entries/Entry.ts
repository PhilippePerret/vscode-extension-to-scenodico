import '../common';
import { CommonClassItem, ItemData } from '../CommonClassItem';
import { CachedEntryData, StringNormalizer } from '../CacheTypes';
import { CacheableItem, CacheManager } from '../CacheManager';

export interface EntryData extends ItemData {
  entree: string;
  genre?: string;
  categorie_id?: string;
  definition?: string;
}

export class Entry extends CommonClassItem {
  static readonly minName = 'entry';
  
  // Cache manager spécifique aux entrées
  private static _cacheManagerInstance: CacheManager<EntryData, CachedEntryData> = new CacheManager();
  
  protected static get cacheManager(): CacheManager<EntryData, CachedEntryData> {
    return this._cacheManagerInstance;
  }
  
  static readonly ERRORS = {
    'no-items': 'Aucune entrée dans la base, bizarrement…',
  };

  static readonly GENRES = {
    'nm': 'n.m.',
    'nf': 'n.f.',
    'np': 'n.pl.',
    'vb': 'verbe',
    'adj': 'adj.',
    'adv': 'adv.'
  };

  static formateProp(prop: string, value: any): string {
    switch(prop) {
      case 'genre':
        return this.GENRES[value as keyof typeof this.GENRES] || `# genre ${value} inconnu #`;
      default: 
        return value || '';
    }
  }

  /**
   * Prépare une entrée pour le cache de recherche
   * SEULE méthode spécifique - le reste hérite de CommonClassItem !
   */
  static prepareItemForCache(entry: EntryData): CachedEntryData {
    const entreeNormalized = StringNormalizer.toLower(entry.entree);
    const entreeRationalized = StringNormalizer.rationalize(entry.entree);
   
    return {
      id: entry.id,
      entree: entry.entree,
      definition: undefined, // définition formatée
      raw_definition: entry.definition,
      entree_min: entreeNormalized,
      entree_min_ra: entreeRationalized,
      categorie_id: entry.categorie_id,
      categorie: undefined,
      genre: entry.genre
    };
  }


  /**
   * Méthode qui, après chargement de toutes les données, finalise la
   * donnée cache
   * 
   * @param item Entrée du dictionnaire
   */
  static finalizeCachedItem(item: CacheableItem): void {
    // Résoudre la catégorie (c'est possible maintenant que toutes les
    // données sont connées) 
    let categorie: string | undefined;
    if (item.categorie_id) {
      const categorieEntry = this.cacheManager.get(item.categorie_id);
      categorie = categorieEntry ? (categorieEntry as CachedEntryData).entree : undefined;
      item.categorie = categorie ; 
    } else {
      item.categorie = '-- hors catégorie --' ;
    }
    
    // Mise en forme de la définition
    item.definition = item.raw_definition ; // TODO à mettre en forme
  }
  
  /**
   * Recherche d'entrées par préfixe (optimisée)
   * Méthode spécifique Entry
   */
  protected static searchMatchingItems(prefix: string): CachedEntryData[] {
    const prefixLower = StringNormalizer.toLower(prefix);
    const prefixRa = StringNormalizer.rationalize(prefix);
    
    return this.filter((entry: any) => {
      return entry.entree_min.startsWith(prefixLower) || 
             entry.entree_min_ra.startsWith(prefixRa);
    }) as CachedEntryData[];
  }
  
  // Méthodes typées pour plus de confort (optionnel)
  static get(id: string): CachedEntryData | null {
    return super.get(id) as CachedEntryData | null;
  }
  
  static getAll(): CachedEntryData[] {
    return super.getAll() as CachedEntryData[];
  }
}

// Pour exposer globalement
(window as any).Entry = Entry ;
