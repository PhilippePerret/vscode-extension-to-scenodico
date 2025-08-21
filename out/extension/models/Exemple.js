"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exemple = void 0;
const UExemple_1 = require("../../bothside/UExemple");
const UniversalCacheManager_1 = require("../../bothside/UniversalCacheManager");
// La donnée telle qu'elle sera en cache
class Exemple extends UExemple_1.UExemple {
    static panelId = 'exemples';
    static get cache() { return this._cacheManagerInstance; }
    static _cacheManagerInstance = new UniversalCacheManager_1.UniversalCacheManager();
    static sortFonction(a, b) {
        // First sort by oeuvre ID (oeuvre_id)
        const oeuvreComparison = a.oeuvre_id.localeCompare(b.oeuvre_id);
        if (oeuvreComparison !== 0) {
            return oeuvreComparison;
        }
        return a.indice - b.indice;
    }
    constructor(data) {
        super(data);
        this.id = `${this.oeuvre_id}-${this.indice}`;
    }
    static prepareItemsForCache(items) {
        this.cache.inject(items, this.prepareItemForCache.bind(this));
    }
    static prepareItemForCache(item) {
        const preparedItem = item;
        return preparedItem;
    }
    /**
     * Convert to database row
     */
    toRow() {
        return {
            id: this.id, // Include computed id for webview
            oeuvre_id: this.oeuvre_id,
            indice: this.indice,
            entry_id: this.entry_id,
            content: this.content,
            notes: this.notes || null
        };
    }
    /**
     * Create from database row
     */
    static fromRow(row) {
        return new Exemple(row);
    }
    /**
     * Sort function for exemples (by oeuvre_id then by indice)
     */
    static sortFunction(a, b) {
        // First sort by oeuvre ID (oeuvre_id)
        const oeuvreComparison = a.oeuvre_id.localeCompare(b.oeuvre_id);
        if (oeuvreComparison !== 0) {
            return oeuvreComparison;
        }
        // Then sort by indice
        return a.indice - b.indice;
    }
}
exports.Exemple = Exemple;
//# sourceMappingURL=Exemple.js.map