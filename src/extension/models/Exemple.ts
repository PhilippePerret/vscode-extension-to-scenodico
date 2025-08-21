import { UExemple } from '../../bothside/UExemple';
import { UniversalCacheManager } from '../../bothside/UniversalCacheManager';

// La donnée persistante
export interface IExemple {
	id: string;
	oeuvre_id: string;
	indice: number;
	entry_id: string;
	content: string;
	notes?: string;
}
 
interface FullExemple extends IExemple {
  content_min: string;             // Version minuscules pour recherche
  content_min_ra: string;          // Version rationalisée (sans accents)
  oeuvre_titre?: string;           // Titre de l'oeuvre (résolu via Oeuvre.get())
	entree_formated: string;
	oeuvre_formated: string; 
}

// La donnée telle qu'elle sera en cache
export class Exemple extends UExemple {
	public static panelId = 'exemples';
	private static get cache(){ return this._cacheManagerInstance;}
	private static _cacheManagerInstance: UniversalCacheManager<IExemple, FullExemple> = new UniversalCacheManager();


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

	public static prepareItemsForCache(items: IExemple[]): void {
		this.cache.inject(items, this.prepareItemForCache.bind(this));
	}
	private static prepareItemForCache(item: IExemple): FullExemple {
		const preparedItem = item as FullExemple;
		return preparedItem;
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
	static sortFunction(a:any, b:any): number {
		// First sort by oeuvre ID (oeuvre_id)
		const oeuvreComparison = a.oeuvre_id.localeCompare(b.oeuvre_id);
		if (oeuvreComparison !== 0) { return oeuvreComparison; }
		// Then sort by indice
		return a.indice - b.indice;
	}
}