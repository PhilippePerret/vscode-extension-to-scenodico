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
exports.PanelManager = void 0;
const vscode = __importStar(require("vscode"));
const DatabaseService_1 = require("./DatabaseService");
const Entry_1 = require("../models/Entry");
const Oeuvre_1 = require("../models/Oeuvre");
const Exemple_1 = require("../models/Exemple");
// Wrapper réel pour un panneau webview avec système de messages
class WebviewPanelWrapper {
    webviewPanel;
    constructor(webviewPanel) {
        this.webviewPanel = webviewPanel;
    }
    async getElement(selector) {
        // Use original protocol for backward compatibility
        return new Promise((resolve) => {
            // Écouter la réponse
            const disposable = this.webviewPanel.webview.onDidReceiveMessage((message) => {
                if (message.command === 'domQueryResult' && message.selector === selector) {
                    disposable.dispose();
                    resolve(message.element);
                }
            });
            // Envoyer la requête
            this.webviewPanel.webview.postMessage({
                command: 'queryDOM',
                selector: selector
            });
            // Timeout au bout de 1 seconde
            setTimeout(() => {
                disposable.dispose();
                resolve(null);
            }, 1000);
        });
    }
    async getElements(selector) {
        return this.sendQuery('queryDOMAll', { selector });
    }
    async getVisibleElements(selector) {
        return this.sendQuery('queryDOMVisible', { selector });
    }
    async typeInElement(selector, text) {
        return this.sendQuery('typeInElement', { selector, text });
    }
    async clearAndTypeInElement(selector, text) {
        return this.sendQuery('clearAndTypeInElement', { selector, text });
    }
    async clearElement(selector) {
        return this.sendQuery('clearElement', { selector });
    }
    async getElementFromParent(parent, selector) {
        return this.sendQuery('getElementFromParent', { parentId: parent.id, selector });
    }
    async executeScript(script) {
        return this.sendQuery('executeScript', { script });
    }
    async sendQuery(command, params) {
        return new Promise((resolve) => {
            // Écouter la réponse
            const disposable = this.webviewPanel.webview.onDidReceiveMessage((message) => {
                if (message.command === command + 'Result' &&
                    JSON.stringify(message.params) === JSON.stringify(params)) {
                    disposable.dispose();
                    resolve(message.result);
                }
            });
            // Envoyer la requête
            this.webviewPanel.webview.postMessage({
                command,
                params
            });
            // Timeout au bout de 2 secondes
            setTimeout(() => {
                disposable.dispose();
                resolve(null);
            }, 2000);
        });
    }
}
class PanelManager {
    static activePanels = [];
    // Common footer HTML for all items
    static COMMON_ITEM_FOOTER = `
  <div class="item-footer hidden">
    <button class="btn-edit"><i class="codicon codicon-edit"></i></button>
    <button class="btn-new-exemple"><i class="codicon codicon-add"></i> Ex.</button>
    <button class="btn-remove"><i class="codicon codicon-trash"></i></button>
    <button class="btn-move"><i class="codicon codicon-move"></i></button>
  </div>`;
    static getActivePanels() {
        return this.activePanels;
    }
    static closeAllPanels() {
        this.activePanels.forEach(panel => {
            panel.dispose();
        });
        this.activePanels = [];
    }
    static getPanel(title) {
        // Trouve le vrai panneau par son titre
        const panel = this.activePanels.find(p => p.title === title);
        if (!panel) {
            return null;
        }
        return new WebviewPanelWrapper(panel);
    }
    static async openPanels(context) {
        // Fermer les panneaux existants d'abord
        this.closeAllPanels();
        // Créer 3 panneaux webview et les tracker
        const dictionnaire = vscode.window.createWebviewPanel('dictionnaire', 'Dictionnaire', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            enableFindWidget: true,
            enableCommandUris: true,
            localResourceRoots: [vscode.Uri.file(context.extensionPath)]
        });
        const oeuvres = vscode.window.createWebviewPanel('oeuvres', 'Oeuvres', vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true,
            enableFindWidget: true,
            enableCommandUris: true,
            localResourceRoots: [vscode.Uri.file(context.extensionPath)]
        });
        const exemples = vscode.window.createWebviewPanel('exemples', 'Exemples', vscode.ViewColumn.Three, {
            enableScripts: true,
            retainContextWhenHidden: true,
            enableFindWidget: true,
            enableCommandUris: true,
            localResourceRoots: [vscode.Uri.file(context.extensionPath)]
        });
        // Injecter le HTML dans les panneaux
        dictionnaire.webview.html = this.getPanelHtml(context, dictionnaire.webview, Entry_1.Entry, 'Dictionnaire');
        oeuvres.webview.html = this.getPanelHtml(context, oeuvres.webview, Oeuvre_1.Oeuvre, 'Oeuvres');
        exemples.webview.html = this.getPanelHtml(context, exemples.webview, Exemple_1.Exemple, 'Exemples');
        this.activePanels = [dictionnaire, oeuvres, exemples];
        // Après avoir créé les panneaux (vierge, avec les éléments
        // minimums), on charge les données.
        // Mais dans un premier temps, on fabrique les données cache
        // (qui sont des données optimisées)
        this.cacheData(context, dictionnaire.webview, Entry_1.Entry);
        this.cacheData(context, oeuvres.webview, Oeuvre_1.Oeuvre);
        this.cacheData(context, exemples.webview, Exemple_1.Exemple);
        // On attend que les trois panneaux aient chargé leur données
        await this.cachedDataLoadedInPanels();
        console.info("[EXTENSION] Fin de mise en cache des données");
        // Peuplement des panneaux
        this.populatePanel(context, dictionnaire.webview, Entry_1.Entry);
        this.populatePanel(context, oeuvres.webview, Oeuvre_1.Oeuvre);
        this.populatePanel(context, exemples.webview, Exemple_1.Exemple);
        // TODO Placer une attente pour savoir si les panneaux se sont bien peuplés.
    }
    static async cachedDataLoadedInPanels() {
        return new Promise((ok) => {
            let readyCount = 0;
            this.activePanels.forEach((panel) => {
                const webview = panel.webview;
                webview.onDidReceiveMessage((message) => {
                    if (message.command === 'data-cached') {
                        if (++readyCount >= 3) {
                            ok();
                        }
                    }
                });
            });
        });
    }
    /**
     * Generic method to generate HTML for any panel using Model classes
     */
    static getPanelHtml(context, webview, ModelClass, title) {
        const fs = require('fs');
        const path = require('path');
        const panelId = ModelClass.panelId;
        // Load display template using uniform convention: {panelId}/display.html
        const displayTemplatePath = path.join(context.extensionPath, 'media', panelId, 'display.html');
        const displayTemplate = fs.readFileSync(displayTemplatePath, 'utf8');
        const templatesHtml = `<template id="item-template">${displayTemplate}</template>`;
        // Note: Scripts are now handled by TypeScript modules loaded via main.js
        const loadingMessages = {
            'entries': 'Chargement des entrées...',
            'oeuvres': 'Chargement des œuvres...',
            'exemples': 'Chargement des exemples...'
        };
        const toolsMessages = {
            'entries': '*Outils du dictionnaire*',
            'oeuvres': '*Outils des œuvres*',
            'exemples': '*Outils des exemples*'
        };
        const formMessages = {
            'entries': '<p>Formulaire d\'édition d\'entrée à implémenter</p>',
            'oeuvres': '<p>Formulaire d\'édition d\'œuvre à implémenter</p>',
            'exemples': '<p>Formulaire d\'édition d\'exemple à implémenter</p>'
        };
        return this.generatePanelHtml(context, webview, {
            panelId: panelId,
            title: title,
            tipsText: 'f: rechercher, j/k: naviguer, n: nouveau, Enter: éditer',
            mainContent: `<div class="loading">${loadingMessages[panelId]}</div>`,
            editFormContent: formMessages[panelId],
            toolsContent: toolsMessages[panelId],
            templates: templatesHtml,
            // specificScripts plus nécessaire avec les modules TypeScript
        });
    }
    /**
     * Fonction générique pour construire le cache de chaque élément
     */
    static _sortedItemsPerElement; // 'any' pour ne pas m'embêter 
    static async cacheData(context, webview, ModelClass) {
        try {
            const isTest = process.env.NODE_ENV === 'test' || context.extensionMode === vscode.ExtensionMode.Test;
            const dbService = DatabaseService_1.DatabaseService.getInstance(context, isTest);
            await dbService.initialize();
            let db;
            let sortedItems;
            switch (ModelClass.panelId) {
                case 'entries':
                    const { EntryDb } = require('../db/EntryDb');
                    db = new EntryDb(dbService);
                    const rawEntries = await db.getAll();
                    sortedItems = rawEntries.sort(Entry_1.Entry.sortFunction);
                    break;
                case 'oeuvres':
                    const { OeuvreDb } = require('../db/OeuvreDb');
                    db = new OeuvreDb(dbService);
                    const rawOeuvres = await db.getAll();
                    sortedItems = rawOeuvres.sort(Oeuvre_1.Oeuvre.sortFunction);
                    break;
                case 'exemples':
                    const { ExempleDb } = require('../db/ExempleDb');
                    db = new ExempleDb(dbService);
                    const rawExemples = await db.getAll();
                    sortedItems = rawExemples.sort(Exemple_1.Exemple.sortFunction);
                    break;
                default:
                    throw new Error(`Unknown panelId: ${ModelClass.panelId}`);
            }
            // Send to webview
            const message = {
                command: 'cacheData',
                panelId: ModelClass.panelId,
                items: sortedItems
            };
            console.log(`[EXTENSION] Sending ${sortedItems.length} ${ModelClass.panelId} to webview to cache them.`);
            webview.postMessage(message);
        }
        catch (error) {
            console.warn("Impossible de mettre en cache la donnée : ", error);
        }
    }
    /**
     * Generic method to load data for any panel using BaseModel classes
     */
    static async populatePanel(context, webview, ModelClass) {
        try {
            const isTest = process.env.NODE_ENV === 'test' || context.extensionMode === vscode.ExtensionMode.Test;
            const dbService = DatabaseService_1.DatabaseService.getInstance(context, isTest);
            await dbService.initialize();
            // Send to webview
            const message = {
                command: 'populate',
                panelId: ModelClass.panelId
            };
            console.log(`[EXTENSION] Envoi de la demande de populate du panneau ${ModelClass.panelId}.`);
            webview.postMessage(message);
        }
        catch (error) {
            console.error(`Error loading data for ${ModelClass.name}:`, error);
            webview.postMessage({
                command: 'updateContent',
                target: '#items',
                content: '<div class="error">Erreur lors du chargement des données</div>'
            });
        }
    }
    static generatePanelHtml(context, webview, options) {
        const fs = require('fs');
        const path = require('path');
        // Lire le template
        const templatePath = path.join(context.extensionPath, 'media', 'panel-template.html');
        let html = fs.readFileSync(templatePath, 'utf8');
        // Générer les URIs pour les ressources
        const commonCssPath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'common.css'));
        const codiconCssPath = vscode.Uri.joinPath(context.extensionUri, 'node_modules', '@vscode', 'codicons', 'dist', 'codicon.css');
        // URI pour le bundle JS du panneau
        const mainJsPath = vscode.Uri.file(path.join(context.extensionPath, 'media', `${options.panelId || 'entries'}-bundle.js`));
        // Utiliser les URIs webview correctes
        const commonCssUri = webview.asWebviewUri(commonCssPath).toString();
        const mainJsUri = webview.asWebviewUri(mainJsPath).toString();
        const codiconCssUri = webview.asWebviewUri(codiconCssPath).toString();
        // CSS spécifique au panneau si panelId est fourni - utilise la convention item.css
        let specificCssLink = '';
        if (options.panelId) {
            const specificCssPath = path.join(context.extensionPath, 'media', options.panelId, 'item.css');
            if (fs.existsSync(specificCssPath)) {
                const specificCssUri = webview.asWebviewUri(vscode.Uri.file(specificCssPath)).toString();
                specificCssLink = `<link rel="stylesheet" href="${specificCssUri}">`;
            }
        }
        // Ajouter l'ID au body
        const bodyId = options.panelId ? `id="panel-${options.panelId}"` : '';
        html = html.replace('<body>', `<body ${bodyId}>`);
        // Remplacements
        html = html.replace(/{{PANEL_TITLE}}/g, options.title);
        html = html.replace(/{{COMMON_CSS_URI}}/g, commonCssUri);
        html = html.replace(/{{CODICON_CSS_URI}}/g, codiconCssUri);
        html = html.replace(/{{MAIN_JS_URI}}/g, mainJsUri);
        html = html.replace(/{{TIPS_TEXT}}/g, options.tipsText);
        html = html.replace(/{{MAIN_CONTENT}}/g, options.mainContent);
        html = html.replace(/{{EDIT_FORM_CONTENT}}/g, options.editFormContent);
        html = html.replace(/{{TOOLS_CONTENT}}/g, options.toolsContent);
        html = html.replace(/{{SPECIFIC_STYLES}}/g, specificCssLink + (options.specificStyles || ''));
        html = html.replace(/{{SPECIFIC_SCRIPTS}}/g, options.specificScripts || '');
        html = html.replace(/{{TEMPLATES}}/g, options.templates || '');
        html = html.replace(/{{ITEM_FOOTER}}/g, this.COMMON_ITEM_FOOTER);
        return html;
    }
}
exports.PanelManager = PanelManager;
//# sourceMappingURL=PanelManager.js.map