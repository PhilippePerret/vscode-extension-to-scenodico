import { AnyCachedData } from "./CacheTypes";

export interface CacheableItem {
  id: string;
  [key: string]: any;
}

/**
 * Gestionnaire de cache générique utilisant une Map indexée par ID
 * pour un accès O(1) aux éléments
 */
export class CacheManager<TRaw extends CacheableItem, TCached extends CacheableItem> {
  private _cache: Map<string, TCached> = new Map();
  private _isBuilt: boolean = false;
  protected _isPrepared: boolean = false;
  
  public get prepared() {
    return this._isPrepared === true ; 
  }

 prepareCacheWithData(
    rawData: TRaw[],
    prepareItemForCacheMethod: (item: TRaw) => TCached,
    debugName:string
  ): void {
    // Initialisation de la Map
    this._cache.clear();

    rawData.forEach(item => {
      this._cache.set(item.id, prepareItemForCacheMethod(item));
    });
    
    this._isPrepared = true ;
    console.log(`Cache préparé pour ${debugName}: ${this._cache.size} éléments`);
  }
  
  finalizeCachedData(
    finalizeItemMethod: (item: CacheableItem) => void,
    debugName: string
  ): void {
    this.forEach(item => finalizeItemMethod(item));
  }
  // /**
  //  * Construit le cache à partir des données brutes
  //  * @param rawData - Données brutes de la base de données
  //  * @param prepareFunction - Fonction de préparation des données pour le cache
  //  * @param debugName - Nom pour les logs de debug
  //  */
  // buildCache(
  //   finalizeCachedItemMethod: (item: TCached) => TCached,
  //   debugName: string
  // ): void {
  //   // On boucle sur les données qui ont été mises en cache.
  //   this._cache.forEach(item => {
  //     this._cache.set(item.id, finalizeCachedItemMethod(item));
  //   });
    
  //   this._isBuilt = true;
  //   console.log(`Cache construit pour ${debugName} éléments`);
  // }

  /**
   * Récupère un élément par son ID
   * @param id - ID de l'élément à récupérer
   * @returns L'élément trouvé ou null
   */
  get(id: string): TCached | null {
    return this._cache.get(id) || null;
  }

  /**
   * Récupère tous les éléments du cache sous forme d'array
   * @returns Array de tous les éléments cachés
   */
  getAll(): TCached[] {
    return Array.from(this._cache.values());
  }

  /**
   * Récupère toutes les clés (IDs) du cache
   * @returns Array de tous les IDs
   */
  getAllIds(): string[] {
    return Array.from(this._cache.keys());
  }

  /**
   * Itère sur tous les éléments du cache
   * @param callback - Fonction appelée pour chaque élément
   */
  forEach(callback: (item: TCached, id: string) => void): void {
    this._cache.forEach((item, id) => callback(item, id));
  }

  /**
   * Filtre les éléments du cache
   * @param predicate - Fonction de filtrage
   * @returns Array des éléments qui correspondent au critère
   */
  filter(predicate: (item: TCached, id: string) => boolean): TCached[] {
    const result: TCached[] = [];
    this._cache.forEach((item, id) => {
      if (predicate(item, id)) {
        result.push(item);
      }
    });
    return result;
  }

  /**
   * Cherche un élément selon un critère
   * @param predicate - Fonction de recherche
   * @returns Premier élément trouvé ou null
   */
  find(predicate: (item: TCached, id: string) => boolean): TCached | null {
    for (const [id, item] of this._cache) {
      if (predicate(item, id)) {
        return item;
      }
    }
    return null;
  }

  /**
   * Vide le cache
   */
  clear(): void {
    this._cache.clear();
    this._isBuilt = false;
  }

  /**
   * Vérifie si le cache est construit
   */
  get isBuilt(): boolean {
    return this._isBuilt;
  }

  /**
   * Retourne la taille du cache
   */
  get size(): number {
    return this._cache.size;
  }

  /**
   * Vérifie si un ID existe dans le cache
   * @param id - ID à vérifier
   */
  has(id: string): boolean {
    return this._cache.has(id);
  }
}
