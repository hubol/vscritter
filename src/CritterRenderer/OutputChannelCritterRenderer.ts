import * as vscode from 'vscode';
import { ICritterRenderer } from './ICritterRenderer';
import { ICritterState } from './CritterModel';
import { AsciiColumns } from '../Ascii/AsciiColumns';
import { AsciiCritters } from '../Ascii/AsciiCritters';
import { renderAsciiMeter } from '../Ascii/renderAsciiMeter';
import { AsciiCanvas } from '../Ascii/AsciiCanvas';
import { renderAsciiBox } from '../Ascii/renderAsciiBox';
import { getAllDecorationTypes } from '../Ascii/convertColorGridToEditorDecorations';

const canvas = AsciiCanvas.create({ width: 100, height: 20 });

const empty: vscode.Range[] = [];

export class OutputChannelCritterRenderer implements ICritterRenderer {
  private readonly _outputChannel: vscode.OutputChannel;

  private constructor() {
    this._outputChannel = vscode.window.createOutputChannel('vscritter');
  }

  render(critter: ICritterState) {
    canvas.clear();
    canvas.draw(0, 0, AsciiArt.CritterFrame);
    canvas.draw(2, 2, AsciiCritters.Adults[0], 0xff0000);

    const level = `Level: ${critter.level}`;
    const meter = renderAsciiMeter({ value: critter.experience, valueMaximum: critter.experienceMaximum, width: 24 });
    const xp = `XP: ${critter.experience} / ${critter.experienceMaximum}`;

    canvas.draw(32, 6, level);
    canvas.draw(32, 7, meter, getXpMeterColor(critter));
    canvas.draw(56 - xp.length, 8, xp);

    const { text, decorations } = canvas.render();
    this._outputChannel.replace(text);

    const textEditor = vscode.window.visibleTextEditors.find(editor => editor?.document?.fileName.includes('vscritter') && editor.document.fileName.includes('extension-output'));
    if (textEditor?.setDecorations) {
      for (const decorationType of getAllDecorationTypes()) {
        textEditor.setDecorations(decorationType, empty);
      }
      for (const { decorationType, ranges } of decorations) {
        textEditor.setDecorations(decorationType, ranges);
      }
    }
  }

  dispose() {
    this._outputChannel.dispose();
  }

  static create(): ICritterRenderer {
    return new OutputChannelCritterRenderer();
  }
}

function getXpMeterColor(critter: ICritterState) {
  const unit = critter.experience / critter.experienceMaximum;
  if (unit < 0.1) {
    return 0x901800;
  }
  if (unit < 0.3) {
    return 0xf07000;
  }
  if (unit < 0.6) {
    return 0xf0b800;
  }
  if (unit < 0.8) {
    return 0x98db2c;
  }
  return 0x45b305;
}

const AsciiArt = {
  CritterFrame: renderAsciiBox(28, 20).text,
};