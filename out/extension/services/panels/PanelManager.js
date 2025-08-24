"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelManager = void 0;
const InterComs_tests_1 = require("../InterComs-tests");
const panelClass_1 = require("./panelClass");
const panelClassEntry_1 = require("./panelClassEntry");
const panelClassOeuvre_1 = require("./panelClassOeuvre");
const UEntry_1 = require("../../../bothside/UEntry");
const panelClassExemple_1 = require("./panelClassExemple");
const UOeuvre_1 = require("../../../bothside/UOeuvre");
const UExemple_1 = require("../../../bothside/UExemple");
const App_1 = require("../App");
const Rpc_1 = require("../Rpc");
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
        this._panels.push(new panelClassEntry_1.PanelClassEntry(c, UEntry_1.UEntry.names.tech.plur, UEntry_1.UEntry.names.tit.plur, 1));
        this._panels.push(new panelClassOeuvre_1.PanelClassOeuvre(c, UOeuvre_1.UOeuvre.names.tech.plur, UOeuvre_1.UOeuvre.names.tit.plur, 2));
        this._panels.push(new panelClassExemple_1.PanelClassExemple(c, UExemple_1.UExemple.names.tech.plur, UExemple_1.UExemple.names.tit.plur, 3));
        console.log("Fin de l'ouverture des panneaux.");
    }
    /**
     * Appelée après la fabrication des panneaux pour ouvrir les canaux Rpc
     */
    static openRpcChanels() {
        Rpc_1.CanalEntry.initialize(this._panels[0].panel);
    }
    /**
     * Appelée après la mise en cache des données pour peupler les panneaux.
     */
    static async populatePanels() {
        console.log("[EXTENSION] Je dois apprendre à repeupler les panneaux");
        App_1.App.resetReadyCounter(3);
        this._panels.forEach(panel => { panel.populate(); });
        App_1.App.waitUntilReady();
        console.info("[EXTENSION] Fin de peuplement des panneaux.");
    }
    // Retourne les trois panneaux (Dictionnaire, Oeuvres et Exemples)
    static getActivePanels() {
        return this.activePanels;
    }
    static addActivePanel(panel) {
        console.log("Ajout du panneau", panel);
        this.activePanels.push(panel);
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
        return new InterComs_tests_1.WebviewPanelWrapper(panel);
    }
}
exports.PanelManager = PanelManager;
//# sourceMappingURL=PanelManager.js.map