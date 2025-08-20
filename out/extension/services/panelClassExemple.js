"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelClassExemple = void 0;
const panelClass_1 = require("./panelClass");
const Exemple_1 = require("../models/Exemple");
class PanelClassExemple extends panelClass_1.PanelClass {
    _type = 'exemple';
    _title = 'Exemple';
    _classe = Exemple_1.Exemple;
    _column = 3;
    static sortFonction(a, b) {
        // First sort by oeuvre ID (oeuvre_id)
        const oeuvreComparison = a.oeuvre_id.localeCompare(b.oeuvre_id);
        if (oeuvreComparison !== 0) {
            return oeuvreComparison;
        }
        // Then sort by indice
        return a.indice - b.indice;
    }
    getDB() {
        const { ExempleDb } = require('../db/ExempleDb');
        return ExempleDb;
    }
}
exports.PanelClassExemple = PanelClassExemple;
//# sourceMappingURL=panelClassExemple.js.map