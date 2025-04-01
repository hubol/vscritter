import { AsciiCanvas } from "@/Ascii/AsciiCanvas";
import { AsciiCritters } from "@/Ascii/AsciiCritters";
import { renderAsciiBox } from "@/Ascii/renderAsciiBox";
import { renderAsciiMeter } from "@/Ascii/renderAsciiMeter";
import { ICritterRenderer } from "@/CritterRenderer/ICritterRenderer";
import { OutputChannelRenderTarget } from "@/CritterRenderer/OutputChannelRenderTarget";
import { ICaretakerState } from "@/domain/CaretakerModel";
import { ICritterData } from "@/domain/CritterModel";
import { repeat } from "@/lib/repeat";

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
            canvas.draw(38, 6, crittersText);
            let x = 0;
            let y = 0;
            for (let i = 1; i < critters.length; i++) {
                const critter = critters[i];
                canvas.draw(38 + x, 7 + y, "█", critter.color);
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
    const textureSheet = getTextureSheet(critter);
    const texture = textureSheet[critter.heartbeats % textureSheet.length];
    canvas.erase(x + 1, y + 2, texture);
    canvas.erase(x + 3, y + 2, texture);
    canvas.erase(x + 2, y + 1, texture);
    canvas.erase(x + 2, y + 3, texture);
    canvas.draw(x + 2, y + 2, texture, critter.color);
}

function drawCritterFront(critter: ICritterData, x: number, y: number) {
    const textureSheet = getTextureSheet(critter);
    const texture = textureSheet[critter.heartbeats % textureSheet.length];
    canvas.erase(x + 1, y + 2, texture);
    canvas.erase(x + 3, y + 2, texture);
    canvas.erase(x + 2, y + 1, texture);
    canvas.erase(x + 2, y + 3, texture);
    canvas.draw(x + 2, y + 2, texture, critter.color);
}

function getTextureSheet(critter: ICritterData) {
    switch (critter.age) {
        case "baby":
            return AsciiCritters.Babies;
        case "child":
            return AsciiCritters.Children;
        default:
            return AsciiCritters.Adults.Style1;
    }
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
