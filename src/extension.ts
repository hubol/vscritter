import { CaretakerModel, getDefaultCaretakerData } from "@/domain/CaretakerModel";
import { DisposableInterval } from "@/lib/DisposableInterval";
import { textEditorLooksLikeExtensionOutput } from "@/lib/textEditorLooksLikeExtensionOutput";
import { CaretakerPersistence } from "@/persistence/CaretakerPersistence";
import { OutputChannelCritterRenderer } from "@/renderer/OutputChannelCritterRenderer";
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const persistence = new CaretakerPersistence(context);
    const data = persistence.read() ?? getDefaultCaretakerData();

    const model = CaretakerModel.create(data);
    const render = () => critterRenderer.render(model.getState());

    const critterRenderer = OutputChannelCritterRenderer.create();

    const interval = new DisposableInterval(() => {
        model.heartbeat();
        render();
    }, 1000);
    interval.request();

    // TODO layer pls
    const changeListener = vscode.workspace.onDidChangeTextDocument((e) => {
        if (
            vscode.window.activeTextEditor
            && !textEditorLooksLikeExtensionOutput(vscode.window.activeTextEditor)
            && e.document === vscode.window.activeTextEditor.document
        ) {
            model.gainExperienceFromActivity("code_change");
            render();
        }
    });

    render();

    context.subscriptions.push(critterRenderer, changeListener, interval);
}

// This method is called when your extension is deactivated
export function deactivate() {}
