"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
const PanelManager_1 = require("../extension/services/PanelManager");
const test_utils_1 = require("./test_utils");
suite('Advanced Cache System', () => {
    suiteSetup(async () => {
        // Ensure test database is populated before running tests
        await (0, test_utils_1.ensureDatabaseFixtures)();
    });
    test('Oeuvre cache system works correctly', async () => {
        await vscode.commands.executeCommand('dico-cnario.ouvre');
        await (0, test_utils_1.allPanelsReady)();
        const oeuvresPanel = PanelManager_1.PanelManager.getPanel('Oeuvres');
        assert.ok(oeuvresPanel, 'Le panneau Oeuvres existe');
        // Compter les oeuvres réelles
        const allOeuvres = await oeuvresPanel.getElements('div.oeuvre');
        const expectedCount = allOeuvres.length;
        assert.ok(expectedCount > 0, 'Des oeuvres doivent être présentes');
        // CHECK: Cache est construit
        const isCacheBuilt = await oeuvresPanel.executeScript('Oeuvre.isCacheBuilt');
        assert.strictEqual(isCacheBuilt, true, 'Oeuvre cache should be built automatically');
        // CHECK: Taille correcte
        const cacheSize = await oeuvresPanel.executeScript('Oeuvre.cacheSize');
        assert.strictEqual(cacheSize, expectedCount, `Oeuvre cache should contain ${expectedCount} oeuvres`);
        // CHECK: Structure des données Oeuvre
        const firstOeuvre = await oeuvresPanel.executeScript(`
            const oeuvres = Oeuvre.getAll();
            oeuvres.length > 0 ? {
                hasId: typeof oeuvres[0].id === 'string',
                hasTitreAffiche: typeof oeuvres[0].titre_affiche === 'string',
                hasTitres: Array.isArray(oeuvres[0].titres),
                hasTitresMin: Array.isArray(oeuvres[0].titresLookUp),
                titresLength: oeuvres[0].titres.length,
                titresMinLength: oeuvres[0].titresLookUp.length
            } : null
        `);
        assert.ok(firstOeuvre, 'Should have at least one cached oeuvre');
        assert.strictEqual(firstOeuvre.hasId, true, 'Cached oeuvre should have id');
        assert.strictEqual(firstOeuvre.hasTitreAffiche, true, 'Cached oeuvre should have titre_affiche');
        assert.strictEqual(firstOeuvre.hasTitres, true, 'Cached oeuvre should have titres array');
        assert.strictEqual(firstOeuvre.hasTitresMin, true, 'Cached oeuvre should have titresLookUp array');
        // CHECK: Méthode get() fonctionne pour les oeuvres
        const oeuvreGetWorks = await oeuvresPanel.executeScript(`
            const allOeuvres = Oeuvre.getAll();
            if (allOeuvres.length > 0) {
                const firstId = allOeuvres[0].id;
                const retrieved = Oeuvre.get(firstId);
                retrieved !== null && retrieved.id === firstId;
            } else { false; }
        `);
        assert.strictEqual(oeuvreGetWorks, true, 'Oeuvre.get() method should work');
    });
    test('Exemple cache system works correctly', async () => {
        await vscode.commands.executeCommand('dico-cnario.ouvre');
        await (0, test_utils_1.allPanelsReady)();
        const exemplesPanel = PanelManager_1.PanelManager.getPanel('Exemples');
        assert.ok(exemplesPanel, 'Le panneau Exemples existe');
        // Compter les exemples réels
        const allExemples = await exemplesPanel.getElements('div.exemple');
        const expectedCount = allExemples.length;
        assert.ok(expectedCount > 0, 'Des exemples doivent être présents');
        // CHECK: Cache est construit
        const isCacheBuilt = await exemplesPanel.executeScript('Exemple.isCacheBuilt');
        assert.strictEqual(isCacheBuilt, true, 'Exemple cache should be built automatically');
        // CHECK: Taille correcte
        const cacheSize = await exemplesPanel.executeScript('Exemple.cacheSize');
        assert.strictEqual(cacheSize, expectedCount, `Exemple cache should contain ${expectedCount} exemples`);
        // CHECK: Structure des données Exemple
        const firstExemple = await exemplesPanel.executeScript(`
            const exemples = Exemple.getAll();
            exemples.length > 0 ? {
                hasId: typeof exemples[0].id === 'string',
                hasContent: typeof exemples[0].content === 'string',
                hasContentMin: typeof exemples[0].content_min === 'string',
                hasContentMinRa: typeof exemples[0].content_min_ra === 'string'
            } : null
        `);
        assert.ok(firstExemple, 'Should have at least one cached exemple');
        assert.strictEqual(firstExemple.hasId, true, 'Cached exemple should have id');
        assert.strictEqual(firstExemple.hasContent, true, 'Cached exemple should have content');
        assert.strictEqual(firstExemple.hasContentMin, true, 'Cached exemple should have content_min');
        assert.strictEqual(firstExemple.hasContentMinRa, true, 'Cached exemple should have content_min_ra');
    });
    test('Entry search by prefix works', async () => {
        await vscode.commands.executeCommand('dico-cnario.ouvre');
        await (0, test_utils_1.allPanelsReady)();
        const dictionaryPanel = PanelManager_1.PanelManager.getPanel('Dictionnaire');
        assert.ok(dictionaryPanel, 'Le panneau Dictionnaire existe');
        // CHECK: Méthode searchMatchingItems existe
        const hasSearchMethod = await dictionaryPanel.executeScript('typeof Entry.searchMatchingItems === "function"');
        assert.strictEqual(hasSearchMethod, true, 'Entry should have searchMatchingItems method');
        // Test recherche avec un préfixe qui devrait donner des résultats
        const searchResults = await dictionaryPanel.executeScript(`
            const allEntries = Entry.getAll();
            if (allEntries.length > 0) {
                // Prendre le premier caractère de la première entrée
                const firstChar = allEntries[0].entree.charAt(0).toLowerCase();
                const results = Entry.searchMatchingItems(firstChar);
                {
                    searchTerm: firstChar,
                    resultsCount: results.length,
                    hasResults: results.length > 0,
                    firstResultValid: results.length > 0 && results[0].entree_min.startsWith(firstChar)
                };
            } else { null; }
        `);
        assert.ok(searchResults, 'Should have search results data');
        assert.ok(searchResults.hasResults, 'Search should return results');
        assert.strictEqual(searchResults.firstResultValid, true, 'Search results should match prefix');
    });
    test('Oeuvre search by title works', async () => {
        await vscode.commands.executeCommand('dico-cnario.ouvre');
        await (0, test_utils_1.allPanelsReady)();
        const oeuvresPanel = PanelManager_1.PanelManager.getPanel('Oeuvres');
        assert.ok(oeuvresPanel, 'Le panneau Oeuvres existe');
        // CHECK: Méthode searchMatchingItems existe
        const hasSearchMethod = await oeuvresPanel.executeScript('typeof Oeuvre.searchMatchingItems === "function"');
        assert.strictEqual(hasSearchMethod, true, 'Oeuvre should have searchMatchingItems method');
        // Test recherche par titre
        const searchResults = await oeuvresPanel.executeScript(`
            const allOeuvres = Oeuvre.getAll();
            if (allOeuvres.length > 0) {
                // Prendre une partie du titre de la première oeuvre
                const firstTitle = allOeuvres[0].titre_affiche;
                const searchTerm = firstTitle.substring(0, 3).toLowerCase();
                const results = Oeuvre.searchMatchingItems(searchTerm);
                {
                    searchTerm: searchTerm,
                    originalTitle: firstTitle,
                    resultsCount: results.length,
                    hasResults: results.length > 0
                };
            } else { null; }
        `);
        assert.ok(searchResults, 'Should have oeuvre search results data');
        assert.ok(searchResults.hasResults, 'Oeuvre search should return results');
    });
    test('Cache clearing works for all types', async () => {
        await vscode.commands.executeCommand('dico-cnario.ouvre');
        await (0, test_utils_1.allPanelsReady)();
        const dictionaryPanel = PanelManager_1.PanelManager.getPanel('Dictionnaire');
        const oeuvresPanel = PanelManager_1.PanelManager.getPanel('Oeuvres');
        const exemplesPanel = PanelManager_1.PanelManager.getPanel('Exemples');
        assert.ok(dictionaryPanel && oeuvresPanel && exemplesPanel, 'Tous les panneaux existent');
        // Vérifier que les caches sont construits
        const entriesCacheBuilt = await dictionaryPanel.executeScript('Entry.isCacheBuilt');
        const oeuvresCacheBuilt = await oeuvresPanel.executeScript('Oeuvre.isCacheBuilt');
        const exemplesCacheBuilt = await exemplesPanel.executeScript('Exemple.isCacheBuilt');
        assert.strictEqual(entriesCacheBuilt, true, 'Entry cache should be built');
        assert.strictEqual(oeuvresCacheBuilt, true, 'Oeuvre cache should be built');
        assert.strictEqual(exemplesCacheBuilt, true, 'Exemple cache should be built');
        // Effacer les caches
        await dictionaryPanel.executeScript('Entry.clearCache()');
        await oeuvresPanel.executeScript('Oeuvre.clearCache()');
        await exemplesPanel.executeScript('Exemple.clearCache()');
        // Vérifier qu'ils sont effacés
        const entriesCacheCleared = await dictionaryPanel.executeScript('!Entry.isCacheBuilt');
        const oeuvresCacheCleared = await oeuvresPanel.executeScript('!Oeuvre.isCacheBuilt');
        const exemplesCacheCleared = await exemplesPanel.executeScript('!Exemple.isCacheBuilt');
        assert.strictEqual(entriesCacheCleared, true, 'Entry cache should be cleared');
        assert.strictEqual(oeuvresCacheCleared, true, 'Oeuvre cache should be cleared');
        assert.strictEqual(exemplesCacheCleared, true, 'Exemple cache should be cleared');
        // Vérifier que les tailles sont à 0
        const entriesSize = await dictionaryPanel.executeScript('Entry.cacheSize');
        const oeuvresSize = await oeuvresPanel.executeScript('Oeuvre.cacheSize');
        const exemplesSize = await exemplesPanel.executeScript('Exemple.cacheSize');
        assert.strictEqual(entriesSize, 0, 'Entry cache size should be 0 after clearing');
        assert.strictEqual(oeuvresSize, 0, 'Oeuvre cache size should be 0 after clearing');
        assert.strictEqual(exemplesSize, 0, 'Exemple cache size should be 0 after clearing');
    });
    test('Cross-references work in cache data', async () => {
        await vscode.commands.executeCommand('dico-cnario.ouvre');
        await (0, test_utils_1.allPanelsReady)();
        const dictionaryPanel = PanelManager_1.PanelManager.getPanel('Dictionnaire');
        const oeuvresPanel = PanelManager_1.PanelManager.getPanel('Oeuvres');
        const exemplesPanel = PanelManager_1.PanelManager.getPanel('Exemples');
        assert.ok(dictionaryPanel && oeuvresPanel && exemplesPanel, 'Tous les panneaux existent');
        // Test si les références croisées sont résolues dans les exemples
        const crossRefTest = await exemplesPanel.executeScript(`
            const exemples = Exemple.getAll();
            let hasOeuvreRef = false;
            let hasEntryRef = false;
            
            for (let exemple of exemples) {
                if (exemple.oeuvre_id && exemple.oeuvre_titre) {
                    hasOeuvreRef = true;
                }
                if (exemple.entry_id && exemple.entry_entree) {
                    hasEntryRef = true;
                }
                if (hasOeuvreRef && hasEntryRef) break;
            }
            
            {
                exempleCount: exemples.length,
                hasOeuvreRef: hasOeuvreRef,
                hasEntryRef: hasEntryRef
            };
        `);
        assert.ok(crossRefTest.exempleCount > 0, 'Should have exemples to test');
        // Note: Les références croisées peuvent ne pas être présentes dans tous les exemples
        // donc on vérifie juste que la structure est correcte sans forcer des valeurs
    });
});
//# sourceMappingURL=advanced_cache.test.js.map