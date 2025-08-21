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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const App_1 = require("./services/App");
function activate(context) {
    const disposable = vscode.commands.registerCommand('dico-cnario.ouvre', () => {
        App_1.App.run(context);
    });
    const devToolsDisposable = vscode.commands.registerCommand('dico-cnario.dev-tools', () => {
        vscode.commands.executeCommand('workbench.action.webview.openDeveloperTools');
    });
    const reloadDbDisposable = vscode.commands.registerCommand('dico-cnario.reload-db', async () => {
        try {
            const { DatabaseService } = require('./services/DatabaseService');
            const dbService = DatabaseService.getInstance(context, false);
            await dbService.close();
            vscode.window.showInformationMessage('Base de données rechargée ! Relancez les panneaux.');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Erreur lors du rechargement : ${error}`);
        }
    });
    context.subscriptions.push(disposable, devToolsDisposable, reloadDbDisposable);
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map