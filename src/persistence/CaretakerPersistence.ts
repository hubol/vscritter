import { ICaretakerData } from "@/domain/CaretakerModel";
import { ExtensionContext } from "vscode";

const Key = "caretaker_critter";

export class CaretakerPersistence {
    private readonly _context: ExtensionContext;

    constructor(context: ExtensionContext) {
        this._context = context;
    }

    read() {
        return this._context.globalState.get<ICaretakerData>(Key) ?? null;
    }

    write(caretaker: ICaretakerData) {
        this._context.globalState.update(Key, caretaker);
    }
}
