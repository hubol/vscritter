import { repeat } from "@/lib/repeat";
import { AsciiCanvas } from "@/renderer/ascii/AsciiCanvas";

export function renderAsciiBox(width: number, height: number, fillCharacter: string) {
    const canvas = AsciiCanvas.create({ width, height });
    canvas.draw(0, 0, "╔");
    canvas.draw(width - 1, 0, "╗");
    canvas.draw(0, height - 1, "╚");
    canvas.draw(width - 1, height - 1, "╝");

    for (let x = 1; x < width - 1; x++) {
        canvas.draw(x, 0, "═");
        canvas.draw(x, height - 1, "═");
    }

    const fillRow = repeat("z", width - 1);

    for (let y = 1; y < height - 1; y++) {
        canvas.draw(0, y, "║");
        canvas.draw(1, y, fillRow);
        canvas.draw(width - 1, y, "║");
    }

    return canvas.render().text.replaceAll("z", fillCharacter);
}
