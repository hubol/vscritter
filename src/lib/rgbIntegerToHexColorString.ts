export function rgbIntegerToHexColorString(rgbInteger: number) {
    const hex = "000000" + rgbInteger.toString(16);
    return "#" + hex.substring(hex.length - 6);
}
