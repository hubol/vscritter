import { repeat } from '../lib/repeat';

interface DrawCommand {
  x: number;
  y: number;
  text: string;
}

interface CreateArgs {
  width: number;
  height: number;
}

export class AsciiCanvas {
  private readonly _commands: DrawCommand[] = [];

  readonly width: number;
  readonly height: number;

  private readonly _chars: string[][];

  private constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this._chars = [...new Array(this.height)].map(() => [...new Array<string>(this.width)]);
    this.clear();
  }

  static create(args: CreateArgs): AsciiCanvas {
    // TODO assert positive ints!
    return new AsciiCanvas(args.width, args.height);
  }

  clear() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this._chars[y][x] = ' ';
      }
    }
  }

  draw(x: number, y: number, text: string) {
    let xStart = x;

    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      if (char === '\n') {
        x = xStart;
        y += 1;
      }
      else if (char !== '\r' && x < this.width) {
        this._chars[y][x] = char;
        x += 1;
      }

      if (y >= this.height) {
        break;
      }
    }
  }

  render() {
    return this._chars.flatMap(row => row.join('')).join('\n');
  }
}
