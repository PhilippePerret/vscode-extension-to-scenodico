import { DatabaseService } from '../services/db/DatabaseService';
import { Entry, IEntry } from '../models/Entry';

export class EntryDb {
    private dbService: DatabaseService;

    constructor(dbService: DatabaseService) {
        this.dbService = dbService;
    }

    async getAll(): Promise<Entry[]> {
        const rows = await this.dbService.all('SELECT * FROM entries ORDER BY entree COLLATE NOCASE');
        return rows.map(row => Entry.fromRow(row));
    }

    async getById(id: string): Promise<Entry | null> {
        const row = await this.dbService.get('SELECT * FROM entries WHERE id = ?', [id]);
        return row ? Entry.fromRow(row) : null;
    }

    async create(entry: Entry): Promise<void> {
        const row = entry.toRow();
        await this.dbService.run(
            'INSERT INTO entries (id, entree, genre, categorie_id, definition) VALUES (?, ?, ?, ?, ?)',
            [row.id, row.entree, row.genre, row.categorie_id, row.definition]
        );
    }

    async update(entry: Entry): Promise<void> {
        const row = entry.toRow();
        await this.dbService.run(
            'UPDATE entries SET entree = ?, genre = ?, categorie_id = ?, definition = ? WHERE id = ?',
            [row.entree, row.genre, row.categorie_id, row.definition, row.id]
        );
    }

    async delete(id: string): Promise<void> {
        await this.dbService.run('DELETE FROM entries WHERE id = ?', [id]);
    }

    async search(searchTerm: string): Promise<Entry[]> {
        const rows = await this.dbService.all(
            'SELECT * FROM entries WHERE entree LIKE ? ORDER BY entree COLLATE NOCASE',
            [`%${searchTerm}%`]
        );
        return rows.map(row => Entry.fromRow(row));
    }

    async getAllIds(): Promise<Set<string>> {
        const rows = await this.dbService.all('SELECT id FROM entries');
        return new Set(rows.map(row => row.id));
    }

    async exists(id: string): Promise<boolean> {
        const row = await this.dbService.get('SELECT 1 FROM entries WHERE id = ? LIMIT 1', [id]);
        return !!row;
    }
}
