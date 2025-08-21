
interface InputItem {
  id: string;
  [k:string]:any
}
interface FullCachedItem extends InputItem {
  id: string;
  [k:string]:any;
}

/**
 * Classe abstraite pour les managers de cache, Extension/Webview
 * (ce module est donc chargé par les deux côté client/server)
 * 
 * Toutes les méthodes partagées sont définies ici.
 * Voir les classes ExtensionCacheManager et WebviewCacheManager qui
 * servent à l'extension ou au webview.
 */
export class UniversalCacheManager<Tin extends InputItem, Tfull extends FullCachedItem> {
  protected _cache: Map<string, Tfull> = new Map();
  protected _built: boolean = false;
  protected _prepared: boolean = false;
  clear(): void { this._cache.clear(); this._built = false; this._prepared = false; }
  inject(
    data: Tin[],
    fnTrans: (item: Tin) => Tfull
  ) : void {
    this.clear();
    data.forEach((item: Tin ) => { 
      const fullItem = fnTrans(item);
      this._cache.set(fullItem.id, fullItem);
    });
  }
  has(id: string): boolean { return this._cache.has(id); }
  get(id: string): Tfull | undefined { return this._cache.get(id); }
  getAll(): Tfull[] { return Array.from(this._cache.values()); }
  get size(): number { return this._cache.size; }
  forEach(fn: (item: Tfull) => void): void { this._cache.forEach(item => fn(item)); }
  filter(filtre: (item: Tfull) => boolean): Tfull[] {
    const result: Tfull[] = [];
    this.forEach(item => { if (filtre(item)) { result.push(item); }; });
    return result;
  }
}
