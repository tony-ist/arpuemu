import { ALIASES, DATA_MNEMONIC, INSTRUCTION_MNEMONICS } from './instructions.ts';

export function isInstruction(line: string) {
  return INSTRUCTION_MNEMONICS.some((mnemonic) => line.startsWith(mnemonic));
}

export function isData(line: string) {
  return line.startsWith(DATA_MNEMONIC);
}

export function isLabel(line: string) {
  return line.startsWith('.');
}

export function isAlias(line: string) {
  return Object.keys(ALIASES).some((alias) => line.startsWith(alias));
}

export function toHex(bytes: number[]) {
  return bytes.map((byte) => byte.toString(16).toUpperCase());
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
  return token.startsWith('R');
}
