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