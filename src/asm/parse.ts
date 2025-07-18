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
  isRegister,
  isDefinition
} from './asm-util.ts';
import { ALIAS_OPERAND, ALIASES } from './mnemonics.ts';

export function parseAsmLine(line: string, definitions: { [key: string]: string } = {}) {
  const mnemonic = parseMnemonic(line);
  const operands = parseOperands(line, definitions);

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
        targetOperands.push(parseOperand(targetOperandToken, definitions));
      }
    }
    return new AsmLine(targetMnemonic, targetOperands, mnemonic, operands);
  }

  return new AsmLine(mnemonic, operands);
}

export function parseMnemonic(line: string) {
  return line.split(' ')[0].toUpperCase();
}

export function parseOperands(line: string, definitions: { [key: string]: string } = {}) {
  const tokens = line.split(' ').slice(1);
  return tokens.map((token) => parseOperand(token, definitions));
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

export function parseOperand(token: string, definitions: { [key: string]: string } = {}) {
  if (isLabel(token)) {
    return Operand.fromLabel(token);
  }

  // Check if token is a definition reference
  if (token.startsWith('@')) {
    const definitionName = token.slice(1);
    const definitionValue = definitions[definitionName];
    if (definitionValue !== undefined) {
      return parseOperand(definitionValue, definitions);
    }
    throw new ParseError(`Undefined definition "${token}"`);
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

export function parseAsmLines(asmCode: string[], definitions: { [key: string]: string } = {}) {
  const result: AsmLine[] = [];
  let label: string | null = null;

  for (const line of asmCode) {
    if (isInstruction(line) || isData(line) || isAlias(line)) {
      const asmLine = parseAsmLine(line, definitions);
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

export function parseDefinitions(asmCode: string[]) {
  const result: { [key: string]: string } = {};
  for (const line of asmCode) {
    if (isDefinition(line)) {
      const definition = parseDefinition(line);
      result[definition.name] = definition.value;
    }
  }
  return result;
}

export function parseDefinition(line: string) {
  const tokens = line.split(' ');
  if (tokens.length !== 3) {
    throw new ParseError(`Invalid definition format: "${line}". Expected: @DEFINE NAME VALUE`);
  }
  
  const name = tokens[1];
  const value = tokens[2];
  
  return { name, value };
}
