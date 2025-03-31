export function repeat(text: string, length: number) {
  let result = '';
  while (result.length < length) {
    result += text;
  }

  return result;
}