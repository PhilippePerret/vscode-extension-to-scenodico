import { BaseModel } from './BaseModel';
import { OeuvreDb } from '../db/OeuvreDb';
import { CacheableItem } from '../services/cache/CacheManager';

export interface IOeuvre {
    id: string;
    titre_affiche: string;
    titre_original?: string;
    titre_francais?: string;
    annee?: number;
    auteurs?: string;
    notes?: string;
    resume?: string;
}

export class Oeuvre extends BaseModel {
    public id: string;
    public titre_affiche: string;
    public titre_original?: string;
    public titre_francais?: string;
    public annee?: number;
    public auteurs?: string;
    public notes?: string;
    public resume?: string;

    constructor(data: IOeuvre) {
        super();
        this.id = data.id;
        this.titre_affiche = data.titre_affiche;
        this.titre_original = data.titre_original;
        this.titre_francais = data.titre_francais;
        this.annee = data.annee;
        this.auteurs = data.auteurs;
        this.notes = data.notes;
        this.resume = data.resume;
    }

    static prepareItemForCache(item: IOeuvre): CacheableItem  {

        // TODO Reprend la méthode qui était en webview
        return item as CacheableItem; 
    }

    /**
     * Panel ID for oeuvres
     */
    static get panelId(): string {
        return 'oeuvres';
    }

    /**
     * DB class for oeuvres
     */
    static get DbClass(): typeof OeuvreDb {
        return OeuvreDb;
    }

    /**
     * Get the title to use for sorting (French if exists, otherwise original)
     */
    get sortTitle(): string {
        return this.titre_francais || this.titre_original || this.titre_affiche;
    }

    /**
     * Articles to ignore when generating IDs
     */
    private static readonly ARTICLES = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'the', 'a', 'an'];

    /**
     * Map of diacritics to their base equivalents
     */
    private static readonly DIACRITIC_MAP: { [key: string]: string } = {
        'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
        'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
        'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
        'ý': 'y', 'ÿ': 'y',
        'ç': 'c', 'ñ': 'n',
        'œ': 'oe', 'æ': 'ae',
        // Uppercase versions
        'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A',
        'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
        'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
        'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O',
        'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
        'Ý': 'Y', 'Ÿ': 'Y',
        'Ç': 'C', 'Ñ': 'N',
        'Œ': 'OE', 'Æ': 'AE'
    };

    /**
     * Replace diacritics with their base equivalents
     */
    private static replaceDiacritics(text: string): string {
        return text.replace(/./g, char => this.DIACRITIC_MAP[char] || char);
    }

    /**
     * Clean and split title into words, removing articles
     */
    private static cleanTitle(titre: string): string[] {
        return this.replaceDiacritics(titre)
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, '') // Keep letters (both cases), numbers, spaces
            .split(/\s+/)
            .filter(word => word.length > 0 && !this.ARTICLES.includes(word));
    }

    /**
     * Generate base ID from title
     */
    private static generateBaseId(titre: string): string {
        const words = this.cleanTitle(titre);
        
        if (words.length >= 3) {
            // Take first letter of each word
            return words.map(word => word[0]).join('').toUpperCase();
        } else {
            // Take first 4 letters of combined words
            const combined = words.join('');
            return combined.substring(0, 4).toUpperCase();
        }
    }

    /**
     * Generate unique ID with incremental length if needed
     * Note: This method needs access to existing IDs for uniqueness check
     */
    static generateId(titre: string, annee?: number, existingIds: Set<string> = new Set()): string {
        const baseId = this.generateBaseId(titre);
        const yearSuffix = annee ? (annee % 100).toString().padStart(2, '0') : '';
        
        // Start with base ID + year
        let candidateId = baseId + yearSuffix;
        
        // If not unique, try extending the base part
        let letterCount = baseId.length;
        const words = this.cleanTitle(titre);
        const combined = words.join('');
        
        while (existingIds.has(candidateId)) {
            letterCount++;
            
            if (words.length >= 3) {
                // For multi-word titles, add next letters cyclically
                const extendedBase = words
                    .map(word => word.substring(0, Math.ceil(letterCount / words.length)))
                    .join('')
                    .substring(0, letterCount)
                    .toUpperCase();
                candidateId = extendedBase + yearSuffix;
            } else {
                // For short titles, just extend length
                const extendedBase = combined.substring(0, letterCount).toUpperCase();
                candidateId = extendedBase + yearSuffix;
            }
            
            // Safety break if title is too short
            if (letterCount > combined.length + 5) {
                candidateId += Math.random().toString(36).substring(2, 5).toUpperCase();
                break;
            }
        }
        
        return candidateId;
    }

    /**
     * Validate oeuvre data
     */
    static validate(data: Partial<IOeuvre>): string[] {
        const errors: string[] = [];
        
        if (!data.titre_affiche?.trim()) {
            errors.push('Titre affiché requis');
        }
        
        if (!data.id?.trim()) {
            errors.push('ID requis');
        }
        
        return errors;
    }

    /**
     * Convert to database row
     */
    toRow(): any {
        return {
            id: this.id,
            titre_affiche: this.titre_affiche,
            titre_original: this.titre_original || null,
            titre_francais: this.titre_francais || null,
            annee: this.annee || null,
            auteurs: this.auteurs || null,
            notes: this.notes || null,
            resume: this.resume || null
        };
    }

    /**
     * Create from database row
     */
    static fromRow(row: any): Oeuvre {
        return new Oeuvre({
            id: row.id,
            titre_affiche: row.titre_affiche,
            titre_original: row.titre_original,
            titre_francais: row.titre_francais,
            annee: row.annee,
            auteurs: row.auteurs,
            notes: row.notes,
            resume: row.resume
        });
    }

    /**
     * Sort function for oeuvres (by titre_original, respecting accents/diacritics)
     */
    static sortFunction(a: Oeuvre, b: Oeuvre): number {
        const titleA = a.titre_original || a.titre_affiche;
        const titleB = b.titre_original || b.titre_affiche;
        return titleA.localeCompare(titleB, 'fr', { 
            sensitivity: 'base', 
            numeric: true,
            caseFirst: 'lower'
        });
    }

    /**
     * Post-processing after DOM elements are displayed
     * Called after all oeuvres are rendered in the panel
     */
    static afterDisplayElements(): void {
        // No special post-processing needed for oeuvres panel
        // Elements are displayed in simple list format
    }
}
