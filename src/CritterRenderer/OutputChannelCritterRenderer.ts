import * as vscode from 'vscode';
import { ICritterRenderer, RenderCommand } from './ICritterRenderer';

export class OutputChannelCritterRenderer implements ICritterRenderer {
  private readonly _outputChannel: vscode.OutputChannel;

  private constructor() {
    this._outputChannel = vscode.window.createOutputChannel('vscritter');
  }

  render(command: RenderCommand) {
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