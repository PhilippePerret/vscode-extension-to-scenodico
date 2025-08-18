import { BaseModel } from './BaseModel';
import { EntryDb } from '../db/EntryDb';

export interface IEntry {
    id: string;
    entree: string;
    genre: string;
    categorie_id?: string;
    definition: string;
}

export class Entry extends BaseModel {
    public id: string;
    public entree: string;
    public genre: string;
    public categorie_id?: string;
    public definition: string;

    public static MESSAGES = {
       'loading-message': "Chargement des entrées du dictionnaire…", 
    };

    constructor(data: IEntry) {
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
    static get panelId(): string {
        return 'entries';
    }

    /**
     * DB class for entries
     */
    static get DbClass(): typeof EntryDb {
        return EntryDb;
    }

    /**
     * Generate unique ID from entry text (lowercase, no accents, only letters/numbers)
     * 
     * TODO:
     *      1. Ne pas supprimer les diacritics, les remplacer par leur équivalent ("ç" -> "c")
     *      2. Demander confirmation pour l'identifiant, avec possibilité de le changer
     *          (et donc vérification de l'unicité avant enregistrement)
     */
    static generateId(entree: string): string {
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
    static validate(data: Partial<IEntry>): string[] {
        const errors: string[] = [];
        
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
    toRow(): any {
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
    static fromRow(row: any): Entry {
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
    static sortFunction(a: Entry, b: Entry): number {
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
    static afterDisplayElements(): void {
        // No special post-processing needed for entries panel
        // Elements are displayed in simple list format
    }
}
