import * as vscode from 'vscode';
import { createRpcServer } from './panels/RpcServer';

abstract class Rpc {
  protected panel: any;
  protected rpc: any;
  protected abstract panelName: string;

  // C'est ici qu'on détermine le panneau, quand il est fait
  initialize(panel: vscode.WebviewPanel) {
    this.panel = panel;
    this.rpc = createRpcServer(panel);
  }
  
  // ON peut définir ici les méthodes communes à tous les canaux.

  // Pour demander au panneau le peuplement du panneau en lui
  // transmettant les données des entrées.
  async askForPopulate(data: {[k:string]: any}): Promise<void>{
    console.log("[EXTENSION] Envoi des données du %s pour peuplement", this.panelName);
    this.rpc.ask("populate", { data: data }).then( (retour: {[k:string]:any}) => {
      console.log("Retour après populate des données du %s.", this.panelName, retour);
    });
  }

}

// Toutes les commandes de message doivent être définies ici
class RpcEntry extends Rpc {
  protected panelName = 'panneau des entrées';
  
}

class RpcOeuvre extends Rpc {
  protected panelName = 'panneau des œuvres';
  // Définir ici les méthodes messages avec le panneau des Oeuvres
  
}
class RpcExemple extends Rpc {
  protected panelName = 'panneau des exemples';

  // Définir ici les méthodes messages avec le panneau des exemples
  
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
export const CanalOeuvre = new RpcOeuvre();
export const CanalExemple = new RpcExemple();