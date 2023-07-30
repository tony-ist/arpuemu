import { Operand } from './Operand';
import { isData } from './util.ts';

export class AsmLine {
  private isData: boolean
  private mnemonic: string
  private operands: Operand[];
  private label?: string;

  constructor(mnemonic: string, operands: Operand[]) {
    this.mnemonic = mnemonic;
    this.operands = operands;
    this.isData = isData(mnemonic);
  }

  toInt() {
    return 0;
  }

  setLabel(label: string) {
    this.label = label;
  }
}
