import { Disposable } from "vscode";

export type DisposableIntervalCallback = (clearInterval: () => void) => unknown;

export class DisposableInterval implements Disposable {
    private readonly _cb: DisposableIntervalCallback;
    private readonly _delay: number | null;
    private _timeoutToDispose: NodeJS.Timeout | null = null;

    constructor(cb: DisposableIntervalCallback, delay: number | null) {
        this._cb = cb;
        this._delay = delay;
    }

    start() {
        if (this._timeoutToDispose) {
            return;
        }

        const timeout = setInterval(() => this._cb(clear), this._delay ?? undefined);
        this._timeoutToDispose = timeout;

        const clear = () => {
            clearInterval(timeout);
            if (this._timeoutToDispose == timeout) {
                this._timeoutToDispose = null;
            }
        };
    }

    dispose() {
        if (!this._timeoutToDispose) {
            return;
        }

        clearInterval(this._timeoutToDispose);
        this._timeoutToDispose = null;
    }
}
