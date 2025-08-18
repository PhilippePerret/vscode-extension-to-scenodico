"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entry = void 0;
const BaseModel_1 = require("./BaseModel");
const EntryDb_1 = require("../db/EntryDb");
class Entry extends BaseModel_1.BaseModel {
    id;
    entree;
    genre;
    categorie_id;
    definition;
    static MESSAGES = {
        'loading-message': "Chargement des entrées du dictionnaire…",
    };
    constructor(data) {
        super();
        this.id = data.id;
        this.entree = data.entree;
        this.genre = data.genre;
        this.categorie_id = data.categorie_id;
        this.definition = data.definition;
    }
    /**
     * Panel ID for entries
     */
    static get panelId() {
        return 'entries';
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