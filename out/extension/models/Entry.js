"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entry = void 0;
const UEntry_1 = require("../../bothside/UEntry");
const EntryDb_1 = require("../db/EntryDb");
const CacheManager_1 = require("../services/cache/CacheManager");
// Classe de la donnée mise en cache
class Entry extends UEntry_1.UEntry {
    static panelId = 'entries';
    static _cacheManagerInstance = new CacheManager_1.CacheManager();
    id = '';
    entree = '';
    genre = 'nm';
    genre_formated;
    categorie_id;
    categorie; // valeur humanisée
    definition = '';
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
     * Méthode de préparation de la donnée pour le cache
     *
     * @param item  {IEntry} Donnée telle qu'elle est relevée dans la
     *              base de données.
     */
    static prepareItemForCache(item) {
        const cachedItem = new Entry(item);
        return cachedItem;
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
     * Validate entry data
     */
    static validate(data) {
        const errors = [];
        if (!data.entree?.trim()) {
            errors.push('Entrée requise');
        }
        if (!data.id?.trim()) {
            errors.push('ID requis');
        }
        if (!data.definition?.trim()) {
            errors.push('Définition requise');
        }
        return errors;
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
        return new Entry({
            id: row.id,
            entree: row.entree,
            genre: row.genre,
            categorie_id: row.categorie_id,
            definition: row.definition
        });
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