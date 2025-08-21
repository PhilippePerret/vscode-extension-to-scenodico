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
		// Set computed id as a real property for JSON serialization
		this.id = `${this.oeuvre_id}-${this.indice}`;
	}

	static prepareItemForCache(item: IExemple): CacheableItem {
		const cachedItem = new Exemple(item);
		return cachedItem as CacheableItem;
	}


	/**
	 * Validate exemple data
	 */
	static validate(data: Partial<IExemple>): string[] {
		const errors: string[] = [];

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
	static getNextIndice(titreId: string, existingExemples: Exemple[]): number {
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
	static fromRow(row: any): Exemple {
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
	static sortFunction(a: Exemple, b: Exemple): number {
		// First sort by oeuvre ID (oeuvre_id)
		const oeuvreComparison = a.oeuvre_id.localeCompare(b.oeuvre_id);
		if (oeuvreComparison !== 0) {
			return oeuvreComparison;
		}
		// Then sort by indice
		return a.indice - b.indice;
	}
}