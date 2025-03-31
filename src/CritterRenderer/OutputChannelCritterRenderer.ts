import * as vscode from 'vscode';
import { ICritterRenderer } from './ICritterRenderer';
import { ICritterState } from './CritterModel';
import { AsciiColumns } from '../Ascii/AsciiColumns';
import { AsciiCritters } from '../Ascii/AsciiCritters';

export class OutputChannelCritterRenderer implements ICritterRenderer {
  private readonly _outputChannel: vscode.OutputChannel;

  private constructor() {
    this._outputChannel = vscode.window.createOutputChannel('vscritter');
  }

  render(command: ICritterState) {
    const infoText = `


Level: ${command.level}
XP: ${command.experience} / ${command.experienceMaximum}`;
    const text = AsciiColumns.layout(3, AsciiCritters.Babies[0], infoText);
    this._outputChannel.replace(text);
  }

  dispose() {
    this._outputChannel.dispose();
  }

  static create(): ICritterRenderer {
    return new OutputChannelCritterRenderer();
  }
}