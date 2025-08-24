// import '../InterCom-tests';
import { UOeuvre } from '../../bothside/UOeuvre';
import { RpcChannel } from '../../bothside/RpcChannel';
import { createRpcClient } from '../RpcClient';
import { ClientItem } from '../ClientItem';
import { ClientPanel } from '../ClientPanel';
import { FullOeuvre } from '../../extension/models/Oeuvre';
import { StringNormalizer } from '../../extension/services/cache/CacheTypes';

export class Oeuvre extends ClientItem<UOeuvre, FullOeuvre> {
  static readonly minName = 'oeuvre';
 static readonly klass = Oeuvre;

}

class PanelOeuvre extends ClientPanel {
  static readonly minName = 'oeuvre';
  static readonly titName = 'Oeuvre';
  static get allItems() { return Oeuvre.allItems; }
  static searchMatchingItems(searched: string): Oeuvre[] {
    const searchLower = StringNormalizer.toLower(searched);
    return this.filter((oeuvreData: {[k:string]: any}) => {
      return oeuvreData.titresLookUp.some((titre: string) => {
        return titre.startsWith(searchLower);
      });
    }) as Oeuvre[];
  }
}

const rpcOeuvre:RpcChannel = createRpcClient();
rpcOeuvre.on('populate', (params) => {
  const items = Oeuvre.deserializeItems(params.data);
  console.log("[CLIENT-Oeuvres] Items désérialisés", items);
  PanelOeuvre.populate(items);
});


(window as any).Oeuvre = Oeuvre ;