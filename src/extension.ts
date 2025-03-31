// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { OutputChannelCritterRenderer } from './CritterRenderer/OutputChannelCritterRenderer';
import { CritterModel } from './CritterRenderer/CritterModel';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const critterRenderer = OutputChannelCritterRenderer.create();

	// const disposable = vscode.commands.registerCommand('vscritter.helloWorld', () => {
	// 	vscode.window.showInformationMessage('Hello World from vscritter!');
	// });

	const model = CritterModel.create({ experience: 0, level: 1, style: 32 });

	critterRenderer.render(model);

	context.subscriptions.push(critterRenderer);
}

// This method is called when your extension is deactivated
export function deactivate() {}
