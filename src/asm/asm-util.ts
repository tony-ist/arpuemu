import { ALIASES, DATA_MNEMONIC, INSTRUCTION_MNEMONICS } from './mnemonics.ts';

export function isInstruction(line: string) {
  return INSTRUCTION_MNEMONICS.some((mnemonic) => line.toUpperCase().startsWith(mnemonic));
}

export function isData(line: string) {
  return line.toUpperCase().startsWith(DATA_MNEMONIC);
}

export function isLabel(line: string) {
  return line.startsWith('.');
}

export function isAlias(line: string) {
  const tokens = line.split(' ');
  const alias = ALIASES[tokens[0].toUpperCase()];
  const mnemonic = tokens[0].toUpperCase();

  if (alias === undefined) {
    return false;
  }

  if (mnemonic === alias.mnemonic) {
    return tokens.length - 1 !== alias.operandTokens.length;
  }

  return true;
}

export function padHexByte(byte: string) {
  return byte.length === 1 ? '0' + byte : byte;
}

export function toHex(bytes: number[]) {
  return bytes.map((byte) => padHexByte(byte.toString(16).toUpperCase()));
}

export function fromHex(hex: string[]) {
  return hex.map((x) => parseInt(x, 16));
}

export function isDecimalNumber(token: string) {
  return /^[0-9]+$/.test(token);
}

export function isHexNumber(token: string) {
  return token.startsWith('0x');
}

export function isBinaryNumber(token: string) {
  return token.startsWith('0b');
}

export function isRegister(token:string) {
  return token.toUpperCase().startsWith('R');
}

export function isDefinition(line: string) {
  return line.toUpperCase().startsWith('@DEFINE');
}
