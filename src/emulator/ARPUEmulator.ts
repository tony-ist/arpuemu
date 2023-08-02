import { RAM_SIZE_IN_BYTES, STACK_SIZE_IN_BYTES } from '../const/emulator-constants.ts';
import { AsmLine } from '../asm/AsmLine.ts';
import { compileIntermediateRepresentation, IRToMachineCode } from '../asm/assemble.ts';

export interface ARPUEmulatorState {
  // Intermediate representation with filled in offsets and immediates
  asmLines: AsmLine[];
  // Current position in intermediate representation
  lineIndex : number;
  // R1 - R4
  registers: number[];
  // Program counter
  PC: number;
  // Zero flag
  ZF: number;
  // Carry out flag
  COUTF: number;
  // Most significant bit flag
  MSBF: number;
  // Least significant bit flag
  LSBF: number;
  // Program memory
  PMEM: number[];
  // Random access memory
  RAM: number[];
  stack: number[];
}

export function defaultARPUEmulatorState(asmCode: string) {
  const asmLines = compileIntermediateRepresentation(asmCode.split('\n'));
  return {
    asmLines,
    lineIndex: 0,
    registers: [0, 0, 0, 0],
    PC: 0,
    ZF: 0,
    COUTF: 0,
    MSBF: 0,
    LSBF: 0,
    PMEM: IRToMachineCode(asmLines),
    RAM: new Array(RAM_SIZE_IN_BYTES).fill(0),
    stack: new Array(STACK_SIZE_IN_BYTES),
  };
}

export class ARPUEmulator {
  private readonly state: ARPUEmulatorState;

  constructor(asmCode: string) {
    this.state = defaultARPUEmulatorState(asmCode);
  }

  public step() {
    const instruction = this.state.asmLines[this.state.lineIndex];

    if (instruction.getMnemonic() === 'IMM') {
      const operands = instruction.getOperands();
      const operand1Value = operands[0].toInt();
      const operand3Value = operands[2].toInt();
      this.state.registers[operand1Value] = operand3Value;
      this.state.PC += 2;
      this.state.lineIndex += 1;
      // TODO: Flags
    }
  }

  public getProgramMemory() {
    return this.state.PMEM;
  }

  public getRegisters() {
    return this.state.registers;
  }

  public getState() {
    return this.state;
  }
}