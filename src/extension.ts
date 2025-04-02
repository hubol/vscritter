import { CaretakerModel, getDefaultCaretakerData } from "@/domain/CaretakerModel";
import { textEditorLooksLikeExtensionOutput } from "@/lib/textEditorLooksLikeExtensionOutput";
import { CaretakerPersistence } from "@/persistence/CaretakerPersistence";
import { OutputChannelCritterRenderer } from "@/renderer/OutputChannelCritterRenderer";
import { StatusBarItemCritterRenderer } from "@/renderer/StatusBarItemCritterRenderer";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    const persistence = new CaretakerPersistence(context);
    const data = persistence.read() ?? getDefaultCaretakerData();

    const outputChannelRenderer = OutputChannelCritterRenderer.create();
    const statusBarItemRenderer = StatusBarItemCritterRenderer.create();

    const model = CaretakerModel.create(data);
    const render = () => {
        const state = model.getState();
        outputChannelRenderer.render(state);
        statusBarItemRenderer.render(state);
    };

    // TODO layer pls
    const changeListener = vscode.workspace.onDidChangeTextDocument((e) => {
        if (
            vscode.window.activeTextEditor
            && !textEditorLooksLikeExtensionOutput(vscode.window.activeTextEditor)
            && e.document === vscode.window.activeTextEditor.document
        ) {
            model.gainExperienceFromActivity("code_change");
            persistence.write(model.getData());
            render();
        }
    });

    render();

    context.subscriptions.push(outputChannelRenderer, statusBarItemRenderer, changeListener);
}

export function deactivate() {}
