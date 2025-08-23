"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelClassEntry = void 0;
const Entry_1 = require("../../models/Entry");
const panelClass_1 = require("./panelClass");
class PanelClassEntry extends panelClass_1.PanelClass {
    modelClass = Entry_1.Entry;
}
exports.PanelClassEntry = PanelClassEntry;
//# sourceMappingURL=panelClassEntry.js.map