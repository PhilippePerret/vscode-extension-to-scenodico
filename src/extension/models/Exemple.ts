import { UExemple } from '../../bothside/UExemple';
import { UniversalCacheManager } from '../../bothside/UniversalCacheManager';
import { App } from '../services/App';
import { Entry, FullEntry } from './Entry';
import { Oeuvre, FullOeuvre } from './Oeuvre';

// La donnée persistante
export interface IExemple {
	id: string;
	oeuvre_id: string;
	indice: number;
	entry_id: string;
	content: string;
	notes?: string;
}
 
export interface FullExemple extends IExemple {
	content_formated: string;
  content_min: string;             // Version minuscules pour recherche
  content_min_ra: string;          // Version rationalisée (sans accents)
  oeuvre_titre: string;            // Titre de l'oeuvre
	entree_formated: string;
	oeuvre_formated: string; 
}

// La donnée telle qu'elle sera en cache
export class Exemple extends UExemple {
	public static panelId = 'exemples';

	public static cacheDebug() { return this.cache; }
	protected static _cacheManagerInstance: UniversalCacheManager<IExemple, FullExemple> = new UniversalCacheManager();
  protected static get cache() { return this._cacheManagerInstance; };


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

	public static cacheAllData(items: IExemple[]): void {
		this.cache.inject(items, this.prepareItemForCache.bind(this));
	}
	private static prepareItemForCache(item: IExemple): FullExemple {
		const preparedItem = item as FullExemple;
		return preparedItem;
	}

	public static async finalizeCachedItems(): Promise<void> {
		await this.cache.traverse(this.finalizeCachedItem.bind(this));
		App.incAndCheckReadyCounter();
	}
	private static finalizeCachedItem(item: FullExemple): FullExemple {
		const entree = Entry.get(item.entry_id).entree_min;
		const titre_oeuvre = Oeuvre.get(item.oeuvre_id).titre_affiche;
		// On remplace 'TITRE' dans le texte de l'exemple
		let content_formated: string;
		if (item.content.match(/TITRE/) ){
			content_formated = item.content.replace(/TITRE/g, titre_oeuvre);
		} else {
			content_formated = `dans ${titre_oeuvre}, ${item.content}`;
		} 
		return Object.assign(item, {
			oeuvre_titre: titre_oeuvre,
			entree_formated: entree,
			content_formated: content_formated 
		});
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