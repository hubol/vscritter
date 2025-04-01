import { AdjustColor } from "@/lib/AdjustColor";
import { cyclic } from "@/lib/cyclic";
import { CritterAge, ICritterData } from "./CritterModel";

export class MaturationService {
    private constructor() {}

    static mature(critter: ICritterData) {
        critter.age = getMaturedAge(critter.age);
        critter.color = getMaturedColor(critter.color);
        return critter;
    }
}

function getMaturedAge(age: CritterAge) {
    switch (age) {
        case "baby":
            return "child";
        case "child":
        case "adult":
        default:
            return "adult";
    }
}

function getMaturedColor(color: number) {
    const { h: previousHue } = AdjustColor.pixi(color).toHsv();
    const sign = Math.random() > 0.5 ? 1 : -1;
    const nextHue = cyclic(previousHue + (40 + Math.random() * 40) * sign, 0, 360);
    return AdjustColor.hsv(nextHue, 70 + Math.random() * 30, 70 + Math.random() * 30).toPixi();
}
