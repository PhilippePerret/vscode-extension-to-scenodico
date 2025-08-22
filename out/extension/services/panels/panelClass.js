"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelClass = void 0;
const vscode = __importStar(require("vscode"));
const Entry_1 = require("../../models/Entry");
/**
 * Classe d'un panneau quelconque
 */
class PanelClass {
    _panel;
    _type;
    _title;
    _column = 0;
    _classe = Entry_1.Entry;
    _context;
    get type() { return this._type; }
    get title() { return this._title; }
    get column() { return this._column; }
    get panel() { return this._panel; }
    get classe() { return this._classe; }
    get webview() { return this.panel.webview; }
    constructor(context, type, title, column) {
        this._context = context;
        this._type = type;
        this._title = title;
        this._column = column;
        this._panel = vscode.window.createWebviewPanel(this.type, this.title, this.column, PanelClass.commonPanelOptions);
    }
    // La différence avec avant, c'est que là, il faut envoyer les données en cache
    // pour que la webview puisse peupler la vue
    async populateWebview() {
        console.warn("Il faut apprendre à peupler le webview/panneau");
        return true;
    }
    // Fonction qui doit être surclassée par les héritières
    sortFonction() { }
    // Fonction qui doit être surclassée par les héritières
    getDB() { }
    // Les options communes pour construire tous les panneaux
    static get commonPanelOptions() { return this._commonPanelOptions; }
    static _commonPanelOptions;
    static defineCommonPanelOptions(context) {
        this._commonPanelOptions = {
            enableScripts: true,
            retainContextWhenHidden: true,
            enableFindWidget: true,
            enableCommandUris: true,
            localResourceRoots: [vscode.Uri.file(context.extensionPath)]
        };
    }
}
exports.PanelClass = PanelClass;
//# sourceMappingURL=panelClass.js.map