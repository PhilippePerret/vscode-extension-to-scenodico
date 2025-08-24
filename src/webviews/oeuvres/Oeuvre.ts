// import '../InterCom-tests';
import { UOeuvre } from '../../bothside/UOeuvre';
import { RpcChannel } from '../../bothside/RpcChannel';
import { createRpcClient } from '../RpcClient';
import { ClientItem } from '../ClientItem';
import { ClientPanel } from '../ClientPanel';
import { FullOeuvre } from '../../extension/models/Oeuvre';

export class Oeuvre extends ClientItem<UOeuvre, FullOeuvre> {
  static readonly minName = 'oeuvre';
  static readonly klass = Oeuvre;

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

class PanelOeuvre extends ClientPanel {
 static titName = 'Oeuvre';
}

const rpcOeuvre:RpcChannel = createRpcClient();
rpcOeuvre.on('populate', (params) => {
  const items = Oeuvre.deserializeItems(params.data);
  console.log("[CLIENT-Oeuvres] Items désérialisés", items);
});


(window as any).Oeuvre = Oeuvre ;