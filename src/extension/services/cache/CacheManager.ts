import { AnyElementType, AnyElementClass } from "../../models/AnyElement";
import { AnyCachedData } from "./CacheTypes";

export interface CacheableItem {
  id: string;
  [key: string]: any;
}

/**
 * Gestionnaire de cache générique utilisant une Map indexée par ID
 * pour un accès O(1) aux éléments
 * 
 * Newby
 * La déclaration ci-dessous signifie que TRaw et TCached seront deux
 * types utilisés par la class CacheManager
 */
export class CacheManager<TRaw extends CacheableItem, TCached extends CacheableItem> {
  
/**
 * 
 * @param rawData La donnée telle qu'elle vient de la base de données
 * @param itemClass La classe de l'élément transmis 
 */
 prepareCacheWithData(
    rawData: TRaw[],
    itemClass: AnyElementClass
  ): void {
    this._cache.clear();
    rawData.forEach(item => {
      this._cache.set(item.id, itemClass.prepareItemForCache(item) as TCached);
    });
    this._isPrepared = true ;
    console.log(`[WEBVIEW] Cache préparé pour ${itemClass.name}: ${this._cache.size} éléments`);
  }
  
  finalizeCachedData(
    finalizeItemMethod: (item: CacheableItem) => void,
    debugName: string
  ): void {
    this.forEach(item => finalizeItemMethod(item));
  }
}
