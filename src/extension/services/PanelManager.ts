import * as vscode from 'vscode';
import { DatabaseService } from './DatabaseService';
import { Entry } from '../models/Entry';
import { Oeuvre } from '../models/Oeuvre';
import { Exemple } from '../models/Exemple';

// Interface pour wrapper un panneau webview
interface PanelWrapper {
	getElement(selector: string): Promise<any>;
	getElements(selector: string): Promise<any[]>;
	getVisibleElements(selector: string): Promise<any[]>;
	typeInElement(selector: string, text: string): Promise<void>;
	clearAndTypeInElement(selector: string, text: string): Promise<void>;
	clearElement(selector: string): Promise<void>;
	getElementFromParent(parent: any, selector: string): Promise<any>;
	executeScript(script: string): Promise<any>;
}

// Wrapper réel pour un panneau webview avec système de messages
class WebviewPanelWrapper implements PanelWrapper {
	constructor(private webviewPanel: vscode.WebviewPanel) { }

	async getElement(selector: string): Promise<any> {
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

	async getElements(selector: string): Promise<any[]> {
		return this.sendQuery('queryDOMAll', { selector });
	}

	async getVisibleElements(selector: string): Promise<any[]> {
		return this.sendQuery('queryDOMVisible', { selector });
	}

	async typeInElement(selector: string, text: string): Promise<void> {
		return this.sendQuery('typeInElement', { selector, text });
	}

	async clearAndTypeInElement(selector: string, text: string): Promise<void> {
		return this.sendQuery('clearAndTypeInElement', { selector, text });
	}

	async clearElement(selector: string): Promise<void> {
		return this.sendQuery('clearElement', { selector });
	}

	async getElementFromParent(parent: any, selector: string): Promise<any> {
		return this.sendQuery('getElementFromParent', { parentId: parent.id, selector });
	}

	async executeScript(script: string): Promise<any> {
		return this.sendQuery('executeScript', { script });
	}

	private async sendQuery(command: string, params: any): Promise<any> {
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

export class PanelManager {
	private static activePanels: vscode.WebviewPanel[] = [];

	// Common footer HTML for all items
	private static readonly COMMON_ITEM_FOOTER = `
  <div class="item-footer hidden">
    <button class="btn-edit"><i class="codicon codicon-edit"></i></button>
    <button class="btn-new-exemple"><i class="codicon codicon-add"></i> Ex.</button>
    <button class="btn-remove"><i class="codicon codicon-trash"></i></button>
    <button class="btn-move"><i class="codicon codicon-move"></i></button>
  </div>`;

	static getActivePanels(): vscode.WebviewPanel[] {
		return this.activePanels;
	}

	static closeAllPanels(): void {
		this.activePanels.forEach(panel => {
			panel.dispose();
		});
		this.activePanels = [];
	}

	static getPanel(title: string): PanelWrapper | null {
		// Trouve le vrai panneau par son titre
		const panel = this.activePanels.find(p => p.title === title);
		if (!panel) {
			return null;
		}
		return new WebviewPanelWrapper(panel);
	}

	static async openPanels(context: vscode.ExtensionContext): Promise<void> {
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
		dictionnaire.webview.html = this.getPanelHtml(context, dictionnaire.webview, Entry, 'Dictionnaire');
		oeuvres.webview.html = this.getPanelHtml(context, oeuvres.webview, Oeuvre, 'Oeuvres');
		exemples.webview.html = this.getPanelHtml(context, exemples.webview, Exemple, 'Exemples');

		this.activePanels = [dictionnaire, oeuvres, exemples];

		// Après avoir créé les panneaux (vierge, avec les éléments
		// minimums), on charge les données.
		// Mais dans un premier temps, on fabrique les données cache
		// (qui sont des données optimisées)
		this.cacheData(context, dictionnaire.webview, Entry);
		this.cacheData(context, oeuvres.webview, Oeuvre);
		this.cacheData(context, exemples.webview, Exemple);
		// On attend que les trois panneaux aient chargé leur données
		await this.cachedDataLoadedInPanels();
		console.info("[EXTENSION] Fin de mise en cache des données");
 
		// Peuplement des panneaux
	  await Promise.all([
			this.populatePanel(context, dictionnaire.webview, Entry),
			this.populatePanel(context, oeuvres.webview, Oeuvre),
			this.populatePanel(context, exemples.webview, Exemple)
		]);
		console.info("[EXTENSION] Fin de la population des trois panneaux.");
	}

	private static async cachedDataLoadedInPanels() {
		return new Promise<void>((ok) => {
			let readyCount = 0;
			this.activePanels.forEach((panel) => {
				const webview = panel.webview;
				webview.onDidReceiveMessage((message) => {
					if (message.command === 'data-cached') { if ( ++ readyCount >= 3) { ok(); } }
				});
			});
		});
	}
	/**
	 * Generic method to generate HTML for any panel using Model classes
	 */
	private static getPanelHtml(context: vscode.ExtensionContext, webview: vscode.Webview, ModelClass: typeof Entry | typeof Oeuvre | typeof Exemple, title: string): string {
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
			mainContent: `<div class="loading">${loadingMessages[panelId as keyof typeof loadingMessages]}</div>`,
			editFormContent: formMessages[panelId as keyof typeof formMessages],
			toolsContent: toolsMessages[panelId as keyof typeof toolsMessages],
			templates: templatesHtml,
			// specificScripts plus nécessaire avec les modules TypeScript
		});
	}

	/**
	 * Fonction générique pour construire le cache de chaque élément
	 */
	private static _sortedItemsPerElement: any; // 'any' pour ne pas m'embêter 

	private static async cacheData(context: vscode.ExtensionContext, webview: vscode.Webview, ModelClass: typeof Entry | typeof Oeuvre | typeof Exemple): Promise<void> {
		try {
			const isTest = process.env.NODE_ENV === 'test' || context.extensionMode === vscode.ExtensionMode.Test;
			const dbService = DatabaseService.getInstance(context, isTest);
			await dbService.initialize();

			let db: any;
			let sortedItems: any[];

			switch (ModelClass.panelId) {
				case 'entries':
					const { EntryDb } = require('../db/EntryDb');
					db = new EntryDb(dbService);
					const rawEntries = await db.getAll();
					sortedItems = rawEntries.sort(Entry.sortFunction);
					break;
				case 'oeuvres':
					const { OeuvreDb } = require('../db/OeuvreDb');
					db = new OeuvreDb(dbService);
					const rawOeuvres = await db.getAll();
					sortedItems = rawOeuvres.sort(Oeuvre.sortFunction);
					break;
				case 'exemples':
					const { ExempleDb } = require('../db/ExempleDb');
					db = new ExempleDb(dbService);
					const rawExemples = await db.getAll();
					sortedItems = rawExemples.sort(Exemple.sortFunction);
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

		} catch (error) {
			console.warn("Impossible de mettre en cache la donnée : ", error);
		}
	}
	/**
	 * Generic method to load data for any panel using BaseModel classes
	 */
	private static async populatePanel(context: vscode.ExtensionContext, webview: vscode.Webview, ModelClass: typeof Entry | typeof Oeuvre | typeof Exemple): Promise<void> {
		try {
			const isTest = process.env.NODE_ENV === 'test' || context.extensionMode === vscode.ExtensionMode.Test;
			const dbService = DatabaseService.getInstance(context, isTest);
			await dbService.initialize();

			// Send to webview
			const message = {
				command: 'populate',
				panelId: ModelClass.panelId
			};
			webview.postMessage(message);
			console.log(`[EXTENSION] Demande de populate du panneau ${ModelClass.panelId} envoyée.`);
		} catch (error) {
			console.error(`Error loading data for ${ModelClass.name}:`, error);
			webview.postMessage({
				command: 'updateContent',
				target: '#items',
				content: '<div class="error">Erreur lors du chargement des données</div>'
			});
		}
	}


	private static generatePanelHtml(context: vscode.ExtensionContext, webview: vscode.Webview, options: {
		panelId?: string;
		title: string;
		tipsText: string;
		mainContent: string;
		editFormContent: string;
		toolsContent: string;
		specificStyles?: string;
		specificScripts?: string;
		templates?: string;
	}): string {
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
