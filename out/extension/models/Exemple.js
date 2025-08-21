"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exemple = void 0;
const UExemple_1 = require("../../bothside/UExemple");
// La donnée telle qu'elle sera en cache
class Exemple extends UExemple_1.UExemple {
    static panelId = 'exemples';
    id; // Computed composite key
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
        // Set computed id as a real property for JSON serialization
        this.id = `${this.oeuvre_id}-${this.indice}`;
    }
    static prepareItemForCache(item) {
        const cachedItem = new Exemple(item);
        return cachedItem;
    }
    /**
     * Validate exemple data
     */
    static validate(data) {
        const errors = [];
        if (!data.oeuvre_id?.trim()) {
            errors.push('ID de l\'œuvre requis');
        }
        if (data.indice === undefined || data.indice < 1) {
            errors.push('Indice requis (>= 1)');
        }
        if (!data.entry_id?.trim()) {
            errors.push('ID de l\'entrée requis');
        }
        if (!data.content?.trim()) {
            errors.push('Contenu requis');
        }
        return errors;
    }
    /**
     * Get next available indice for a given oeuvre
     * Note: This method needs access to existing exemples for the oeuvre
     */
    static getNextIndice(titreId, existingExemples) {
        const oeuvreExemples = existingExemples.filter(ex => ex.oeuvre_id === titreId);
        if (oeuvreExemples.length === 0) {
            return 1;
        }
        const maxIndice = Math.max(...oeuvreExemples.map(ex => ex.indice));
        return maxIndice + 1;
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
        return new Exemple({
            oeuvre_id: row.oeuvre_id,
            indice: row.indice,
            entry_id: row.entry_id,
            content: row.content,
            notes: row.notes
        });
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