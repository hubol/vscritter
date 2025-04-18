interface DrawCommand {
    x: number;
    y: number;
    text: string;
}

interface CreateArgs {
    width: number;
    height: number;
}

export type Color = number | null;

export type ColorGrid = ReadonlyArray<ReadonlyArray<Color>>;

export class AsciiCanvas {
    private readonly _commands: DrawCommand[] = [];

    readonly width: number;
    readonly height: number;

    private readonly _chars: string[][];
    private readonly _colors: Color[][];

    private constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this._chars = [...new Array(this.height)].map(() => [...new Array<string>(this.width)]);
        this._colors = [...new Array(this.height)].map(() => [...new Array<number>(this.width)]);
        this.clear();
    }

    static readonly Transparent = "`";

    static create(args: CreateArgs): AsciiCanvas {
        // TODO assert positive ints!
        return new AsciiCanvas(args.width, args.height);
    }

    clear() {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this._chars[y][x] = " ";
                this._colors[y][x] = null;
            }
        }
    }

    draw(x: number, y: number, text: string, color: Color = null) {
        let xStart = x;

        for (let i = 0; i < text.length; i++) {
            if (y >= this.height) {
                break;
            }

            const char = text.charAt(i);
            if (char === "\n") {
                x = xStart;
                y += 1;
            }
            else if (char !== "\r") {
                if (char !== AsciiCanvas.Transparent && x >= 0 && x < this.width && y >= 0) {
                    this._chars[y][x] = char;
                    this._colors[y][x] = color;
                }
                x += 1;
            }
        }
    }

    erase(x: number, y: number, text: string) {
        let xStart = x;

        for (let i = 0; i < text.length; i++) {
            if (y >= this.height) {
                break;
            }

            const char = text.charAt(i);
            if (char === "\n") {
                x = xStart;
                y += 1;
            }
            else if (char !== "\r") {
                if (char !== AsciiCanvas.Transparent && x >= 0 && x < this.width && y >= 0) {
                    this._chars[y][x] = " ";
                }
                x += 1;
            }
        }
    }

    render() {
        const text = this._chars.flatMap(row => row.join("")).join("\n");

        return {
            text,
            colors: this._colors as ColorGrid,
        };
    }
}
