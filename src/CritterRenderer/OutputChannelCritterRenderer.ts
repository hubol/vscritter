import * as vscode from 'vscode';
import { ICritterRenderer } from './ICritterRenderer';
import { ICritterState } from './CritterModel';

export class OutputChannelCritterRenderer implements ICritterRenderer {
  private readonly _outputChannel: vscode.OutputChannel;

  private constructor() {
    this._outputChannel = vscode.window.createOutputChannel('vscritter');
  }

  render(command: ICritterState) {
    this._outputChannel.replace(`Level: ${command.level}
XP: ${command.experience} / ${command.experienceMaximum}`);
  }

  dispose() {
    this._outputChannel.dispose();
  }

  static create(): ICritterRenderer {
    return new OutputChannelCritterRenderer();
  }
}