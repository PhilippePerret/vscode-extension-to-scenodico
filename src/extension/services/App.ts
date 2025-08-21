import * as vscode from 'vscode';
import { PanelManager } from './panels/PanelManager';

export class App {
  public static _context: vscode.ExtensionContext;

  /**
   * Point d'entrée de l'extension activé par la commande dico-cnario.ouvre'
   * 
   * @param context Le contexte de l'extension
   */
  public static run(context: vscode.ExtensionContext){
    this._context = context; 
    PanelManager.openPanels(context);
  }
}