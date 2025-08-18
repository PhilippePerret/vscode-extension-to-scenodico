import { CommonClassItem, ItemData } from '../CommonClassItem';
import { CachedExempleData, StringNormalizer } from '../CacheTypes';
import { CacheManager } from '../CacheManager';
import { Oeuvre } from '../oeuvres/Oeuvre';
import { Entry } from '../entries/Entry';

export interface ExempleData extends ItemData {
  content: string;
  oeuvre_id?: string;
  entry_id?: string;
}

export class Exemple extends CommonClassItem {
  static readonly minName = 'exemple';
  
  // Cache manager spécifique aux exemples
  private static _cacheManagerInstance: CacheManager<ExempleData, CachedExempleData> = new CacheManager();
  
  protected static get cacheManager(): CacheManager<ExempleData, CachedExempleData> {
    return this._cacheManagerInstance;
  }
  
  static readonly ERRORS = {
    'no-items': 'Aucun exemple dans la base, bizarrement…',
  };

  static formateProp(prop: string, value: any): string {
    return value || '';
  }

  /**
   * Prépare un exemple pour le cache de recherche
   * SEULE méthode spécifique - le reste hérite de CommonClassItem !
   */
  static prepareItemForCache(exemple: ExempleData): CachedExempleData {
    const contentNormalized = StringNormalizer.toLower(exemple.content);
    const contentRationalized = StringNormalizer.rationalize(exemple.content);
    
    // Résoudre le titre de l'œuvre si possible
    // ATTENTION: Les caches des autres classes peuvent ne pas être encore construits
    let oeuvreTitle: string | undefined;
    if (exemple.oeuvre_id) {
      try {
        if (Oeuvre.isCacheBuilt) {
          const oeuvre = Oeuvre.get(exemple.oeuvre_id);
          oeuvreTitle = oeuvre ? oeuvre.titre_affiche : undefined;
        }
      } catch (error) {
        console.warn(`[Exemple] Could not resolve oeuvre ${exemple.oeuvre_id}:`, error);
      }
    }
    
    // Résoudre l'entrée associée si possible
    let entryEntree: string | undefined;
    if (exemple.entry_id) {
      try {
        if (Entry.isCacheBuilt) {
          const entry = Entry.get(exemple.entry_id);
          entryEntree = entry ? entry.entree : undefined;
        }
      } catch (error) {
        console.warn(`[Exemple] Could not resolve entry ${exemple.entry_id}:`, error);
      }
    }
    
    return {
      id: exemple.id,
      content: exemple.content,
      content_min: contentNormalized,
      content_min_ra: contentRationalized,
      oeuvre_id: exemple.oeuvre_id,
      oeuvre_titre: oeuvreTitle,
      entry_id: exemple.entry_id,
      entry_entree: entryEntree
    };
  }

  /**
   * Recherche d'exemples par contenu (optimisée)
   * Méthode spécifique Exemple
   */
  static searchMatchingTerm(searchTerm: string): CachedExempleData[] {
    const searchLower = StringNormalizer.toLower(searchTerm);
    const searchRa = StringNormalizer.rationalize(searchTerm);
    
    return this.filter((exemple: any) => {
      return exemple.content_min.includes(searchLower) ||
             exemple.content_min_ra.includes(searchRa);
    }) as CachedExempleData[];
  }

  /**
   * Récupère tous les exemples associés à une oeuvre
   * Méthode spécifique Exemple
   */
  static getByOeuvre(oeuvreId: string): CachedExempleData[] {
    return this.filter((exemple: any) => exemple.oeuvre_id === oeuvreId) as CachedExempleData[];
  }

  /**
   * Récupère tous les exemples associés à une entrée
   * Méthode spécifique Exemple
   */
  static getByEntry(entryId: string): CachedExempleData[] {
    return this.filter((exemple: any) => exemple.entry_id === entryId) as CachedExempleData[];
  }
  
  // Méthodes typées pour plus de confort (optionnel)
  static get(id: string): CachedExempleData | null {
    return super.get(id) as CachedExempleData | null;
  }
  
