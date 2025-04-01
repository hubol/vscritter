import { TextEditor } from "vscode";

export function textEditorLooksLikeExtensionOutput(editor: TextEditor) {
    return editor.document.fileName.includes("extension-output");
}
