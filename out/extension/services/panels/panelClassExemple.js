"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelClassExemple = void 0;
const panelClass_1 = require("./panelClass");
const Exemple_1 = require("../../models/Exemple");
class PanelClassExemple extends panelClass_1.PanelClass {
    _type = 'exemple';
    _title = 'Exemple';
    _classe = Exemple_1.Exemple;
    _column = 3;
}
exports.PanelClassExemple = PanelClassExemple;
//# sourceMappingURL=panelClassExemple.js.map