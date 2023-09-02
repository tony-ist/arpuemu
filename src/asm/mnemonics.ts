export const DATA_MNEMONIC = 'DW';
export const INSTRUCTION_MNEMONICS = [
  'ADD',
  'SUB',
  'RSH',
  'INC',
  'DEC',
  'BIT',
  'CAL',
  'RET',
  'PST',
  'PLD',
  'IMM',
  'STR',
  'LOD',
  'SOP',
  'BRA',
  'MOV',
];
export const ALL_MNEMONICS = [DATA_MNEMONIC, ...INSTRUCTION_MNEMONICS];
export const EXTRA_BYTE_INSTRUCTIONS = [
  'BIT',
  'IMM',
  'BRA',
];
export const ALIASES: { [key: string]: string } = {
  'JMP': 'BRA 0 0',
  'JZ': 'BRA 0 0b10',
  'JNZ': 'BRA 0 0b11',
  'JC': 'BRA 1 0b10',
  'JNC': 'BRA 1 0b11',
  'JMB': 'BRA 2 0b10',
  'JNM': 'BRA 2 0b11',
  'JLB': 'BRA 3 0b10',
  'JNL': 'BRA 3 0b11',
};
