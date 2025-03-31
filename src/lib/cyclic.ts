export function cyclic(value: number, min: number, max: number) {
  while (value < min) {
    value += max - min;
  }
  return value > max ? (min + value % (max - min)) : value;
}