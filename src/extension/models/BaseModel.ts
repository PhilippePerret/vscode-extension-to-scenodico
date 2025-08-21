import { CacheableItem } from '../services/cache/CacheManager';
import { DatabaseService } from '../services/db/DatabaseService';

export abstract class BaseModel {

    // public static MESSAGES = {

    // };


    // static message(msgId: string) {
    //     return this.MESSAGES[msgId];
    // }
    /**
     * Panel ID for this model - must be implemented by subclasses
     */
    static get panelId(): string {
        throw new Error('panelId must be implemented by subclass');
    }

    /**
     * DB class for this model - must be implemented by subclasses
     */
    static get DbClass(): new (dbService: DatabaseService) => any {
        throw new Error('DbClass must be implemented by subclass');
    }

    /**
     * Create from database row - must be implemented by subclasses
     */
    static fromRow(row: any): any {
        throw new Error('fromRow must be implemented by subclass');
    }

    /**
     * Sort function - must be implemented by subclasses
     */
    static sortFunction(a: any, b: any): number {
        throw new Error('sortFunction must be implemented by subclass');
    }

    /**
     * Generic method to load all items for this model
     */
    static async loadAllItems(dbService: DatabaseService): Promise<any[]> {
        const db = new this.DbClass(dbService);
        const rawItems = await db.getAll();
        return rawItems.map((item: any) => this.fromRow(item)).sort(this.sortFunction);
    }

    /**
     * Post-processing after DOM elements are displayed
     * Can be overridden by subclasses if needed
     */
    static afterDisplayElements(): void {
        // Default: no special post-processing
    }
}
