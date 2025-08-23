import * as vscode from 'vscode';
import { Entry } from '../../models/Entry';
import { Exemple } from '../../models/Exemple';
import { Oeuvre } from '../../models/Oeuvre';

/**
 * Classe d'un panneau quelconque
 */
export abstract class PanelClass {
  private _panel!: vscode.WebviewPanel ;
  protected abstract modelClass: typeof Entry | typeof Oeuvre | typeof Exemple;
  protected _type: string;
  protected _title: string;
  protected _column: number = 0;
  protected _classe: typeof Entry | typeof Oeuvre | typeof Exemple = Entry ;
  protected _context: vscode.ExtensionContext ; 
  
  private get type():string { return this._type ;}
  private get title():string { return this._title ;}
  private get column():number { return this._column ;}
  private get panel():vscode.WebviewPanel { return this._panel ;}
  public get classe():typeof Entry | typeof Oeuvre | typeof Exemple { return this._classe ; }
  public get webview(){ return this.panel.webview ; }

  public constructor(
    context: vscode.ExtensionContext,
    type: string,
    title: string,
    column: number
  ) {
    this._context = context;
    this._type = type;
    this._title = title;
    this._column = column; 
    this.build();
 }

  public build(){
    this._panel = vscode.window.createWebviewPanel(
      this.type, this.title, this.column, PanelClass.commonPanelOptions
    );
    this.panel.webview.html = this.getPanelHtml();
  }

  private getPanelHtml(): string {
    const fs = require('fs');
    const path = require('path');
    const context = this._context;
    const webview = this.panel.webview;
    const panelId = this.type;
        // Load display template using uniform convention: {panelId}/display.html
    const displayTemplatePath = path.join(context.extensionPath, 'media', panelId, 'display.html');
    const displayTemplate = fs.readFileSync(displayTemplatePath, 'utf8');
    const templatesHtml = `<template id="item-template">${displayTemplate}</template>`;

    return this.generatePanelHtml({
      tipsText: 'f: rechercher, j/k: naviguer, n: nouveau, Enter: éditer'
    });
  }

  private generatePanelHtml(options: {
        tipsText: string;
        specificStyles?: string;
        specificScripts?: string;
        templates?: string;
    }): string {
    const fs = require('fs');
    const path = require('path');
    const context = this._context;
    const webview = this.panel.webview;
    const plurName = this.modelClass.names.tech.plur;
    const mainContent = `<div class="loading">Chargement des ${plurName}…</div>`;
    const toolsContent = `*Outils des ${plurName}*`;
    const editFormContent = `<p>Formulaire d'édition des ${plurName} à implémenter</p>`;

    // Lire le template
    const templatePath = path.join(context.extensionPath, 'media', 'panel-template.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Générer les URIs pour les ressources
    const commonCssPath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'common.css'));
    const codiconCssPath = vscode.Uri.joinPath(context.extensionUri, 'node_modules', '@vscode', 'codicons', 'dist', 'codicon.css');

    // URI pour le bundle JS du panneau
    const mainJsPath = vscode.Uri.file(path.join(context.extensionPath, 'media', `${this.type}-bundle.js`));

    // Utiliser les URIs webview correctes
    const commonCssUri = webview.asWebviewUri(commonCssPath).toString();
    const mainJsUri = webview.asWebviewUri(mainJsPath).toString();
    const codiconCssUri = webview.asWebviewUri(codiconCssPath).toString();
        
    // CSS spécifique au panneau si panelId est fourni - utilise la convention item.css
    let specificCssLink = '';
      const specificCssPath = path.join(context.extensionPath, 'media', this.type, 'item.css');
      if (fs.existsSync(specificCssPath)) {
        const specificCssUri = webview.asWebviewUri(vscode.Uri.file(specificCssPath)).toString();
        specificCssLink = `<link rel="stylesheet" href="${specificCssUri}">`;
      }

    // Ajouter l'ID au body
    const bodyId = this.type ? `id="panel-${this.type}"` : '';
    html = html.replace('<body>', `<body ${bodyId}>`);

    // Remplacements
    html = html.replace(/{{PANEL_TITLE}}/g, this.title);
    html = html.replace(/{{COMMON_CSS_URI}}/g, commonCssUri);
    html = html.replace(/{{CODICON_CSS_URI}}/g, codiconCssUri);
    html = html.replace(/{{MAIN_JS_URI}}/g, mainJsUri);
    html = html.replace(/{{TIPS_TEXT}}/g, options.tipsText);
    html = html.replace(/{{MAIN_CONTENT}}/g, mainContent);
    html = html.replace(/{{EDIT_FORM_CONTENT}}/g, editFormContent);
    html = html.replace(/{{TOOLS_CONTENT}}/g, toolsContent);
    html = html.replace(/{{SPECIFIC_STYLES}}/g, specificCssLink + (options.specificStyles || ''));
    html = html.replace(/{{SPECIFIC_SCRIPTS}}/g, options.specificScripts || '');
    html = html.replace(/{{TEMPLATES}}/g, options.templates || '');
    html = html.replace(/{{ITEM_FOOTER}}/g, PanelClass.COMMON_ITEM_FOOTER);

    return html;
  }

  // La différence avec avant, c'est que là, il faut envoyer les données en cache
  // pour que la webview puisse peupler la vue
  public async populateWebview(): Promise<boolean> {
    console.warn("Il faut apprendre à peupler le webview/panneau");
    return true ;
  }

  // Fonction qui doit être surclassée par les héritières
  protected sortFonction(){ }
  // Fonction qui doit être surclassée par les héritières
  protected getDB(): any { }
 
 // Les options communes pour construire tous les panneaux
  public static get commonPanelOptions(): Record<string, any> { return this._commonPanelOptions ; }
  private static _commonPanelOptions: Record<string, any>;
  public static defineCommonPanelOptions(context: vscode.ExtensionContext) {
    this._commonPanelOptions = {
      enableScripts: true,
      retainContextWhenHidden: true,
      enableFindWidget: true,
      enableCommandUris: true,
      localResourceRoots: [vscode.Uri.file(context.extensionPath)]
    };
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