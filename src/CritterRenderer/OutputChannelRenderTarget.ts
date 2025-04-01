import { ColorGrid } from "@/Ascii/AsciiCanvas";
import { convertColorGridToEditorDecorations, EditorDecorationsFromColorGrid, getAllDecorationTypes } from "@/Ascii/convertColorGridToEditorDecorations";
import * as vscode from "vscode";

export class OutputChannelRenderTarget implements vscode.Disposable {
    private readonly _outputChannel: vscode.OutputChannel;
    private _textToCompareOnInterval: string | null = null;
    private _decorationsToApplyOnInterval: EditorDecorationsFromColorGrid | null = null;
    private _applyDecorationsIntervalTimeout: NodeJS.Timeout | null = null;

    readonly name: string;

    constructor(name: string) {
        this._outputChannel = vscode.window.createOutputChannel(name);
        this.name = name;
    }

    fill(text: string, colors: ColorGrid) {
        this._outputChannel.replace(text);

        const decorations = convertColorGridToEditorDecorations(colors);
        this._textToCompareOnInterval = text;
        this._decorationsToApplyOnInterval = decorations;

        if (this._applyDecorationsIntervalTimeout) {
            return;
        }

        this._applyDecorationsIntervalTimeout = setInterval(() => {
            const textEditor = findVisibleTextEditorForOutputChannel(this.name);
            // Looks like you can sometimes get a textEditor that hasn't received the text yet... Interesting
            if (textEditor && textEditor.document.getText() === this._textToCompareOnInterval) {
                clearInterval(this._applyDecorationsIntervalTimeout!);
                this._applyDecorationsIntervalTimeout = null;
                applyDecorationsToTextEditor(textEditor, this._decorationsToApplyOnInterval!);
            }
        });
    }

    dispose() {
        this._outputChannel.dispose();
        // TODO interval that implements disposable!
        if (this._applyDecorationsIntervalTimeout) {
            clearInterval(this._applyDecorationsIntervalTimeout);
            this._applyDecorationsIntervalTimeout = null;
        }
    }
}

function findVisibleTextEditorForOutputChannel(name: string) {
    const textEditor = vscode.window.visibleTextEditors.find(editor =>
        editor?.document?.fileName.includes(name) && editor.document.fileName.includes("extension-output")
    );
    return textEditor?.setDecorations ? textEditor : null;
}

const emptyRanges: vscode.Range[] = [];

function applyDecorationsToTextEditor(editor: vscode.TextEditor, decorations: EditorDecorationsFromColorGrid) {
    // Looks like you shouldn't clear and then update ranges for decorations
    // Otherwise you get nasty flickering!
    // So here we apply the decorations we want
    // And remove the decorations we do not

    for (const [decorationType, ranges] of decorations) {
        editor.setDecorations(decorationType, ranges);
    }

    for (const decorationType of getAllDecorationTypes()) {
        if (!decorations.has(decorationType)) {
            editor.setDecorations(decorationType, emptyRanges);
        }
    }
}
