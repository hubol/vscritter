import { CaretakerModel, getDefaultCaretakerData } from "@/domain/CaretakerModel";
import { DisposableInterval } from "@/lib/DisposableInterval";
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
    const renderAll = () => {
        const state = model.getState();
        outputChannelRenderer.render(state);
        statusBarItemRenderer.render(state);
    };

    const heartbeatInterval = new DisposableInterval(() => {
        model.heartbeat();
        statusBarItemRenderer.render(model.getState());
    }, 1000);

    // TODO layer pls
    const changeListener = vscode.workspace.onDidChangeTextDocument((e) => {
        if (
            vscode.window.activeTextEditor
            && !textEditorLooksLikeExtensionOutput(vscode.window.activeTextEditor)
            && e.document === vscode.window.activeTextEditor.document
        ) {
            model.gainExperienceFromActivity("code_change");
            persistence.write(model.getData());
            renderAll();
        }
    });

    vscode.commands.registerCommand("vscritter.show", () => {
        outputChannelRenderer.showOutputChannel();
    });

    vscode.commands.registerCommand("vscritter.reset", async () => {
        const result = await vscode.window.showInformationMessage(
            "Are you sure that you want to reset your vscritter data?",
            "Yes",
            "No",
        );
        if (result === "Yes") {
            model.reset();
            renderAll();
        }
    });

    heartbeatInterval.request();
    renderAll();

    context.subscriptions.push(
        outputChannelRenderer,
        statusBarItemRenderer,
        heartbeatInterval,
        changeListener,
    );
}

export function deactivate() {}
