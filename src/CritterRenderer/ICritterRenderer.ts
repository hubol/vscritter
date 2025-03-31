import { Disposable } from 'vscode';
import { ICritterState } from './CritterModel';

export interface ICritterRenderer extends Disposable {
  render(state: ICritterState): void
}
