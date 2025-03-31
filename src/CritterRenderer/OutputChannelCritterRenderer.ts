import * as vscode from 'vscode';
import { ICritterRenderer } from './ICritterRenderer';
import { ICritterState } from './CritterModel';
import { AsciiColumns } from '../Ascii/AsciiColumns';
import { AsciiCritters } from '../Ascii/AsciiCritters';
import { renderAsciiMeter } from '../Ascii/renderAsciiMeter';
import { AsciiCanvas } from '../Ascii/AsciiContent';
import { renderAsciiBox } from '../Ascii/renderAsciiBox';

const canvas = AsciiCanvas.create({ width: 100, height: 20 });

export class OutputChannelCritterRenderer implements ICritterRenderer {
  private readonly _outputChannel: vscode.OutputChannel;

  private constructor() {
    this._outputChannel = vscode.window.createOutputChannel('vscritter');
  }

  render(command: ICritterState) {
    canvas.clear();
    canvas.draw(0, 0, AsciiArt.CritterFrame);
    canvas.draw(1, 1, AsciiCritters.Adults[0]);

    const information = `Level: ${command.level}`
      + '\n' + renderAsciiMeter({ value: command.experience, valueMaximum: command.experienceMaximum, width: 24 })
      + '\n' + `XP: ${command.experience} / ${command.experienceMaximum}`;

    canvas.draw(30, 6, information);

    const text = canvas.render();
    this._outputChannel.replace(text);
  }

  dispose() {
    this._outputChannel.dispose();
  }

  static create(): ICritterRenderer {
    return new OutputChannelCritterRenderer();
  }
}

const AsciiArt = {
  CritterFrame: renderAsciiBox(26, 18),
};