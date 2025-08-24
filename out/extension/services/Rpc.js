"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanalExemple = exports.CanalOeuvre = exports.CanalEntry = void 0;
const RpcServer_1 = require("./panels/RpcServer");
class Rpc {
    panel;
    rpc;
    // C'est ici qu'on détermine le panneau, quand il est fait
    initialize(panel) {
        this.panel = panel;
        this.rpc = (0, RpcServer_1.createRpcServer)(panel);
    }
    // ON peut définir ici les méthodes communes à tous les canaux.
    // Pour demander au panneau le peuplement du panneau en lui
    // transmettant les données des entrées.
    async askForPopulate(data) {
        console.log("[EXTENSION] Envoi des données du %s pour peuplement", this.panelName, w);
        this.rpc.ask("populate", { data: data }).then((retour) => {
            console.log("Retour après populate des données du %s.", this.panelName, retour);
        });
    }
}
// Toutes les commandes de message doivent être définies ici
class RpcEntry extends Rpc {
    panelName = 'panneau des entrées';
}
class RpcOeuvre extends Rpc {
    panelName = 'panneau des œuvres';
}
class RpcExemple extends Rpc {
    panelName = 'panneau des exemples';
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
exports.CanalEntry = new RpcEntry();
exports.CanalOeuvre = new RpcOeuvre();
exports.CanalExemple = new RpcExemple();
//# sourceMappingURL=Rpc.js.map