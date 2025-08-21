import { TypeUnionElement, TypeUnionClasse } from './UnversalConstants';

// Les données brutes telles qu'elles sont relevées dans la base
export interface RawData {
  [key: string]: any;
}

// Les données travaillées et mise en cache
export interface CachedItem {
  id: string;
  [key: string]: any;
  classe: TypeUnionElement;
}

/**
 * Classe abstraite pour les managers de cache, Extension/Webview
 * (ce module est donc chargé par les deux côté client/server)
 * 
 * Toutes les méthodes partagées sont définies ici.
 * Voir les classes ExtensionCacheManager et WebviewCacheManager qui
 * servent à l'extension ou au webview.
 */
export abstract class UniversalCacheManager<RawData, CachedItem> {
  protected _cache: Map<string, CachedItem> = new Map();
  protected _built: boolean = false;
  protected _prepared: boolean = false;
  clear(): void { this._cache.clear(); this._built = false; this._prepared = false; }
  has(id: string): boolean { return this._cache.has(id); }
  get(id: string): CachedItem | undefined { return this._cache.get(id); }
  getAll(): CachedItem[] { return Array.from(this._cache.values()); }
  get size(): number { return this._cache.size; }
  forEach(fn: (item: CachedItem) => void): void { this._cache.forEach(item => fn(item)); }
  filter(filtre: (item: CachedItem) => boolean): CachedItem[] {
    const result: CachedItem[] = [];
    this.forEach(item => { if (filtre(item)) { result.push(item); }; });
    return result;
  }
}

/**
 *
 * RawData est un simple type qui contient des strings en clé et des valeurs 
 * quelconques 
 * TypeUnionElement correspond à Entry | Oeuvre | Exemple
 *
 */
export class ExtensionCacheManager extends UniversalCacheManager<RawData, TypeUnionElement> {

  // Toute première mise en cache des données
  cacheRawData(data: RawData[], itemClass: TypeUnionClasse): void {
    this._prepared = true;
    this.clear();
    data.forEach(ditem => { 
      const item = new itemClass(ditem) as TypeUnionElement;
      this._cache.set(ditem.id, item) ;
    });
  }

}

/**
 * La manageur de cache pour les webview
 */
export class WebviewCacheManager extends UniversalCacheManager<CachedItem, CachedItem> {

}