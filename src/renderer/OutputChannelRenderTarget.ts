import { DisposableInterval, DisposableIntervalCallback } from "@/lib/DisposableInterval";
import { textEditorLooksLikeExtensionOutput } from "@/lib/textEditorLooksLikeExtensionOutput";
import { ColorGrid } from "@/renderer/ascii/AsciiCanvas";
import { convertColorGridToEditorDecorations, EditorDecorationsFromColorGrid, getAllDecorationTypes } from "@/renderer/ascii/convertColorGridToEditorDecorations";
import * as vscode from "vscode";

export class OutputChannelRenderTarget implements vscode.Disposable {
    private readonly _outputChannel: vscode.OutputChannel;
    private readonly _applyDecorationsInterval: DisposableInterval;
    private _textToCompareOnInterval: string | null = null;
    private _decorationsToApplyOnInterval: EditorDecorationsFromColorGrid | null = null;

    readonly name: string;

    constructor(name: string) {
        this._outputChannel = vscode.window.createOutputChannel(name);
        this.name = name;
        this._applyDecorationsInterval = new DisposableInterval(this._tryToApplyDecorations.bind(this), null);
    }

    fill(text: string, colors: ColorGrid) {
        text = normalizeLineEndings(text);
        // .replace() appears to be asynchronous
        // Checking the TextEditor's contents will not immediately reflect this call
        // So we store the text to compare and set an interval to see when our text was applied :-)
        // On Windows, the line endings include the awesome carriage return character
        // Hence the normalizeLineEndings() calls
        this._outputChannel.replace(text);

        const decorations = convertColorGridToEditorDecorations(colors);
        this._textToCompareOnInterval = text;
        this._decorationsToApplyOnInterval = decorations;
        this._applyDecorationsInterval.request();
    }

    dispose() {
        this._outputChannel.dispose();
        this._applyDecorationsInterval.dispose();
    }

    private readonly _tryToApplyDecorations: DisposableIntervalCallback = (clearInterval) => {
        const textEditor = findVisibleTextEditorForOutputChannel(this.name);
        if (textEditor && normalizeLineEndings(textEditor.document.getText()) === this._textToCompareOnInterval) {
            applyDecorationsToTextEditor(textEditor, this._decorationsToApplyOnInterval!);
            clearInterval();
        }
    };
}

function normalizeLineEndings(text: string) {
    return text.replaceAll("\r", "");
}

function findVisibleTextEditorForOutputChannel(name: string) {
    const textEditor = vscode.window.visibleTextEditors.find(editor =>
        editor?.document?.fileName.includes(name) && textEditorLooksLikeExtensionOutput(editor)
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
