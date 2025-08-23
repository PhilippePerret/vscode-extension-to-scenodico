import * as vscode from 'vscode';
import { createRpcServer } from './panels/RpcServer';
import { PanelManager } from './panels/PanelManager';
import { RpcChannel } from '../../bothside/RpcChannel';

// Ça serait peut-être mieux dans une table...
const [pEntry, pOeuvre, pExemple] = PanelManager.getActivePanels();
const rpcEntry: RpcChannel = createRpcServer(pEntry);
const rpcOeuvre: RpcChannel = createRpcServer(pOeuvre);
const rpcExemple: RpcChannel = createRpcServer(pExemple);

abstract class Rpc<Tpan, Trpc extends RpcChannel> {
  private _panel: Tpan;
  private _rpc: RpcChannel ;
  private get panel(){return this._panel;}

  constructor(panel: Tpan){
    this._panel = panel;
    this._rpc = this.getRpc() as Trpc;
  }
  get rpc(){
    return this._rpc;
  }
  getRpc() {
    switch(this.panel) {
      case pEntry: return rpcEntry;
      case pOeuvre: return rpcOeuvre;
      case pExemple: return rpcExemple;
    }
  }
}

// Toutes les commandes de message doivent être définies ici
class RpcEntry extends Rpc<typeof pEntry, typeof rpcEntry> {
  
  // Pour demander au panneau le peuplement du panneau en lui
  // transmettant les données des entrées.
  async askForPopulate(): Promise<void>{
    this.rpc.notify("populate", { data: {} /* TODO transmettre les données */ });
  }


}
// C'est cette constante exposée que l'extension doit appeler de partout
export const CanalEntry = new RpcEntry(pEntry);