  static getAll(): CachedExempleData[] {
    return super.getAll() as CachedExempleData[];
  }

  /**
   * Post-traitement après affichage : regrouper les exemples par œuvre
   * IMPORTANT: Cette méthode est appelée après l'affichage initial
   */
  static afterDisplayItems(): boolean {
    console.log('[EXEMPLES] afterDisplayItems - Grouping examples by oeuvre');
    
    const mainConteneur = this.container as HTMLElement | null ;
    
    if ( mainConteneur === null ) {
      console.error('[EXEMPLES] No container found for grouping');
      return false;
    }
    
    const exemples = Array.from(mainConteneur.querySelectorAll('div.exemple'));
    if (exemples.length === 0) {
      console.log('[EXEMPLES] No examples found to group');
      return true;
    }
    
    // Regrouper par oeuvre_id
    const groupsByOeuvre = new Map<string, Element[]>();
    const ungrouped: Element[] = [];
    
    exemples.forEach(exempleElement => {
      const oeuvreId = exempleElement.querySelector('.exemple-oeuvre_id')?.textContent?.trim();
      if (oeuvreId && oeuvreId !== '') {
        if (!groupsByOeuvre.has(oeuvreId)) {
          groupsByOeuvre.set(oeuvreId, []);
        }
        groupsByOeuvre.get(oeuvreId)!.push(exempleElement);
      } else {
        ungrouped.push(exempleElement);
      }
    });
    
    console.log(`[EXEMPLES] Found ${groupsByOeuvre.size} oeuvre groups and ${ungrouped.length} ungrouped examples`);
    
    // Vider le container et reconstruire avec les groupes
    mainConteneur.innerHTML = '';
    
    // Ajouter les groupes avec titres
    for (const [oeuvreId, oeuvreExemples] of groupsByOeuvre) {
      // Trouver le titre de l'oeuvre dans le cache
      let oeuvreTitle = oeuvreId; // fallback
      if (this.isCacheBuilt) {
        // Chercher dans nos examples cached pour trouver le titre
        const exempleWithOeuvre = oeuvreExemples[0];
        if (exempleWithOeuvre) {
          const dataId = exempleWithOeuvre.getAttribute('data-id');
          if (dataId) {
            const cachedExemple = this.get(dataId);
            if (cachedExemple?.oeuvre_titre) {
              oeuvreTitle = cachedExemple.oeuvre_titre;
            }
          }
        }
      }
      
      // Créer le titre de section
      const oeuvreHeader = document.createElement('h3');
      oeuvreHeader.className = 'oeuvre-title';
      oeuvreHeader.textContent = oeuvreTitle;
      
      // Ajouter bouton d'ajout d'exemple
      const btnAdd = document.createElement('button');
      btnAdd.className = 'btn-add-exemple';
      btnAdd.innerHTML = '<i class="codicon codicon-add"></i>';
      btnAdd.setAttribute('data-oeuvre-id', oeuvreId);
      oeuvreHeader.appendChild(btnAdd);
      
      const cont = this.container as HTMLElement | null ;

      mainConteneur.appendChild(oeuvreHeader);
      
      // Ajouter les exemples du groupe
      oeuvreExemples.forEach(exemple => {
        mainConteneur.appendChild(exemple);
      });
    }
    
    // Ajouter les exemples non groupés à la fin
    if (ungrouped.length > 0) {
      if ( mainConteneur !== null ) {
        const ungroupedHeader = document.createElement('h3');
        ungroupedHeader.className = 'oeuvre-title';
        ungroupedHeader.textContent = 'Exemples sans œuvre';
        mainConteneur.appendChild(ungroupedHeader);
        ungrouped.forEach(exemple => {
          mainConteneur.appendChild(exemple);
        });
      } else {
        throw new ReferenceError("Le container des exemples est introuvable…");
      }
   }
    
    console.log('[EXEMPLES] Grouping completed');
    return true;
  }
}
