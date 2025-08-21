import * as vscode from 'vscode';
import { PanelManager } from './panels/PanelManager';
import { DatabaseService } from './db/DatabaseService';
import { Entry } from '../models/Entry';

export class App {
  public static _context: vscode.ExtensionContext;

  /**
   * Point d'entrée de l'extension activé par la commande dico-cnario.ouvre'
   * 
   * @param context Le contexte de l'extension
   */
  public static async run(context: vscode.ExtensionContext){
    this._context = context; 
    PanelManager.openPanels(context);
    await this.loadAndCacheAllData();
    PanelManager.populatePanels();
  }
 
  /**
   * La mise en place de fonctions simples pour des boucles d'attente
   * incrémentiel.
   * Ça fonctionne à l'aide d'un compteur (readyCounter) qui doit at-
   * teindre une valeur après laquelle on résoud la promesse pour 
   * passer à la suite.
   */
	public static readyCounter = 0 ;
	public static okWhenReady: Function;

	private static async waitUntilReady(readyInitCounter: number) {
		return new Promise<void>((ok) => {
			this.readyCounter = readyInitCounter;
			this.okWhenReady = ok;
		});
	}
	public static incAndCheckReadyCounter(){
		-- this.readyCounter;
    if (this.readyCounter <= 0) { this.okWhenReady(); }
	}
	
  private static async loadAndCacheAllData() {
    const { EntryDb }   = require('../db/EntryDb');
    const { OeuvreDb }  = require('../db/OeuvreDb');
    const { ExempleDb } = require('../db/EntryDb');
    Promise.all([
      this.loadAndCacheDataFor(EntryDb, Entry.sortFonction.bind(Entry))
    ]);
    await this.waitUntilReady(3);
		console.info("[EXTENSION] Fin de mise en cache de toutes les données");
 
  }

  private static async loadAndCacheDataFor(Db:any, sortFn: Function): Promise<boolean> {
    const context = this._context ;
    const isTest = process.env.NODE_ENV === 'test' || context.extensionMode === vscode.ExtensionMode.Test;
    const dbService = DatabaseService.getInstance(context, isTest);
    dbService.initialize();
    const db = new Db(dbService);
    const rawItems = await db.getAll();
    const sortedItems = rawItems.sort(sortFn.bind(this));
    // TODO Mettre les données en cache
    console.warn("Apprendre à mettre les données suivantes en cache", sortedItems);
    this.incAndCheckReadyCounter();
    return true ;
  }
}