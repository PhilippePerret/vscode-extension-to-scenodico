"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entry = void 0;
const UEntry_1 = require("../../bothside/UEntry");
const UniversalCacheManager_1 = require("../../bothside/UniversalCacheManager");
const EntryDb_1 = require("../db/EntryDb");
// Classe de la donnée mise en cache
class Entry extends UEntry_1.UEntry {
    static panelId = 'entries';
    static get cache() { return this._cacheManagerInstance; }
    static _cacheManagerInstance = new UniversalCacheManager_1.UniversalCacheManager();
    static MESSAGES = {
        'loading-message': "Chargement des entrées du dictionnaire…",
    };
    static sortFonction(a, b) {
        return a.entree.localeCompare(b.entree, 'fr', {
            sensitivity: 'base',
            numeric: true,
            caseFirst: 'lower'
        });
    }
    constructor(data) {
        super(data);
    }
    /**
     * Méthode pour préparation tous les items pour le cache
     */
    static prepareItemsForCache(items) {
        this.cache.inject(items, this.prepareItemForCache.bind(this));
        console.info("Cache après injection", this.cache);
    }
    /**
     * Méthode de préparation de la donnée pour le cache
     */
    static prepareItemForCache(item) {
        const preparedItem = item;
        return preparedItem;
    }
    /**
     * DB class for entries
     */
    static get DbClass() {
        return EntryDb_1.EntryDb;
    }
    /**
     * Generate unique ID from entry text (lowercase, no accents, only letters/numbers)
     *
     * TODO:
     *      1. Ne pas supprimer les diacritics, les remplacer par leur équivalent ("ç" -> "c")
     *      2. Demander confirmation pour l'identifiant, avec possibilité de le changer
     *          (et donc vérification de l'unicité avant enregistrement)
     */
    static generateId(entree) {
        return entree
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 50); // Limit length
    }
    /**
     * Convert to database row
     */
    toRow() {
        return {
            id: this.id,
            entree: this.entree,
            genre: this.genre,
            categorie_id: this.categorie_id || null,
            definition: this.definition
        };
    }
    /**
     * Create from database row
     */
    static fromRow(row) {
        return new Entry(row);
    }
    /**
     * Sort function for entries (by entree, respecting accents/diacritics)
     */
    static sortFunction(a, b) {
        return a.entree.localeCompare(b.entree, 'fr', {
            sensitivity: 'base',
            numeric: true,
            caseFirst: 'lower'
        });
    }
    /**
     * Post-processing after DOM elements are displayed
     * Called after all entries are rendered in the panel
     */
    static afterDisplayElements() {
        // No special post-processing needed for entries panel
        // Elements are displayed in simple list format
    }
}
exports.Entry = Entry;
//# sourceMappingURL=Entry.js.map