import { UEntry } from '../../bothside/UEntry';
import { EntryDb } from '../db/EntryDb';
import { CacheManager, CacheableItem } from '../services/cache/CacheManager';

// Forme de la donnée persistante
export interface IEntry {
	id: string;
	entree: string;
	genre: string;
	categorie_id?: string;
	definition: string;
}

// Classe de la donnée mise en cache
export class Entry extends UEntry {
	public static panelId: string = 'entries';
	[key: string]: any;
	private static _cacheManagerInstance: CacheManager<IEntry, Entry> = new CacheManager();

	public static MESSAGES = {
		'loading-message': "Chargement des entrées du dictionnaire…",
	};
	public static sortFonction(a: Entry, b: Entry): number {
    return a.entree.localeCompare(b.entree, 'fr', {
      sensitivity: 'base',
      numeric: true,
      caseFirst: 'lower'
    });
 
	}

	constructor(data: IEntry) {
		super(data);
	}

	/**
	 * Méthode de préparation de la donnée pour le cache
	 * 
	 * @param item  {IEntry} Donnée telle qu'elle est relevée dans la
	 *              base de données.
	 */
	static prepareItemForCache(item: IEntry): Entry {
		const cachedItem = new Entry(item);
		return cachedItem;
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
		return new Entry(row); 
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
