import { CacheableItem } from './CacheManager';

/**
 * Utilitaire pour normaliser les chaînes de caractères
 * (suppression des accents, minuscules, etc.)
 */
export class StringNormalizer {
  /**
   * Normalise une chaîne en minuscules
   */
  static toLower(text: string): string {
    return text.toLowerCase();
  }

  /**
   * Normalise une chaîne en supprimant les accents et diacritiques
   * TODO: À améliorer avec une vraie fonction de normalisation
   */
  static rationalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD') // Décompose les caractères accentués
      .replace(/[\u0300-\u036f]/g, '') // Supprime les marques diacritiques
      .replace(/[^a-zA-Z0-9]/g, '');  // note : si c'était avant la ligne précédente, il n'y aurait pas besoin de la ligne précédente…
  }
}

// ============================================================
// INTERFACES POUR LES DONNÉES EN CACHE
// ============================================================

/**
 * Données d'une entrée en cache (optimisées pour la recherche)
 */
export interface CachedEntryData extends CacheableItem {
  id: string;
  entree: string;
  entree_min: string;              // Version minuscules pour recherche
  entree_min_ra: string;           // Version rationalisée (sans accents) 
  categorie_id?: string;
  categorie?: string;              // Nom de la catégorie (résolu via Entry.get())
  genre?: string;
}

/**
 * Données d'une œuvre en cache (optimisées pour la recherche)
 */
export interface CachedOeuvreData extends CacheableItem {
  id: string;
  titre_affiche: string;
  titre_original?: string;
  titre_francais?: string;
  titre_affiche_formated?: string;
  titre_francais_formated?: string;
  titres: string[];                // Tous les titres combinés pour recherche
  titresLookUp: string[];            // Versions minuscules des titres
  annee?: number;
  auteurs?: string;
  auteurs_formated?: string;
}

/**
 * Données d'un exemple en cache (optimisées pour la recherche) 
 */
export interface CachedExempleData extends CacheableItem {
  id: string;
  content: string;
  content_min: string;             // Version minuscules pour recherche
  content_min_ra: string;          // Version rationalisée (sans accents)
  oeuvre_id?: string;
  oeuvre_titre?: string;           // Titre de l'oeuvre (résolu via Oeuvre.get())
  entry_id?: string;
  entry_entree?: string;           // Entrée associée (résolue via Entry.get())
}

// ============================================================
// TYPES D'AIDE POUR LE TYPAGE FORT
// ============================================================

/**
 * Type union pour tous les types de données mises en cache
 */
export type AnyCachedData = CachedEntryData | CachedOeuvreData | CachedExempleData;
