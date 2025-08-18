"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilmDb = void 0;
const Film_1 = require("../models/Film");
class FilmDb {
    dbService;
    constructor(dbService) {
        this.dbService = dbService;
    }
    async getAll() {
        const rows = await this.dbService.all(`
            SELECT * FROM films 
            ORDER BY 
                CASE WHEN titre_francais IS NOT NULL THEN titre_francais ELSE titre_original END COLLATE NOCASE
        `);
        return rows.map(row => Film_1.Film.fromRow(row));
    }
    async getById(id) {
        const row = await this.dbService.get('SELECT * FROM films WHERE id = ?', [id]);
        return row ? Film_1.Film.fromRow(row) : null;
    }
    async create(film) {
        const row = film.toRow();
        await this.dbService.run('INSERT INTO films (id, titre_affiche, titre_original, titre_francais, annee, auteurs, notes, resume) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [row.id, row.titre_affiche, row.titre_original, row.titre_francais, row.annee, row.auteurs, row.notes, row.resume]);
    }
    async update(film) {
        const row = film.toRow();
        await this.dbService.run('UPDATE films SET titre_affiche = ?, titre_original = ?, titre_francais = ?, annee = ?, auteurs = ?, notes = ?, resume = ? WHERE id = ?', [row.titre_affiche, row.titre_original, row.titre_francais, row.annee, row.auteurs, row.notes, row.resume, row.id]);
    }
    async delete(id) {
        await this.dbService.run('DELETE FROM films WHERE id = ?', [id]);
    }
    async search(searchTerm) {
        const rows = await this.dbService.all(`
            SELECT * FROM films 
            WHERE titre_affiche LIKE ? OR titre_original LIKE ? OR titre_francais LIKE ?
            ORDER BY 
                CASE WHEN titre_francais IS NOT NULL THEN titre_francais ELSE titre_original END COLLATE NOCASE
        `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
        return rows.map(row => Film_1.Film.fromRow(row));
    }
    async getAllIds() {
        const rows = await this.dbService.all('SELECT id FROM films');
        return new Set(rows.map(row => row.id));
    }
    async exists(id) {
        const row = await this.dbService.get('SELECT 1 FROM films WHERE id = ? LIMIT 1', [id]);
        return !!row;
    }
}
exports.FilmDb = FilmDb;
//# sourceMappingURL=FilmDb.js.map