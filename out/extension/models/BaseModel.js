"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
class BaseModel {
    // public static MESSAGES = {
    // };
    // static message(msgId: string) {
    //     return this.MESSAGES[msgId];
    // }
    /**
     * Panel ID for this model - must be implemented by subclasses
     */
    static get panelId() {
        throw new Error('panelId must be implemented by subclass');
    }
    /**
     * DB class for this model - must be implemented by subclasses
     */
    static get DbClass() {
        throw new Error('DbClass must be implemented by subclass');
    }
    /**
     * Create from database row - must be implemented by subclasses
     */
    static fromRow(row) {
        throw new Error('fromRow must be implemented by subclass');
    }
    /**
     * Sort function - must be implemented by subclasses
     */
    static sortFunction(a, b) {
        throw new Error('sortFunction must be implemented by subclass');
    }
    /**
     * Generic method to load all items for this model
     */
    static async loadAllItems(dbService) {
        const db = new this.DbClass(dbService);
        const rawItems = await db.getAll();
        return rawItems.map((item) => this.fromRow(item)).sort(this.sortFunction);
    }
    /**
     * Post-processing after DOM elements are displayed
     * Can be overridden by subclasses if needed
     */
    static afterDisplayElements() {
        // Default: no special post-processing
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=BaseModel.js.map