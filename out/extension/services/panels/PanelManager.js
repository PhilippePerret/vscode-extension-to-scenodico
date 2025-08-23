"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelManager = void 0;
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
}
exports.PanelManager = PanelManager;
//# sourceMappingURL=PanelManager.js.map