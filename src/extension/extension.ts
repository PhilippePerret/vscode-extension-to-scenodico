import * as vscode from 'vscode';
import { App } from './services/App';

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('dico-cnario.ouvre', () => {
		App.run(context);
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
		} catch (error) {
			vscode.window.showErrorMessage(`Erreur lors du rechargement : ${error}`);
		}
	});

	context.subscriptions.push(disposable, devToolsDisposable, reloadDbDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
