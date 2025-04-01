import { ICritterData } from "@/domain/CritterModel";
import { MaturationService } from "@/domain/MaturationService";
import { AdjustColor } from "@/lib/AdjustColor";
import { ReadonlyDeep } from "type-fest";
import { z } from "zod";

export interface ICaretakerData {
    records: {
        experienceTotal: number;
        crittersRaisedToAdulthood: number;
    };
    session: {
        critters: ICritterData[];
        experience: number;
        level: number;
        startDate: Date;
    };
}

type ProgrammerActivity = "code_change";

export interface ICaretakerState {
    records: ReadonlyDeep<ICaretakerData["records"]>;
    session: ReadonlyDeep<ICaretakerData["session"] & { experienceMaximum: number }>;
}

interface ICaretakerModel {
    gainExperienceFromActivity(activity: ProgrammerActivity): void;
    heartbeat(): void;

    getState(): ICaretakerState;
}

function createCritterData(): ICritterData {
    return {
        age: "baby",
        color: AdjustColor.hsv(Math.random() * 360, 70 + Math.random() * 30, 70 + Math.random() * 30).toPixi(),
        heartbeats: 0,
        style: Math.floor(Math.random() * 1024),
    };
}

export function getDefaultCaretakerData(): ICaretakerData {
    return {
        records: {
            crittersRaisedToAdulthood: 0,
            experienceTotal: 0,
        },
        session: {
            critters: [createCritterData()],
            experience: 0,
            level: 1,
            startDate: new Date(),
        },
    };
}

const critterDataSchema = z.object({
    age: z.enum(["baby", "child", "adult"]),
    color: z.number().int().min(0).max(0xffffff),
    heartbeats: z.number().int().min(0),
    style: z.number().int().min(0),
});

const caretakerDataSchema = z.object({
    records: z.object({
        experienceTotal: z.number().int().min(0),
        crittersRaisedToAdulthood: z.number().int().min(0),
    }),
    session: z.object({
        experience: z.number().int().min(0),
        critters: z.array(critterDataSchema).min(1),
        level: z.number().int().min(1),
        startDate: z.date(),
    }),
});

export class CaretakerModel implements ICaretakerModel {
    private readonly _records: ICaretakerData["records"];
    private readonly _session: ICaretakerData["session"];

    private get _experienceMaximum() {
        return Math.round(10 * Math.pow(1.2, this._session.level - 1));
    }

    private constructor(data: ICaretakerData) {
        this._records = data.records;
        this._session = data.session;
    }
    getState(): ICaretakerState {
        return {
            records: this._records,
            session: {
                ...this._session,
                experienceMaximum: this._experienceMaximum,
            },
        };
    }

    gainExperienceFromActivity() {
        // TODO could/should be based on activity
        // could/should it be based on number of critters? is that cool at all? haha
        const experienceEarned = 1;

        let levelsIncreased = 0;

        this._session.experience += experienceEarned;
        this._records.experienceTotal += experienceEarned;

        while (this._session.experience >= this._experienceMaximum) {
            const critterToMature = this._session.critters.find(critter => critter.age !== "adult");
            if (critterToMature) {
                const maturedCritter = MaturationService.mature(critterToMature);
                if (maturedCritter.age === "adult") {
                    this._records.crittersRaisedToAdulthood += 1;
                }
            }
            else {
                this._session.critters.unshift(createCritterData());
            }
            this._session.experience -= this._experienceMaximum;
            this._session.level += 1;
            levelsIncreased += 1;
        }
    }

    heartbeat() {
        for (const critter of this._session.critters) {
            critter.heartbeats += 1;
        }

        // TODO check date and reset!
    }

    static create(unparsedData: ICaretakerData): ICaretakerModel {
        const parsed = caretakerDataSchema.safeParse(unparsedData);
        const data = parsed.data
            ? parsed.data
            : (console.error(`Failed to parse ICaretakerData`, parsed.error), getDefaultCaretakerData());
        return new CaretakerModel(data);
    }

    serialize(): ICaretakerData {
        return {
            records: this._records,
            session: this._session,
        };
    }
}
