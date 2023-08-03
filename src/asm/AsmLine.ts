import { Operand } from './Operand';
import { isData } from './util.ts';
import { INSTRUCTION_MNEMONICS } from './mnemonics.ts';

export class AsmLine {
  private readonly isData: boolean;
  private readonly mnemonic: string;
  private readonly operands: Operand[];
  private readonly sizeInBytes: number;
  private readonly opcode: number;
  private offsetInBytes?: number;
  private label?: string;

  constructor(mnemonic: string, operands: Operand[]) {
    this.isData = isData(mnemonic);
    this.mnemonic = mnemonic;
    this.operands = operands;
    this.sizeInBytes = operands.length === 3 ? 2 : 1;
    this.opcode = INSTRUCTION_MNEMONICS.findIndex((mnemonic) => this.mnemonic === mnemonic);
  }
  getBytes() {
    const operandInts = this.operands.map((operand) => operand.toInt());
    if (operandInts.some((integer) => integer === undefined)) {
      throw new Error(`Some operands that are labels were not filled with immediate values for line "${this.toString()}"`);
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

  setOffsetInBytes(offsetInBytes: number) {
    this.offsetInBytes = offsetInBytes;
  }

  getOffsetInBytes() {
    return this.offsetInBytes;
  }

  getOperands() {
    return this.operands;
  }

  getIsData() {
    return this.isData;
  }

  getLabel() {
    return this.label;
  }

  getMnemonic() {
    return this.mnemonic;
  }

  clone() {
    const operandsClone = this.operands.map((operand) => operand.clone());
    const clone = new AsmLine(this.mnemonic, operandsClone);
    if (this.label !== undefined) {
      clone.setLabel(this.label);
    }
    if (this.offsetInBytes !== undefined) {
      clone.setOffsetInBytes(this.offsetInBytes);
    }
    return clone;
  }

  toString() {
    const prefix = this.label === undefined ? '' : `${this.label} `;
    const operandStrings = this.operands.map((operand) => operand.toString()).join(' ');
    return `${prefix}${this.mnemonic} ${operandStrings}`;
  }

  getDataValue() {
    if (this.isData) {
      return this.operands[0].toInt();
    } else {
      throw new Error(`Trying to access data value of non-data AsmLine "${this.toString()}"`);
    }
  }
}
