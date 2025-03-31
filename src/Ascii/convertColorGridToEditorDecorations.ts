import * as vscode from 'vscode';
import { Color, ColorGrid } from './AsciiCanvas';

export function convertColorGridToEditorDecorations(colors: ColorGrid) {
  // Kind of awkward...
  const height = colors.length;
  const width = colors[0].length;

  let currentColor: Color = null;
  let decorationType: vscode.TextEditorDecorationType | null = null;
  let startPosition: vscode.Position | null = null;

  const decorationRanges = new Map<vscode.TextEditorDecorationType, vscode.Range[]>();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = colors[y][x];

      if (currentColor === color) {
        continue;
      }

      if (startPosition) {
        decorationRanges.get(decorationType!)!.push(new vscode.Range(startPosition!, getPosition(x, y)));
        startPosition = null;

        if (color === null) {
          currentColor = null;
          decorationType = null;
          continue;
        }
      }

      if (!startPosition) {
        currentColor = color;
        decorationType = getDecorationType(color!);
        startPosition = getPosition(x, y);
        if (!decorationRanges.has(decorationType)) {
          decorationRanges.set(decorationType, []);
        }
      }
    }
  }

  return decorationRanges;
}

export type EditorDecorationsFromColorGrid = ReturnType<typeof convertColorGridToEditorDecorations>;

function getPosition(x: number, y: number) {
  if (!positionsCache[x]) {
    positionsCache[x] = [];
  }
  if (!positionsCache[x][y]) {
    positionsCache[x][y] = new vscode.Position(y, x);
  }

  return positionsCache[x][y];
}

function getDecorationType(color: number) {
  if (!decorationTypesCache[color]) {
    decorationTypesCache[color] = vscode.window.createTextEditorDecorationType({ color: toHexColorString(color) });
  }

  return decorationTypesCache[color];
}

const positionsCache: vscode.Position[][] = [];
const decorationTypesCache: Record<number, vscode.TextEditorDecorationType> = {};

function toHexColorString(rgbInteger: number) {
  const hex = '000000' + rgbInteger.toString(16);
  return '#' + hex.substring(6);
}

export function getAllDecorationTypes() {
  return Object.values(decorationTypesCache);
}