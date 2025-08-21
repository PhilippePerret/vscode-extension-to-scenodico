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
exports.App = void 0;
const vscode = __importStar(require("vscode"));
const PanelManager_1 = require("./panels/PanelManager");
const DatabaseService_1 = require("./db/DatabaseService");
const Entry_1 = require("../models/Entry");
class App {
    static _context;
    /**
     * Point d'entrée de l'extension activé par la commande dico-cnario.ouvre'
     *
     * @param context Le contexte de l'extension
     */
    static async run(context) {
        this._context = context;
        PanelManager_1.PanelManager.openPanels(context);
        await this.loadAndCacheAllData();
        PanelManager_1.PanelManager.populatePanels();
    }
    /**
     * La mise en place de fonctions simples pour des boucles d'attente
     * incrémentiel.
     * Ça fonctionne à l'aide d'un compteur (readyCounter) qui doit at-
     * teindre une valeur après laquelle on résoud la promesse pour
     * passer à la suite.
     */
    static readyCounter = 0;
    static okWhenReady;
    static async waitUntilReady(readyInitCounter) {
        return new Promise((ok) => {
            this.readyCounter = readyInitCounter;
            this.okWhenReady = ok;
        });
    }
    static incAndCheckReadyCounter() {
        --this.readyCounter;
        if (this.readyCounter <= 0) {
            this.okWhenReady();
        }
    }
    static async loadAndCacheAllData() {
        const { EntryDb } = require('../db/EntryDb');
        const { OeuvreDb } = require('../db/OeuvreDb');
        const { ExempleDb } = require('../db/EntryDb');
        Promise.all([
            this.loadAndCacheDataFor(EntryDb, Entry_1.Entry.sortFonction.bind(Entry_1.Entry))
        ]);
        await this.waitUntilReady(3);
        console.info("[EXTENSION] Fin de mise en cache de toutes les données");
    }
    static async loadAndCacheDataFor(Db, sortFn) {
        const context = this._context;
        const isTest = process.env.NODE_ENV === 'test' || context.extensionMode === vscode.ExtensionMode.Test;
        const dbService = DatabaseService_1.DatabaseService.getInstance(context, isTest);
        dbService.initialize();
        const db = new Db(dbService);
        const rawItems = await db.getAll();
        const sortedItems = rawItems.sort(sortFn.bind(this));
        // TODO Mettre les données en cache
        console.warn("Apprendre à mettre les données suivantes en cache", sortedItems);
        this.incAndCheckReadyCounter();
        return true;
    }
}
exports.App = App;
//# sourceMappingURL=App.js.map