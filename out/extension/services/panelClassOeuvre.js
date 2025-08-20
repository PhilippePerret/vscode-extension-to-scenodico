"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelClassOeuvre = void 0;
const panelClass_1 = require("./panelClass");
const Oeuvre_1 = require("../models/Oeuvre");
class PanelClassOeuvre extends panelClass_1.PanelClass {
    _type = 'oeuvre';
    _title = 'Œuvre';
    _classe = Oeuvre_1.Oeuvre;
    _column = 2;
    static sortFonction(a, b) {
        const titleA = a.titre_original || a.titre_affiche;
        const titleB = b.titre_original || b.titre_affiche;
        return titleA.localeCompare(titleB, 'fr', {
            sensitivity: 'base',
            numeric: true,
            caseFirst: 'lower'
        });
    }
    getDB() {
        const { OeuvreDb } = require('../db/OeuvreDb');
        return OeuvreDb;
    }
}
exports.PanelClassOeuvre = PanelClassOeuvre;
//# sourceMappingURL=panelClassOeuvre.js.map