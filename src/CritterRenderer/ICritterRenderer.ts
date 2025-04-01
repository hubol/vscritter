import { ICritterState } from '@/CritterRenderer/CritterModel';
import { Disposable } from 'vscode';

export interface ICritterRenderer extends Disposable {
  render(state: ICritterState): void
}
