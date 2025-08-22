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
const InterComs_1 = require("../InterComs");
const panelClass_1 = require("./panelClass");
const panelClassDico_1 = require("./panelClassDico");
const panelClassOeuvre_1 = require("./panelClassOeuvre");
const UEntry_1 = require("../../../bothside/UEntry");
const panelClassExemple_1 = require("./panelClassExemple");
const UOeuvre_1 = require("../../../bothside/UOeuvre");
const UExemple_1 = require("../../../bothside/UExemple");
class PanelManager {
    static _panels = [];
    static activePanels = [];
    /**
     * Appelé à l'ouverture normale de l'application.
     * @param context Les contexte de l'extension
     */
    static async openPanels(c) {
        // Fermer les panneaux existants d'abord
        this.closeAllPanels();
        // On définit les options communes pour la construction des
        // panneaux
        panelClass_1.PanelClass.defineCommonPanelOptions(c);
        this._panels.push(new panelClassDico_1.PanelClassDico(c, UEntry_1.UEntry.names.tech.plur, UEntry_1.UEntry.names.tit.plur, 1));
        this._panels.push(new panelClassOeuvre_1.PanelClassOeuvre(c, UOeuvre_1.UOeuvre.names.tech.plur, UOeuvre_1.UOeuvre.names.tit.plur, 2));
        this._panels.push(new panelClassExemple_1.PanelClassExemple(c, UExemple_1.UExemple.names.tech.plur, UExemple_1.UExemple.names.tit.plur, 3));
        console.log("Fin de l'ouverture des panneaux.");
    }
    /**
     * Appelée après la mise en cache des données pour peupler les panneaux.
     */
    static populatePanels() {
        console.log("[EXTENSION] Je dois apprendre à repeupler les panneaux");
        this._panels.forEach(panel => {
            // TODO Appeler le peuplement de chaque panneau (la fonction existe déjà mais il faut maintenant lui envoyer les données)
        });
        console.info("[EXTENSION] Fin de peuplement des panneaux.");
    }
    // Retourne les trois panneaux (Dictionnaire, Oeuvres et Exemples)
    static getActivePanels() {
        return this.activePanels;
    }
    // Pour fermer les trois panneaux (je crois que c'est seulement
    // utile pour les tests)
    static closeAllPanels() {
        this.activePanels.forEach(panel => { panel.dispose(); });
        this.activePanels = [];
    }
    // Retourne le panneau par son titre
    static getPanel(title) {
        // Trouve le vrai panneau par son titre
        const panel = this.activePanels.find(p => p.title === title);
        if (!panel) {
            return null;
        }
        return new InterComs_1.WebviewPanelWrapper(panel);
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
         * Generic method to load data for any panel using BaseModel classes
         */
    static async populatePanel(context, webview, ModelClass) {
        try {
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
    // Common footer HTML for all items
    static COMMON_ITEM_FOOTER = `
  <div class="item-footer hidden">
    <button class="btn-edit"><i class="codicon codicon-edit"></i></button>
    <button class="btn-new-exemple"><i class="codicon codicon-add"></i> Ex.</button>
    <button class="btn-remove"><i class="codicon codicon-trash"></i></button>
    <button class="btn-move"><i class="codicon codicon-move"></i></button>
  </div>`;
}
exports.PanelManager = PanelManager;
//# sourceMappingURL=PanelManager.js.map