export type CritterAge = "baby" | "child" | "adult";

export interface ICritterData {
    color: number;
    heartbeats: number;
    age: CritterAge;
    style: number;
}
