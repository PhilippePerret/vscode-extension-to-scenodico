"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelClassOeuvre = void 0;
const panelClass_1 = require("./panelClass");
const Oeuvre_1 = require("../../models/Oeuvre");
class PanelClassOeuvre extends panelClass_1.PanelClass {
    _type = 'oeuvre';
    _title = 'Œuvre';
    _classe = Oeuvre_1.Oeuvre;
    _column = 2;
}
exports.PanelClassOeuvre = PanelClassOeuvre;
//# sourceMappingURL=panelClassOeuvre.js.map