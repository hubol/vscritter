export interface ICritterState {
  readonly experience: number
  readonly experienceMaximum: number
  readonly level: number
  readonly style: number
}

export interface ISerializedCritterModel {
  experience: number
  level: number
  style: number
}

export class CritterModel implements ICritterState {
  experience: number;
  get experienceMaximum() {
    return Math.pow(10, this.level);
  }
  level: number;
  style: number;

  private constructor(serialized: ISerializedCritterModel) {
    this.experience = serialized.experience;
    this.level = serialized.level;
    this.style = serialized.style;
  }

  static create(serialized: ISerializedCritterModel) {
    return new CritterModel(sanitizeModel(serialized));
  }

  serialize(): ISerializedCritterModel {
    return {
      experience: this.experience,
      level: this.level,
      style: this.style,
    };
  }
}

function sanitizeModel(model: ISerializedCritterModel): ISerializedCritterModel {
  // TODO log warnings
  // maybe pull in some silly library
  return {
    experience: sanitizeInteger(model.experience, 0),
    level: sanitizeInteger(model.level, 0),
    style: sanitizeInteger(model.level, 32), // TODO rng?
  };
}

function sanitizeInteger(value: unknown, defaultValue: number) {
  if (typeof value !== 'number' || isNaN(value) || !Number.isInteger(value)) {
    return defaultValue;
  }

  return value;
}