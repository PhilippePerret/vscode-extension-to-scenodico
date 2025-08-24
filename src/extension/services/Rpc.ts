import * as vscode from 'vscode';
import { createRpcServer } from './panels/RpcServer';
import { PanelManager } from './panels/PanelManager';
import { RpcChannel } from '../../bothside/RpcChannel';

abstract class Rpc {
  protected panel: any;
  protected rpc: any;

  // C'est ici qu'on détermine le panneau, quand il est fait
  initialize(panel: vscode.WebviewPanel) {
    this.panel = panel;
    this.rpc = createRpcServer(panel);
  }
}

// Toutes les commandes de message doivent être définies ici
class RpcEntry extends Rpc {
  // protected _panel = undefined; 
  
  // Pour demander au panneau le peuplement du panneau en lui
  // transmettant les données des entrées.
  async askForPopulate(entries: {[k:string]: any}): Promise<void>{
    this.rpc.ask("populate", { data: entries }).then( (retour: {[k:string]:any}) => {
      console.log("Retour après populate", retour);
    });
  }


}
// C'est cette constante exposée que l'extension doit appeler de partout
/**
 * Pour envoyer un message à la webvew des entrées :
 *  1)  Implémenter la méthode '<methode>' dans la classe RpcEntry ci-dessus, qui
 *      envoi le message '<mon-message>'
 *  Z)  Côté webview, implémenter la réception du message '<mon-message>' (et 
 *      le retour si ça n'est pas une simple notification)
 *  3)  Appeler 'CanalEntry.<methode>(...)' depuis n'importe où de l'extension
 */

export const CanalEntry = new RpcEntry();