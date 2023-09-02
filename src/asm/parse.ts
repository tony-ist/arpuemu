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
import { ALIASES } from './mnemonics.ts';

export function parseAsmLine(line: string) {
  const mnemonic = parseMnemonic(line);
  const operands = parseOperands(line);
  return new AsmLine(mnemonic, operands);
}

export function parseMnemonic(line: string) {
  return line.split(' ')[0].toUpperCase();
}

export function parseOperands(line: string) {
  const tokens = line.split(' ').slice(1);
  return tokens.map((token) => parseOperand(token));
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

export function parseOperand(token: string) {
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

  return Operand.fromImmediate(token, immediate);
}

export function replaceAliases(asmCode: string[]) {
  const result: string[] = [];

  for (const line of asmCode) {
    if (!isAlias(line)) {
      result.push(line);
      continue;
    }
    const alias = Object.keys(ALIASES).find((a) => line.toUpperCase().startsWith(a));
    if (alias === undefined) {
      throw new Error(`Line ${line} is alias but there is no such key in ALIASES`);
    }
    const replaced = line.replace(new RegExp(alias, 'i'), ALIASES[alias]);
    result.push(replaced);
  }

  return result;
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
    } else {
      throw new ParseError(`Unrecognized line "${line}"`);
    }
  }

  return result;
}
