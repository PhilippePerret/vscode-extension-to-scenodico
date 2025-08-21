"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
/**
 * Gestionnaire de cache générique utilisant une Map indexée par ID
 * pour un accès O(1) aux éléments
 *
 * Newby
 * La déclaration ci-dessous signifie que TRaw et TCached seront deux
 * types utilisés par la class CacheManager
 */
class CacheManager {
    /**
     *
     * @param rawData La donnée telle qu'elle vient de la base de données
     * @param itemClass La classe de l'élément transmis
     */
    prepareCacheWithData() {
    }
    finalizeCachedData() {
    }
}
exports.CacheManager = CacheManager;
//# sourceMappingURL=CacheManager.js.map