import { Operand } from './Operand.ts';
import { ParseError } from './ParseError.ts';
import { AsmLine } from './AsmLine.ts';
import { isAlias, isData, isInstruction, isLabel } from './util.ts';

export function parseAsmLine(line: string) {
  const mnemonic = parseMnemonic(line);
  const operands = parseOperands(line);
  return new AsmLine(mnemonic, operands);
}

export function parseMnemonic(line: string) {
  return line.split(' ')[0];
}

function operandSizeBitsByIndex(index: number) {
  if (index >= 3) {
    throw new ParseError('Only 3 operands are supported');
  }

  return index === 2 ? 8 : 2;
}

export function parseOperands(line: string) {
  const tokens = line.split(' ').slice(1);
  return tokens.map((token, index) => new Operand(token, operandSizeBitsByIndex(index)));
}

export function parseAsmLines(asmCode: string[]) {
  const result: AsmLine[] = [];
  let label: string | null = null;

  for (const line of asmCode) {
    if (isInstruction(line) || isData(line)) {
      const asmLine = parseAsmLine(line);
      if (label !== null) {
        asmLine.setLabel(label);
        label = null;
      }
      result.push(asmLine);
    } else if (isLabel(line)) {
      label = line;
    } else if (isAlias(line)) {
      // TODO
      label = null;
    } else {
      throw new ParseError(`Unrecognized line "${line}"`);
    }
  }

  return result;
}
