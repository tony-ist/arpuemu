import { Operand } from './Operand';
import { isData } from './util.ts';
import { INSTRUCTION_MNEMONICS } from './instructions.ts';

export class AsmLine {
  private readonly isData: boolean
  private readonly mnemonic: string
  private readonly operands: Operand[];
  private readonly sizeInBytes: number;
  private readonly opcode: number;
  private label?: string;

  constructor(mnemonic: string, operands: Operand[]) {
    this.mnemonic = mnemonic;
    this.operands = operands;
    this.opcode = INSTRUCTION_MNEMONICS.findIndex((mnemonic) => this.mnemonic === mnemonic);
    this.isData = isData(mnemonic);
    this.sizeInBytes = operands.length === 3 ? 2 : 1;
  }

  getBytes() {
    const operandInts = this.operands.map((operand) => operand.toInt());
    if (operandInts.some((integer) => integer === undefined)) {
      throw new Error(`Some operands that are labels were not filled with immediate values for line "${this.toString()}"`)
    }
    const operandInt1 = operandInts[0] as number;
    const operandInt2 = operandInts[1] ?? 0;
    const operandInt3 = operandInts[2];
    const byte1 = (this.opcode << 4) + (operandInt1 << 2) + operandInt2;
    return operandInt3 === undefined ? [byte1] : [byte1, operandInt3];
  }

  getSizeInBytes() {
    return this.sizeInBytes;
  }

  setLabel(label: string) {
    this.label = label;
  }

  toString() {
    const prefix = this.label === undefined ? '' : `${this.label} `;
    const operandStrings = this.operands.map((operand) => operand.toString()).join(' ');
    return `${prefix}${this.mnemonic} ${operandStrings}`;
  }
}
