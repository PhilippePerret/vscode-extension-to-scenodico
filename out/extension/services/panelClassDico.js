"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelClassDico = void 0;
const Entry_1 = require("../models/Entry");
const panelClass_1 = require("./panelClass");
class PanelClassDico extends panelClass_1.PanelClass {
    _type = 'dictionnaire';
    _title = 'Dictionnaire';
    _classe = Entry_1.Entry;
    _column = 1;
    static sortFonction(a, b) {
        return a.entree.localeCompare(b.entree, 'fr', {
            sensitivity: 'base',
            numeric: true,
            caseFirst: 'lower'
        });
    }
    getDB() {
        const { EntryDb } = require('../db/EntryDb');
        return EntryDb;
    }
}
exports.PanelClassDico = PanelClassDico;
//# sourceMappingURL=panelClassDico.js.map