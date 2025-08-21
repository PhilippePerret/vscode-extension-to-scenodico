import { AnyElementType, AnyElementClass } from "../../models/AnyElement";
import { AnyCachedData } from "./CacheTypes";

export interface CacheableItem {
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
  ): void {
  }
  
  finalizeCachedData(
  ): void {
  }
}
