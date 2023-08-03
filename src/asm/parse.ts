import { Operand } from './Operand.ts';
import { ParseError } from './ParseError.ts';
import { AsmLine } from './AsmLine.ts';
import {
  isAlias,
  isBinaryNumber,
  isData,
  isDecimalNumber,
  isHexNumber,
  isInstruction,
  isLabel,
  isRegister
} from './asm-util.ts';

export function parseAsmLine(line: string) {
  const mnemonic = parseMnemonic(line);
  const operands = parseOperands(line);
  return new AsmLine(mnemonic, operands);
}

export function parseMnemonic(line: string) {
  return line.split(' ')[0].toUpperCase();
}

function operandSizeInBitsByIndex(index: number) {
  if (index >= 3) {
    throw new ParseError('Only 3 operands are supported');
  }

  return index === 2 ? 8 : 2;
}

export function parseOperands(line: string) {
  const tokens = line.split(' ').slice(1);
  return tokens.map((token, index) => parseOperand(token, operandSizeInBitsByIndex(index)));
}

export function parseImmediateValue(token: string) {
  const tokenNoUnderscores = token.replace(/_/g, '');

  if (isDecimalNumber(tokenNoUnderscores)) {
     return parseInt(tokenNoUnderscores);
  }

  if (isHexNumber(tokenNoUnderscores)) {
    return parseInt(tokenNoUnderscores.slice(2), 16);
  }

  if (isBinaryNumber(tokenNoUnderscores)) {
    return parseInt(tokenNoUnderscores.slice(2), 2);
  }

  throw new ParseError(`Unrecognized immediate "${token}"`);
}

export function parseOperand(token: string, sizeInBits?: number) {
  if (isLabel(token)) {
    return Operand.fromLabel(token);
  }

  let immediate;
  
  if (isRegister(token)) {
    // Register R1 is first one
    immediate = parseInt(token[1]) - 1;
  } else {
    immediate = parseImmediateValue(token);
  }

  if (sizeInBits !== undefined && immediate >= Math.pow(2, sizeInBits)) {
    throw new ParseError(`Immediate value for operand "${token}" should fit in ${sizeInBits} bits`);
  }

  return Operand.fromImmediate(token, immediate);
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
