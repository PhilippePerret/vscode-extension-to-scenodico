"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalCacheManager = void 0;
/**
 * Classe abstraite pour les managers de cache, Extension/Webview
 * (ce module est donc chargé par les deux côté client/server)
 *
 * Toutes les méthodes partagées sont définies ici.
 * Voir les classes ExtensionCacheManager et WebviewCacheManager qui
 * servent à l'extension ou au webview.
 */
class UniversalCacheManager {
    _cache = new Map();
    _built = false;
    _prepared = false;
    clear() { this._cache.clear(); this._built = false; this._prepared = false; }
    inject(data, fnTrans) {
        console.log("-> inject() avec les données", data);
        this.clear();
        data.forEach((item) => {
            const fullItem = fnTrans(item);
            console.log("+ ajout de ", fullItem);
            this._cache.set(fullItem.id, fullItem);
        });
        this._prepared = true;
        this._built = true;
    }
    has(id) { return this._cache.has(id); }
    get(id) { return this._cache.get(id); }
    getAll() { return Array.from(this._cache.values()); }
    get size() { return this._cache.size; }
    forEach(fn) { this._cache.forEach(item => fn(item)); }
    filter(filtre) {
        const result = [];
        this.forEach(item => { if (filtre(item)) {
            result.push(item);
        } ; });
        return result;
    }
}
exports.UniversalCacheManager = UniversalCacheManager;
//# sourceMappingURL=UniversalCacheManager.js.map