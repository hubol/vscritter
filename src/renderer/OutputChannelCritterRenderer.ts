import { ICaretakerState } from "@/domain/CaretakerModel";
import { ICritterData } from "@/domain/CritterModel";
import { repeat } from "@/lib/repeat";
import { AsciiCanvas } from "@/renderer/ascii/AsciiCanvas";
import { AsciiCritters } from "@/renderer/ascii/AsciiCritters";
import { renderAsciiBox } from "@/renderer/ascii/renderAsciiBox";
import { renderAsciiMeter } from "@/renderer/ascii/renderAsciiMeter";
import { ICritterRenderer } from "@/renderer/ICritterRenderer";
import { OutputChannelRenderTarget } from "@/renderer/OutputChannelRenderTarget";

const canvas = AsciiCanvas.create({ width: 70, height: 16 });

export class OutputChannelCritterRenderer implements ICritterRenderer {
    private readonly _renderTarget: OutputChannelRenderTarget;

    private constructor() {
        this._renderTarget = new OutputChannelRenderTarget("vscritter");
    }

    render(caretaker: ICaretakerState) {
        canvas.clear();

        const { critters } = caretaker.session;

        const critter = critters[0];
        // This should always be the case...
        if (critter) {
            const x = 3
                + Math.round(Math.sin(critter.heartbeats * (Math.PI / 8)) * 7);
            const y = Math.round(Math.cos(critter.heartbeats * (Math.PI / 10) + 1) * 2)
                + (critter.age === "adult" ? -3 : -6);

            drawCritterBack(critter, x, y);
            canvas.draw(0, 0, AsciiArt.CritterFrame);
            drawCritterFront(critter, x, y);
        }

        const level = `Level: ${caretaker.session.level}`;
        const meter = renderAsciiMeter({
            value: caretaker.session.experience,
            valueMaximum: caretaker.session.experienceMaximum,
            width: 24,
        });
        const xp = `XP: ${caretaker.session.experience} / ${caretaker.session.experienceMaximum}`;

        canvas.draw(38, 3, level);
        canvas.draw(38, 4, meter, getXpMeterColor(caretaker));
        canvas.draw(62 - xp.length, 5, xp);

        if (critters.length > 1) {
            const crittersText = `Critters: ${critters.length}`;
            canvas.draw(38, 8, crittersText);
            let x = 0;
            let y = 0;
            for (let i = 1; i < critters.length; i++) {
                drawCritterTiny(critters[i], 38 + x, 9 + y);
                x += 1;
                if (x >= 24) {
                    x = 0;
                    y += 1;
                }
            }
        }

        const { text, colors } = canvas.render();
        this._renderTarget.fill(text, colors);
    }

    dispose() {
        this._renderTarget.dispose();
    }

    static create(): ICritterRenderer {
        return new OutputChannelCritterRenderer();
    }
}

function drawCritterBack(critter: ICritterData, x: number, y: number) {
    canvas.draw(x + 7, y + 16, repeat("░", 15 - critter.heartbeats % 3));
    canvas.draw(x + 6, y + 17, repeat("░", 16 + critter.heartbeats % 2));
    canvas.draw(x + 7, y + 18, repeat("░", 12));

    const texture = getTexture(critter);
    canvas.erase(x + 1, y + 2, texture);
    canvas.erase(x + 3, y + 2, texture);
    canvas.erase(x + 2, y + 1, texture);
    canvas.erase(x + 2, y + 3, texture);
    canvas.draw(x + 2, y + 2, texture, critter.color);
}

function drawCritterFront(critter: ICritterData, x: number, y: number) {
    const texture = getTexture(critter);
    canvas.erase(x + 1, y + 2, texture);
    canvas.erase(x + 3, y + 2, texture);
    canvas.erase(x + 2, y + 1, texture);
    canvas.erase(x + 2, y + 3, texture);
    canvas.draw(x + 2, y + 2, texture, critter.color);
}

const TinyAscii = [
    ["▖", "▗", "▘", "▝", "█"],
    ["▙", "▛", "▜", "▟", "█"],
    ["▚", "▞", "█"],
    ["▀", "▄", "█"],
];

function drawCritterTiny(critter: ICritterData, x: number, y: number) {
    const options = TinyAscii[critter.style % TinyAscii.length];
    const text = options[critter.heartbeats % options.length];
    canvas.draw(x, y, text, critter.color);
}

function getTextureGrid(critter: ICritterData) {
    switch (critter.age) {
        case "baby":
            return AsciiCritters.Babies;
        case "child":
            return AsciiCritters.Children;
        default:
            return AsciiCritters.Adults;
    }
}

function getTexture(critter: ICritterData) {
    const grid = getTextureGrid(critter);
    const strip = grid[critter.style % grid.length];

    return strip[critter.heartbeats % strip.length];
}

function getXpMeterColor(critter: ICaretakerState) {
    const unit = critter.session.experience / critter.session.experienceMaximum;
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
    CritterFrame: renderAsciiBox(70, 16, AsciiCanvas.Transparent),
};
