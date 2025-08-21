import * as vscode from 'vscode';
import { Entry } from '../../models/Entry';
import { Exemple } from '../../models/Exemple';
import { Oeuvre } from '../../models/Oeuvre';
import { DatabaseService } from '../db/DatabaseService';
import { PanelManager } from './PanelManager';

/**
 * Classe d'un panneau quelconque
 */
export class PanelClass {
  private _panel: vscode.WebviewPanel ;
  protected _type:string = '';
  protected _title: string = '';
  protected _column: number = 0;
  protected _classe: typeof Entry | typeof Oeuvre | typeof Exemple = Entry ;
  protected _context: vscode.ExtensionContext ; 
  
  private get type():string { return this._type ;}
  private get title():string { return this._title ;}
  private get column():number { return this._column ;}
  private get panel():vscode.WebviewPanel { return this._panel ;}
  public get classe():typeof Entry | typeof Oeuvre | typeof Exemple { return this._classe ; }
  public get webview(){ return this.panel.webview ; }

  public constructor(data: Record<string, any>) {
    this._context = data.context ;
    this._panel = vscode.window.createWebviewPanel(
      this.type, this.title, this.column, PanelClass.commonPanelOptions
    );
  }

  // Charge toutes les données
  public async loadAndCacheAllData(): Promise<boolean> {
    const context = this._context ;
    const isTest = process.env.NODE_ENV === 'test' || context.extensionMode === vscode.ExtensionMode.Test;
    const dbService = DatabaseService.getInstance(context, isTest);
    dbService.initialize();
    const Db = this.getDB() ;
    const db = new Db(dbService);
    const rawItems = await db.getAll();
    const sortedItems = rawItems.sort(this.sortFonction.bind(this));
    PanelManager.incAndCheckReadyCounter();
    return true ; 
  }

  // La différence avec avant, c'est que là, il faut envoyer les données en cache
  // pour que la webview puisse peupler la vue
  public async populateWebview(): Promise<boolean> {
    PanelManager.incAndCheckReadyCounter(); // <== NON, IL FAUDRA QUE LA VUE LE CONFIRME
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

}