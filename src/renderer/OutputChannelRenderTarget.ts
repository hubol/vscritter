import { DisposableInterval, DisposableIntervalCallback } from "@/lib/DisposableInterval";
import { textEditorLooksLikeExtensionOutput } from "@/lib/textEditorLooksLikeExtensionOutput";
import { ColorGrid } from "@/renderer/ascii/AsciiCanvas";
import { convertColorGridToEditorDecorations, EditorDecorationsFromColorGrid, getAllDecorationTypes } from "@/renderer/ascii/convertColorGridToEditorDecorations";
import * as vscode from "vscode";

export class OutputChannelRenderTarget implements vscode.Disposable {
    private readonly _outputChannel: vscode.OutputChannel;

    private readonly _throttledFillInterval: DisposableInterval;
    private _lastThrottledFillMs = -1;
    private _fillRequest: { text: string; decorations: EditorDecorationsFromColorGrid } | null = null;

    private readonly _decorateInterval: DisposableInterval;
    private _decorateRequest: { expectedText: string; decorations: EditorDecorationsFromColorGrid } | null = null;

    readonly name: string;

    constructor(name: string) {
        this._outputChannel = vscode.window.createOutputChannel(name);
        this.name = name;
        this._throttledFillInterval = new DisposableInterval(this._onThrottledFill.bind(this), null);
        this._decorateInterval = new DisposableInterval(this._onDecorate.bind(this), null);
    }

    fill(text: string, colors: ColorGrid) {
        Date.now();
        text = normalizeLineEndings(text);
        const decorations = convertColorGridToEditorDecorations(colors);

        this._fillRequest = { text, decorations };
        this._throttledFillInterval.request();
    }

    show() {
        this._outputChannel.show(true);
    }

    dispose() {
        this._outputChannel.dispose();
        this._decorateInterval.dispose();
        this._throttledFillInterval.dispose();
    }

    private static readonly _applyTextThrottleMs = 250;

    private readonly _onThrottledFill: DisposableIntervalCallback = () => {
        if (
            this._fillRequest === null
            || (Date.now() - this._lastThrottledFillMs) < OutputChannelRenderTarget._applyTextThrottleMs
        ) {
            return;
        }

        const textEditor = findVisibleTextEditorForOutputChannel(this.name);
        if (!textEditor) {
            return;
        }

        const { text, decorations } = this._fillRequest;
        this._fillRequest = null;

        // .replace() appears to be asynchronous
        // Checking the TextEditor's contents will not immediately reflect this call
        // So we store the text to compare and set an interval to see when our text was applied :-)
        // On Windows, the line endings include the awesome carriage return character
        // Hence the normalizeLineEndings() calls

        // Also, all writes to OutputChannel appear to create a dangling listener...?
        // Am I missing something?
        // After ~175 calls to fill():
        // 2025-04-02 10:59:17.794 [error] [701] potential listener LEAK detected, having 175 listeners already. MOST frequent listener (1):: Error
        // at Bfi.create (vscode-file://vscode-app/usr/share/code/resources/app/out/vs/workbench/workbench.desktop.main.js:27:11832)
        // at hDe.q [as onDidChange] (vscode-file://vscode-app/usr/share/code/resources/app/out/vs/workbench/workbench.desktop.main.js:29:1377)
        // at new bf (vscode-file://vscode-app/usr/share/code/resources/app/out/vs/workbench/workbench.desktop.main.js:248:20382)
        // at Rgt.o (vscode-file://vscode-app/usr/share/code/resources/app/out/vs/workbench/workbench.desktop.main.js:1346:1586)
        // at Rgt.createInstance (vscode-file://vscode-app/usr/share/code/resources/app/out/vs/workbench/workbench.desktop.main.js:1346:1083)
        // at Z0e.C (vscode-file://vscode-app/usr/share/code/resources/app/out/vs/workbench/workbench.desktop.main.js:2480:12640)
        // at Z0e.getContent (vscode-file://vscode-app/usr/share/code/resources/app/out/vs/workbench/workbench.desktop.main.js:2480:12384)
        // at async tCe.I (vscode-file://vscode-app/usr/share/code/resources/app/out/vs/workbench/workbench.desktop.main.js:2481:1767)

        // Reproduce
        // import * as vscode from "vscode";
        //
        // export function activate(context: vscode.ExtensionContext) {
        //     const channel = vscode.window.createOutputChannel("vscritter");
        //     let count = 0;
        //     setInterval(() => {
        //         if (count++ <= 175) {
        //             channel.append("yoo!");
        //         }
        //     }, 100);
        // }
        //
        // export function deactivate() {}

        this._outputChannel.replace(text);
        this._decorateRequest = { expectedText: text, decorations };
        this._decorateInterval.request();
        this._lastThrottledFillMs = Date.now();
    };

    private readonly _onDecorate: DisposableIntervalCallback = () => {
        if (this._decorateRequest === null) {
            return;
        }

        const { expectedText, decorations } = this._decorateRequest;

        const textEditor = findVisibleTextEditorForOutputChannel(this.name);
        if (textEditor && normalizeLineEndings(textEditor.document.getText()) === expectedText) {
            try {
                // Even after our fantastic hacks,
                // VSCode still sometimes throws here
                // Relevant lines:
                // https://github.com/microsoft/vscode/blob/4f39e1da783d187b0a83e7d427748037210ea6c5/src/vs/workbench/api/browser/mainThreadEditors.ts#L304-L322
                // https://github.com/microsoft/vscode/blob/ed13a9538d3c5f872d43bf96a5429a7439eea835/src/vs/workbench/api/common/extHostTextEditor.ts#L540-L562
                applyDecorationsToTextEditor(textEditor, decorations);
            }
            catch (_) {
                return;
            }
            this._decorateRequest = null;
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
