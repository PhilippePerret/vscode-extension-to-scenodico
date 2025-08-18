import { CommonClassItem, ItemData } from '../CommonClassItem';
import { CachedEntryData, StringNormalizer } from '../CacheTypes';
import { CacheManager } from '../CacheManager';

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
    
    // Résoudre la catégorie si possible (nécessite que le cache soit déjà construit)
    let categorie: string | undefined;
    if (entry.categorie_id && this.cacheManager.has(entry.categorie_id)) {
      const categorieEntry = this.cacheManager.get(entry.categorie_id);
      categorie = categorieEntry ? (categorieEntry as CachedEntryData).entree : undefined;
    }
    
    return {
      id: entry.id,
      entree: entry.entree,
      entree_min: entreeNormalized,
      entree_min_ra: entreeRationalized,
      categorie_id: entry.categorie_id,
      categorie: categorie,
      genre: entry.genre
    };
  }

  /**
   * Recherche d'entrées par préfixe (optimisée)
   * Méthode spécifique Entry
   */
  static searchMatchingTerm(prefix: string): CachedEntryData[] {
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
