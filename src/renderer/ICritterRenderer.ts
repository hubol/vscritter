import { ICaretakerState } from "@/domain/CaretakerModel";
import { Disposable } from "vscode";

export interface ICritterRenderer extends Disposable {
    render(state: ICaretakerState): void;
}
