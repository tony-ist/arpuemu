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
import { ALIAS_OPERAND, ALIASES } from './mnemonics.ts';

export function parseAsmLine(line: string) {
  const mnemonic = parseMnemonic(line);
  const operands = parseOperands(line);

  if (isAlias(line)) {
    const alias = ALIASES[mnemonic];
    const targetMnemonic = alias.mnemonic;
    const targetOperands: Operand[] = [];
    let operandIndex = 0;
    for (const targetOperandToken of alias.operandTokens) {
      if (targetOperandToken === ALIAS_OPERAND) {
        targetOperands.push(operands[operandIndex]);
        if (operandIndex < operands.length - 1) {
          operandIndex += 1;
        }
      } else {
        targetOperands.push(parseOperand(targetOperandToken));
      }
    }
    return new AsmLine(targetMnemonic, targetOperands, mnemonic, operands);
  }

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

export function parseAsmLines(asmCode: string[]) {
  const result: AsmLine[] = [];
  let label: string | null = null;

  for (const line of asmCode) {
    if (isInstruction(line) || isData(line) || isAlias(line)) {
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
