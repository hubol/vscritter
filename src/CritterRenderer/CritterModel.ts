import { AdjustColor } from '../lib/AdjustColor';
import { cyclic } from '../lib/cyclic';

export interface ICritterState {
  readonly color: number
  readonly experience: number
  readonly experienceMaximum: number
  readonly heartbeats: number
  readonly level: number
  readonly style: number
}

export interface ISerializedCritterModel {
  color: number
  experience: number
  heartbeats: number
  level: number
  style: number
}

export class CritterModel implements ICritterState {
  color: number;
  experience: number;
  heartbeats: number;
  get experienceMaximum() {
    return 20 * Math.pow(2, this.level - 1);
  }
  level: number;
  style: number;

  private constructor(serialized: ISerializedCritterModel) {
    this.color = serialized.color;
    this.experience = serialized.experience;
    this.heartbeats = serialized.heartbeats;
    this.level = serialized.level;
    this.style = serialized.style;
  }

  gainExperience(amount: number) {
    // TODO better validation
    // Or use some type library
    if (!Number.isInteger(amount)) {
      throw new Error('CritterModel.gainExperience must be passed an integer!');
    }

    let levelsIncreased = 0;

    this.experience += amount;
    while (this.experience >= this.experienceMaximum) {
      const { h: previousHue } = AdjustColor.pixi(this.color).toHsv();
      const sign = Math.random() > 0.5 ? 1 : -1;
      const nextHue = cyclic(previousHue + (40 + Math.random() * 40) * sign, 0, 360);
      this.color = AdjustColor.hsv(nextHue, 70 + Math.random() * 30, 70 + Math.random() * 30).toPixi();
      this.experience -= this.experienceMaximum;
      this.level += 1;
      levelsIncreased += 1;
    }

    return {
      levelsIncreased,
    };
  }

  heartbeat() {
    this.heartbeats += 1;
  }

  static create(serialized: ISerializedCritterModel): Omit<CritterModel, keyof ICritterState> & ICritterState {
    return new CritterModel(sanitizeModel(serialized));
  }

  serialize(): ISerializedCritterModel {
    return {
      color: this.color,
      experience: this.experience,
      heartbeats: this.heartbeats,
      level: this.level,
      style: this.style,
    };
  }
}

function sanitizeModel(model: ISerializedCritterModel): ISerializedCritterModel {
  // TODO log warnings
  // maybe pull in some silly library
  return {
    color: sanitizeInteger(model.color, 0xff0000),
    experience: sanitizeInteger(model.experience, 0),
    heartbeats: sanitizeInteger(model.heartbeats, 0),
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