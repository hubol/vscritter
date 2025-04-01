import { AsciiCanvas } from "@/Ascii/AsciiCanvas";
import { AsciiCritters } from "@/Ascii/AsciiCritters";
import { renderAsciiBox } from "@/Ascii/renderAsciiBox";
import { renderAsciiMeter } from "@/Ascii/renderAsciiMeter";
import { ICritterState } from "@/CritterRenderer/CritterModel";
import { ICritterRenderer } from "@/CritterRenderer/ICritterRenderer";
import { OutputChannelRenderTarget } from "@/CritterRenderer/OutputChannelRenderTarget";
import { repeat } from "@/lib/repeat";

const canvas = AsciiCanvas.create({ width: 70, height: 16 });

export class OutputChannelCritterRenderer implements ICritterRenderer {
    private readonly _renderTarget: OutputChannelRenderTarget;

    private constructor() {
        this._renderTarget = new OutputChannelRenderTarget("vscritter");
    }

    render(critter: ICritterState) {
        canvas.clear();

        {
            const x = 3 + Math.round(Math.sin(critter.heartbeats * (Math.PI / 8)) * 7);
            const y = Math.round(Math.cos(critter.heartbeats * (Math.PI / 10) + 1) * 2) - 6 + critter.level;
            const textureSheet = getTextureSheet(critter);
            const texture = textureSheet[critter.heartbeats % textureSheet.length];
            canvas.draw(x + 7, y + 16, repeat("░", 15 - critter.heartbeats % 3));
            canvas.draw(x + 6, y + 17, repeat("░", 16 + critter.heartbeats % 2));
            canvas.draw(x + 7, y + 18, repeat("░", 12));

            canvas.draw(0, 0, AsciiArt.CritterFrame);

            canvas.erase(x + 1, y + 2, texture);
            canvas.erase(x + 3, y + 2, texture);
            canvas.erase(x + 2, y + 1, texture);
            canvas.erase(x + 2, y + 3, texture);
            canvas.draw(x + 2, y + 2, texture, critter.color);
        }

        const level = `Level: ${critter.level}`;
        const meter = renderAsciiMeter({
            value: critter.experience,
            valueMaximum: critter.experienceMaximum,
            width: 24,
        });
        const xp = `XP: ${critter.experience} / ${critter.experienceMaximum}`;

        canvas.draw(38, 3, level);
        canvas.draw(38, 4, meter, getXpMeterColor(critter));
        canvas.draw(62 - xp.length, 5, xp);

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

function getTextureSheet(critter: ICritterState) {
    switch (critter.level) {
        case 1:
            return AsciiCritters.Babies;
        case 2:
            return AsciiCritters.Children;
        default:
            return AsciiCritters.Adults.Style1;
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
    CritterFrame: renderAsciiBox(70, 16, AsciiCanvas.Transparent),
};
