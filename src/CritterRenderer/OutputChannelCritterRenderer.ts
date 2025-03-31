import * as vscode from 'vscode';
import { ICritterRenderer } from './ICritterRenderer';
import { ICritterState } from './CritterModel';
import { AsciiColumns } from '../Ascii/AsciiColumns';
import { AsciiCritters } from '../Ascii/AsciiCritters';
import { renderAsciiMeter } from '../Ascii/renderAsciiMeter';
import { AsciiCanvas } from '../Ascii/AsciiCanvas';
import { renderAsciiBox } from '../Ascii/renderAsciiBox';

const canvas = AsciiCanvas.create({ width: 100, height: 20 });

export class OutputChannelCritterRenderer implements ICritterRenderer {
  private readonly _outputChannel: vscode.OutputChannel;

  private constructor() {
    this._outputChannel = vscode.window.createOutputChannel('vscritter');
  }

  render(critter: ICritterState) {
    canvas.clear();
    canvas.draw(0, 0, AsciiArt.CritterFrame);
    canvas.draw(2, 2, AsciiCritters.Adults[0]);

    const information = `Level: ${critter.level}`
      + '\n' + renderAsciiMeter({ value: critter.experience, valueMaximum: critter.experienceMaximum, width: 24 });

    const xp = `XP: ${critter.experience} / ${critter.experienceMaximum}`;

    canvas.draw(32, 6, information);
    canvas.draw(56 - xp.length, 8, xp);

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
  CritterFrame: renderAsciiBox(28, 20),
};