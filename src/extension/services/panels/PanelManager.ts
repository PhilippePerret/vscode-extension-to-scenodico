import * as vscode from 'vscode';
import { PanelClass } from './panelClass' ;
import { PanelClassDico } from './panelClassDico';
import { PanelClassOeuvre } from './panelClassOeuvre';
import { PanelClassExemple } from './panelClassExemple';
import { Entry } from '../../models/Entry';
import { Exemple } from '../../models/Exemple';
import { Oeuvre } from '../../models/Oeuvre';
import { DatabaseService } from '../db/DatabaseService';
import { PanelWrapper, WebviewPanelWrapper } from '../InterComs';

export class PanelManager {
	private static activePanels: vscode.WebviewPanel[] = [];

	// Retourne les trois panneaux (Dictionnaire, Oeuvres et Exemples)
	static getActivePanels(): vscode.WebviewPanel[] {
		return this.activePanels;
	}

	// Pour fermer les trois panneaux (je crois que c'est seulement
	// utile pour les tests)
	static closeAllPanels(): void {
		this.activePanels.forEach(panel => { panel.dispose(); });
		this.activePanels = [];
	}

	// Retourne le panneau par son titre
	static getPanel(title: string): PanelWrapper | null {
		// Trouve le vrai panneau par son titre
		const panel = this.activePanels.find(p => p.title === title);
		if (!panel) { return null; }
		return new WebviewPanelWrapper(panel);
	}

	// Pour ouvrir les trois panneaux
	static async openPanels(context: vscode.ExtensionContext): Promise<void> {
		// Fermer les panneaux existants d'abord
		this.closeAllPanels();
		
		// On définit les options communes pour la construction des
		// panneaux
		PanelClass.defineCommonPanelOptions(context) ; 
		
		const panelDico = new PanelClassDico({ context: context});
		const panelOeuvres = new PanelClassOeuvre({ context: context });
		const panelExemples = new PanelClassExemple({context: context });
		
		const panels = [panelDico, panelOeuvres, panelExemples];
	
		// Après avoir créé les panneaux (vierge, avec les éléments
		// minimums), on charge les données.
		// Note : les données sont mises en cache côté extension pour
		// pouvoir les "dispatcher" aux trois panneaux
		panels.forEach(panel => { panel.loadAndCacheAllData(); });
		await this.waitUntilReady();
		console.info("[EXTENSION] Fin de mise en cache des données");
 
		// Peuplement des panneaux
		panels.forEach(panel => { panel.populateWebview(); });
		await this.waitUntilReady();
		console.info("[EXTENSION] Fin de peuplement des panneau.");
	}

	public static readyCounter = 0 ;
	public static okWhenReady: Function;

	private static async waitUntilReady() {
		return new Promise<void>((ok) => {
			this.readyCounter = 0;
			this.okWhenReady = ok;
		});
	}
	public static incAndCheckReadyCounter(){
		this.readyCounter ++;
			if ( this.readyCounter >= 3 ) {
			this.okWhenReady();
		}
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
			console.log(`[EXTENSION] Envoi de la demande de populate du panneau ${ModelClass.panelId}.`);
			webview.postMessage(message);
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

	// Common footer HTML for all items
	private static readonly COMMON_ITEM_FOOTER = `
  <div class="item-footer hidden">
    <button class="btn-edit"><i class="codicon codicon-edit"></i></button>
    <button class="btn-new-exemple"><i class="codicon codicon-add"></i> Ex.</button>
    <button class="btn-remove"><i class="codicon codicon-trash"></i></button>
    <button class="btn-move"><i class="codicon codicon-move"></i></button>
  </div>`;
}
