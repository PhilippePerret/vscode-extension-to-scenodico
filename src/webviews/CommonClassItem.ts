import { CacheManager, CacheableItem } from './CacheManager';
import { AnyCachedData } from './CacheTypes';

export interface ItemData extends CacheableItem {
  id: string;
  [key: string]: any;
}

export abstract class CommonClassItem {
  private static _container: HTMLElement | null = null;
  private static _template: HTMLTemplateElement | null = null;
  
  // Propriétés qui doivent être définies par les classes filles
  static readonly minName: string;
  static readonly ERRORS: { [key: string]: string };
  
  // Cache manager - chaque classe fille doit fournir sa propre instance
  protected static get cacheManager(): CacheManager<any, any> {
    throw new Error('cacheManager getter must be implemented by subclass');
  }

  static get container(): HTMLElement | null {
    if (!this._container) {
      this._container = document.querySelector('main#items');
    }
    return this._container;
  }

  static get template(): HTMLTemplateElement | null {
    if (!this._template) {
      this._template = document.querySelector('template#item-template');
    }
    return this._template;
  }

  static error(errorId: string): string {
    // Cette propriété doit être définie par chaque classe fille
    const errors = (this as any).ERRORS;
    return errors?.[errorId] || `Unknown error: ${errorId}`;
  }

  /**
   * Formate une propriété pour l'affichage
   * DOIT être surchargée par chaque classe fille
   */
  static formateProp(prop: string, value: any): string {
    throw new Error('formateProp must be implemented by subclass');
  }

  /**
   * Prépare un item pour le cache de recherche
   * DOIT être surchargée par chaque classe fille
   */
  static prepareItemForCache(item: ItemData): any {
    throw new Error('prepareItemForCache must be implemented by subclass');
  }

  /**
   * Construit le cache à partir des données en base de données
   * Méthode commune DRY - pas de duplication !
   */
  static buildCache(bddData: ItemData[]): void {
    console.log(`[${this.name}] buildCache called with ${bddData.length} items`);
    try {
      this.cacheManager.buildCache(
        bddData, 
        (item) => this.prepareItemForCache(item),
        (this as any).minName
      );
      console.log(`[${this.name}] Cache built successfully, size: ${this.cacheSize}`);
    } catch (error) {
      console.error(`[${this.name}] Cache build failed:`, error);
      throw error;
    }
  }

  /**
   * Récupère un élément par son ID
   * @param id - ID de l'élément à récupérer
   */
  static get(id: string): AnyCachedData | null {
    return this.cacheManager.get(id);
  }

  /**
   * Récupère tous les éléments du cache
   */
  static getAll(): AnyCachedData[] {
    return this.cacheManager.getAll();
  }

  /**
   * Itère sur tous les éléments du cache
   * @param callback - Fonction appelée pour chaque élément
   */
  static forEach(callback: (item: AnyCachedData, id: string) => void): void {
    this.cacheManager.forEach(callback);
  }

  /**
   * Filtre les éléments du cache
   * @param predicate - Fonction de filtrage
   */
  static filter(predicate: (item: AnyCachedData, id: string) => boolean): AnyCachedData[] {
    return this.cacheManager.filter(predicate);
  }

  /**
   * Efface le cache
   */
  static clearCache(): void {
    this.cacheManager.clear();
  }

  /**
   * Vérifie si le cache est construit
   */
  static get isCacheBuilt(): boolean {
    return this.cacheManager.isBuilt;
  }

  /**
   * Retourne la taille du cache
   */
  static get cacheSize(): number {
    return this.cacheManager.size;
  }

  /**
   * Récupère le cache (pour compatibilité avec les tests existants)
   * @deprecated Utiliser les nouvelles méthodes get(), getAll(), etc.
   */
  static get searchCache(): AnyCachedData[] | null {
    const manager = this.cacheManager;
    return manager.isBuilt ? manager.getAll() : null;
  }

  /**
   * Accesso pour être compatible avec les tests existants
   * @deprecated
   */
  static get _searchCache(): AnyCachedData[] | null {
    return this.searchCache;
  }

  /**
   * Post-traitement après affichage des éléments
   * Doit être surclassé par les méthodes propres aux différents panneaux
   */
  static afterDisplayItems(): boolean {
    return true;
  }
}
