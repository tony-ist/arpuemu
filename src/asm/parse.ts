import { Operand } from './Operand.ts';
import { ParseError } from './ParseError.ts';
import { AsmLine } from './AsmLine.ts';
import { isAlias, isData, isInstruction, isLabel } from './util.ts';

function parseMnemonic(line: string) {
  return line.split(' ')[0];
}

function parseOperands(line: string) {
  const tokens = line.split(' ').slice(1);
  return tokens.map((token, index) => new Operand(token, index));
}

export function parseAsmLines(asmCode: string[]) {
  let label: string | null = null;

  for (const line of asmCode) {
    if (isInstruction(line)) {
      const mnemonic = parseMnemonic(line);
      const operands = parseOperands(line);
      const asmLine = new AsmLine(mnemonic, operands);
      if (label !== null) {
        asmLine.setLabel(label);
        label = null;
      }
    } else if (isData(line)) {
      label = null;
    } else if (isLabel(line)) {
      label = line;
    } else if (isAlias(line)) {
      label = null;
    } else {
      throw new ParseError(`Unrecognized line "${line}"`);
    }
  }
  return [];
}
