"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanalEntry = void 0;
const RpcServer_1 = require("./panels/RpcServer");
const PanelManager_1 = require("./panels/PanelManager");
// Ça serait peut-être mieux dans une table...
const [pEntry, pOeuvre, pExemple] = PanelManager_1.PanelManager.getActivePanels();
const rpcEntry = (0, RpcServer_1.createRpcServer)(pEntry);
const rpcOeuvre = (0, RpcServer_1.createRpcServer)(pOeuvre);
const rpcExemple = (0, RpcServer_1.createRpcServer)(pExemple);
class Rpc {
    _panel;
    _rpc;
    get panel() { return this._panel; }
    constructor(panel) {
        this._panel = panel;
        this._rpc = this.getRpc();
    }
    get rpc() {
        return this._rpc;
    }
    getRpc() {
        switch (this.panel) {
            case pEntry: return rpcEntry;
            case pOeuvre: return rpcOeuvre;
            case pExemple: return rpcExemple;
        }
    }
}
// Toutes les commandes de message doivent être définies ici
class RpcEntry extends Rpc {
    // Pour demander au panneau le peuplement du panneau en lui
    // transmettant les données des entrées.
    async askForPopulate() {
        this.rpc.notify("populate", { data: {} /* TODO transmettre les données */ });
    }
}
// C'est cette constante exposée que l'extension doit appeler de partout
exports.CanalEntry = new RpcEntry(pEntry);
//# sourceMappingURL=Rpc.js.map