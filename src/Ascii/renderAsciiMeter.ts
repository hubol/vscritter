import { repeat } from "../lib/repeat";

interface RenderAsciiMeterArgs {
    value: number;
    valueMaximum: number;
    width: number;
}

const partialColumn = ["▒", "▓"];

export function renderAsciiMeter({ value, valueMaximum, width }: RenderAsciiMeterArgs) {
    const valuePerColumn = valueMaximum / width;

    let result = "";

    while (value > 0) {
        if (value >= valuePerColumn) {
            result += "█";
            value -= valuePerColumn;
        }
        else {
            const index = Math.floor(value / valuePerColumn * partialColumn.length);
            result += partialColumn[index];
            break;
        }
    }

    return result + repeat("░", width - result.length);
}
