import { repeat } from '../lib/repeat';

export class AsciiColumns {
  private constructor() {}

  static layout(gap: number, ...columms: string[]) {
    // TODO assert gap is positive int
    const gapText = repeat(' ', gap);

    const columnNormalizedRows = columms.map(column => {
      const rows = column.split('\n').map(row => row.replaceAll('\r', ''));
      const maxLength = rows.reduce((length, row) => Math.max(length, row.length), 0);
      const normalizedRows = rows.map(row => {
        while (row.length < maxLength) {
          row += ' ';
        } 
        return row;
      });

      return {
        maxLength,
        normalizedRows,
      };
    });

    let result = '';

    let i = 0;
    while (true) {
      let columnsContributedThisRowCount = 0;
      const line: string[] = [];

      for (const { maxLength, normalizedRows } of columnNormalizedRows) {
        if (normalizedRows.length <= i) {
          line.push(repeat(' ', maxLength));
          continue;
        } 

        line.push(normalizedRows[i]);
        columnsContributedThisRowCount++;
      }

      if (columnsContributedThisRowCount > 0) {
        result += '\n' + line.join(gapText);
        i++;
      }
      else {
        break;
      }
    }

    return result;
  }
}