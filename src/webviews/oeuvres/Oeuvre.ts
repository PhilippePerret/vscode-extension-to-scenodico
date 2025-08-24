import '../InterCom-tests';
import { UOeuvre } from '../../bothside/UOeuvre';
import { RpcChannel } from '../../bothside/RpcChannel';
import { createRpcClient } from '../RpcClient';

const rpcOeuvre:RpcChannel = createRpcClient();
rpcOeuvre.on('populate', (data) => {
  console.log("[WEBVIEW] Peuplement du panneau avec les données", data);
  return "J'ai bien peuplé le panneau";
});

export class Oeuvre extends UOeuvre {
  static readonly minName = 'oeuvre';

  // private static readonly REG_ARTICLES = /\b(an|a|the|le|la|les|l'|de|du)\b/i ;

  // // Cache manager spécifique aux oeuvres
  // private static _cacheManagerInstance: CacheManager<OeuvreData, CachedOeuvreData> = new CacheManager();

  // protected static get cacheManager(): CacheManager<OeuvreData, CachedOeuvreData> {
  //   return this._cacheManagerInstance;
  // }
  // // pour test
  // static get cacheManagerForced() { return this.cacheManager ; }

  // static readonly ERRORS = {
  //   'no-items': 'Aucune œuvre dans la base, bizarrement…',
  // };

  // /**
  //  * Recherche d'œuvres par titre (optimisée)
  //  * Méthode spécifique Oeuvre
  //  */
  // protected static searchMatchingItems(searchTerm: string): CachedOeuvreData[] {
  //   const searchLower = StringNormalizer.toLower(searchTerm);
    
  //   return this.filter((oeuvre: any) => {
  //     return oeuvre.titresLookUp.some((titre: string) => {
        
  //       const res: boolean = titre.startsWith(searchLower);
  //       console.log("Le titre %s répond %s avec %s", oeuvre.titre_affiche, res, searchLower);
  //       return res ;
  //     });
  //   }) as CachedOeuvreData[];
  // }
}


(window as any).Oeuvre = Oeuvre ;