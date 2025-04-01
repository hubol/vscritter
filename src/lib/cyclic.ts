export function cyclic(value: number, min: number, max: number) {
    value = (value - min) % (max - min);
    if (value < 0) {
        value += max - min;
    }
    return value + min;
}
