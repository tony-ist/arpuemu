export const ALIAS_OPERAND = '%';
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

export const EXTRA_BYTE_INSTRUCTIONS = [
  'BIT',
  'IMM',
  'BRA',
  'CAL',
];

export interface TargetInstruction {
  mnemonic: string;
  operandTokens: string[];
}

export const ALIASES: {[key: string]: TargetInstruction } = {
  JMP: {
    mnemonic: 'BRA',
    operandTokens: ['0', '0', ALIAS_OPERAND],
  },
  JZ: {
    mnemonic: 'BRA',
    operandTokens: ['0', '0b10', ALIAS_OPERAND],
  },
  JNZ: {
    mnemonic: 'BRA',
    operandTokens: ['0', '0b11', ALIAS_OPERAND],
  },
  JC: {
    mnemonic: 'BRA',
    operandTokens: ['1', '0b10', ALIAS_OPERAND],
  },
  JNC: {
    mnemonic: 'BRA',
    operandTokens: ['1', '0b11', ALIAS_OPERAND],
  },
  JMB: {
    mnemonic: 'BRA',
    operandTokens: ['2', '0b10', ALIAS_OPERAND],
  },
  JNM: {
    mnemonic: 'BRA',
    operandTokens: ['2', '0b11', ALIAS_OPERAND],
  },
  JLB: {
    mnemonic: 'BRA',
    operandTokens: ['3', '0b10', ALIAS_OPERAND],
  },
  JNL: {
    mnemonic: 'BRA',
    operandTokens: ['3', '0b11', ALIAS_OPERAND],
  },
  IMM: {
    mnemonic: 'IMM',
    operandTokens: [ALIAS_OPERAND, '0', ALIAS_OPERAND]
  },
  CAL: {
    mnemonic: 'CAL',
    operandTokens: ['0', '0', ALIAS_OPERAND],
  },
  PUSH: {
    mnemonic: 'SOP',
    operandTokens: [ALIAS_OPERAND, '0'],
  },
  POP: {
    mnemonic: 'SOP',
    operandTokens: [ALIAS_OPERAND, '2'],
  },
  INC: {
    mnemonic: 'INC',
    operandTokens: [ALIAS_OPERAND, ALIAS_OPERAND]
  },
  DEC: {
    mnemonic: 'DEC',
    operandTokens: [ALIAS_OPERAND, ALIAS_OPERAND]
  },
  AND: {
    mnemonic: 'BIT',
    operandTokens: [ALIAS_OPERAND, ALIAS_OPERAND, '0b0100_0000'],
  },
  NAND: {
    mnemonic: 'BIT',
    operandTokens: [ALIAS_OPERAND, ALIAS_OPERAND, '0b1100_0000'],
  },
  OR: {
    mnemonic: 'BIT',
    operandTokens: [ALIAS_OPERAND, ALIAS_OPERAND, '0b0010_0000'],
  },
  NOR: {
    mnemonic: 'BIT',
    operandTokens: [ALIAS_OPERAND, ALIAS_OPERAND, '0b1010_0000'],
  },
  XOR: {
    mnemonic: 'BIT',
    operandTokens: [ALIAS_OPERAND, ALIAS_OPERAND, '0b0001_0000'],
  },
  XNOR: {
    mnemonic: 'BIT',
    operandTokens: [ALIAS_OPERAND, ALIAS_OPERAND, '0b1001_0000'],
  },
  NOT: {
    mnemonic: 'BIT',
    operandTokens: [ALIAS_OPERAND, ALIAS_OPERAND, '0b0000_0001']
  },
  LSH: {
    mnemonic: 'ADD',
    operandTokens: [ALIAS_OPERAND, ALIAS_OPERAND],
  },
  NOP: {
    mnemonic: 'MOV',
    operandTokens: ['R1', 'R1'],
  },
  HALT: {
    mnemonic: 'RET',
    operandTokens: ['1'],
  },
};
