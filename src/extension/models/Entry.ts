import { UEntry } from '../../bothside/UEntry';
import { UniversalCacheManager } from '../../bothside/UniversalCacheManager';
import { EntryDb } from '../db/EntryDb';

// Forme de la donnée persistante (en tout cas celle
// qui sera envoyée au cache)
export interface IEntry {
	id: string;
	entree: string;
	genre: string;
	categorie_id?: string;
	definition: string;
}

// La donnée cachée, complète
interface FullEntry extends IEntry {
  entree_min: string;              // Version minuscules pour recherche
  entree_min_ra: string;           // Version rationalisée (sans accents) 
  categorie_formated?: string;     // Nom de la catégorie (résolu via Entry.get())
  genre_formated?: string;

}

// Classe de la donnée mise en cache
export class Entry extends UEntry {
	public static panelId: string = 'entries';

	private static get cache(){ return this._cacheManagerInstance;}
	private static _cacheManagerInstance: UniversalCacheManager<IEntry, FullEntry> = new UniversalCacheManager();

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
	 * Méthode pour préparation tous les items pour le cache
	 */
	public static prepareItemsForCache(items: IEntry[]): void {
		console.log("Éléments Entrées à injecter dans le cache", items);
		this.cache.inject(items, this.prepareItemForCache.bind(this));
		console.info("Cache %s après injection (%i éléments)", this.name, this.cache.size, this.cache.getAll());
	}
	/**
	 * Méthode de préparation de la donnée pour le cache
	 */
	private static prepareItemForCache(item: IEntry): FullEntry {
		const preparedItem = item as FullEntry;
		return preparedItem;
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
	static sortFunction(a:any, b:{[k:string]:any}): number {
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
