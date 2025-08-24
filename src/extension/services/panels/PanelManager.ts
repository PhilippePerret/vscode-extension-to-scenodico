import * as vscode from 'vscode';
import { Entry } from '../../models/Entry';
import { Exemple } from '../../models/Exemple';
import { Oeuvre } from '../../models/Oeuvre';
import { PanelWrapper, WebviewPanelWrapper } from '../InterComs-tests';
import { PanelClass } from './panelClass';
import { PanelClassEntry } from './panelClassEntry'; 
import { PanelClassOeuvre } from './panelClassOeuvre';
import { UEntry } from '../../../bothside/UEntry';
import { PanelClassExemple } from './panelClassExemple';
import { UOeuvre } from '../../../bothside/UOeuvre';
import { UExemple } from '../../../bothside/UExemple';
import { App } from '../App';
import { CanalEntry, CanalExemple, CanalOeuvre } from '../Rpc';

export class PanelManager {
	private static _panels: PanelClass[] = [];
	private static activePanels: vscode.WebviewPanel[] = [];

	/**
	 * Appelé à l'ouverture normale de l'application.
	 * @param context Les contexte de l'extension
	 */
	static async openPanels(c: vscode.ExtensionContext): Promise<void> {
		// Fermer les panneaux existants d'abord
		this.closeAllPanels();
		
		// On définit les options communes pour la construction des
		// panneaux
		PanelClass.defineCommonPanelOptions(c) ; 
		
		this._panels.push(new PanelClassEntry(c, UEntry.names.tech.plur, UEntry.names.tit.plur, 1 ));
		this._panels.push(new PanelClassOeuvre(c, UOeuvre.names.tech.plur, UOeuvre.names.tit.plur, 2));
		this._panels.push(new PanelClassExemple(c, UExemple.names.tech.plur, UExemple.names.tit.plur, 3));
		
		console.log("Fin de l'ouverture des panneaux.");
	}
	/**
	 * Appelée après la fabrication des panneaux pour ouvrir les canaux Rpc
	 */
	public static openRpcChanels(): void {
		CanalEntry.initialize(this._panels[0].panel);
		CanalOeuvre.initialize(this._panels[1].panel);
		CanalExemple.initialize(this._panels[2].panel);
	}
	/**
	 * Appelée après la mise en cache des données pour peupler les panneaux.
	 */
	public static async populatePanels(): Promise<void> {
		console.log("[EXTENSION] Je dois apprendre à repeupler les panneaux");
		App.resetReadyCounter(3);
		this._panels.forEach((panel: PanelClass) => { 
			console.log("Panneau à peupler : %s", panel.title); // OK ici, c'est le bon panneau
			panel.populate(); 
		});
		App.waitUntilReady();
		console.info("[EXTENSION] Fin de peuplement des panneaux.");
	}

	// Retourne les trois panneaux (Dictionnaire, Oeuvres et Exemples)
	static getActivePanels(): vscode.WebviewPanel[] {
		return this.activePanels;
	}
	static addActivePanel(panel: vscode.WebviewPanel){
		this.activePanels.push(panel);
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
}
