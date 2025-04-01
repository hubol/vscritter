import { CritterModel } from "@/CritterRenderer/CritterModel";
import { OutputChannelCritterRenderer } from "@/CritterRenderer/OutputChannelCritterRenderer";
import { AdjustColor } from "@/lib/AdjustColor";
import { DisposableInterval } from "@/lib/DisposableInterval";
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const critterRenderer = OutputChannelCritterRenderer.create();

    const model = CritterModel.create({
        color: AdjustColor.hsv(Math.random() * 360, 70 + Math.random() * 30, 70 + Math.random() * 30).toPixi(),
        experience: 0,
        heartbeats: 0,
        level: 1,
        style: 32,
    });

    const interval = new DisposableInterval(() => {
        model.heartbeat();
        critterRenderer.render(model);
    }, 1000);
    interval.start();

    // TODO layer pls
    const changeListener = vscode.workspace.onDidChangeTextDocument((e) => {
        if (vscode.window.activeTextEditor && e.document === vscode.window.activeTextEditor.document) {
            model.gainExperience(1);
            critterRenderer.render(model);
        }
    });

    critterRenderer.render(model);

    context.subscriptions.push(critterRenderer, changeListener, interval);
}

// This method is called when your extension is deactivated
export function deactivate() {}
