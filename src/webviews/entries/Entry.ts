import '../common';
import { UEntry } from '../../bothside/UEntry';

export class Entry extends UEntry {
  static readonly minName = 'entry';
 
  // static readonly ERRORS = {
  //   'no-items': 'Aucune entrée dans la base, bizarrement…',
  // };

  // }
  
  // /**
  //  * Recherche d'entrées par préfixe (optimisée)
  //  * Méthode spécifique Entry
  //  */
  // protected static searchMatchingItems(prefix: string): CachedEntryData[] {
  //   const prefixLower = StringNormalizer.toLower(prefix);
  //   const prefixRa = StringNormalizer.rationalize(prefix);
    
  //   return this.filter((entry: any) => {
  //     return entry.entree_min.startsWith(prefixLower) || 
  //            entry.entree_min_ra.startsWith(prefixRa);
  //   }) as CachedEntryData[];
  // }
}

// Pour exposer globalement
(window as any).Entry = Entry ;
