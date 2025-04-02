import { ICaretakerState } from "@/domain/CaretakerModel";
import { rgbIntegerToHexColorString } from "@/lib/rgbIntegerToHexColorString";
import { ICritterRenderer } from "@/renderer/ICritterRenderer";
import * as vscode from "vscode";

export class StatusBarItemCritterRenderer implements ICritterRenderer, vscode.Disposable {
    private readonly _statusBarItem: vscode.StatusBarItem;

    private constructor() {
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    }

    render(state: ICaretakerState): void {
        this._statusBarItem.text =
            `$(megaphone) Level: ${state.session.level} (XP: ${state.session.experience} / ${state.session.experienceMaximum})`;
        this._statusBarItem.color = rgbIntegerToHexColorString(state.session.critters[0].color);
        this._statusBarItem.show();
    }

    dispose() {
        this._statusBarItem.dispose();
    }

    static create(): ICritterRenderer {
        return new StatusBarItemCritterRenderer();
    }
}
