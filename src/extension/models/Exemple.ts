import { UExemple } from '../../bothside/UExemple';
import { CacheableItem } from '../services/cache/CacheManager';

// La donnée persistante
export interface IExemple {
	oeuvre_id: string;
	indice: number;
	entry_id: string;
	content: string;
	notes?: string;
}

// La donnée telle qu'elle sera en cache
export class Exemple extends UExemple {
	public static panelId = 'exemples';
	[key:string]:any;
	public id: string; // Computed composite key

	public static sortFonction(a: Exemple, b: Exemple): number {
    // First sort by oeuvre ID (oeuvre_id)
    const oeuvreComparison = a.oeuvre_id.localeCompare(b.oeuvre_id);
    if (oeuvreComparison !== 0) {
      return oeuvreComparison;
    }
    return a.indice - b.indice;
	}

	constructor(data: IExemple) {
		super(data);
		this.id = `${this.oeuvre_id}-${this.indice}`;
	}

	static prepareItemForCache(item: IExemple): CacheableItem {
		const cachedItem = new Exemple(item);
		return cachedItem as CacheableItem;
	}

	/**
	 * Convert to database row
	 */
	toRow(): any {
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
	static fromRow(row: IExemple): Exemple {
		return new Exemple(row);
	}

	/**
	 * Sort function for exemples (by oeuvre_id then by indice)
	 */
	static sortFunction(a: Exemple, b: Exemple): number {
		// First sort by oeuvre ID (oeuvre_id)
		const oeuvreComparison = a.oeuvre_id.localeCompare(b.oeuvre_id);
		if (oeuvreComparison !== 0) { return oeuvreComparison; }
		// Then sort by indice
		return a.indice - b.indice;
	}
}