import { RAM_SIZE_IN_BYTES, STACK_SIZE_IN_BYTES } from '../const/emulator-constants.ts';
import { AsmLine } from '../asm/AsmLine.ts';
import { compileIntermediateRepresentation, IRToMachineCode } from '../asm/assemble.ts';
import { Operand } from '../asm/Operand.ts';

const BYTE = Math.pow(2, 8);

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
  ports: {
    input: number[];
    output: number[];
  };
  isWaitingPortInput: boolean;
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
    ports: {
      input: [0, 0, 0, 0],
      output: [0, 0, 0, 0],
    },
    isWaitingPortInput: false,
  };
}

export class ARPUEmulator {
  private readonly state: ARPUEmulatorState;
  private readonly handlers: { [key: string]: (operands: Operand[]) => void } = {
    INC: this.increment.bind(this),
    IMM: this.loadImmediate.bind(this),
    PLD: this.portLoad.bind(this),
  };

  constructor(asmCode: string) {
    this.state = defaultARPUEmulatorState(asmCode);
  }

  public step() {
    if (this.state.isWaitingPortInput) {
      throw new Error('Cannot make a step while waiting for the port input');
    }

    const instruction = this.state.asmLines[this.state.lineIndex];
    const mnemonic = instruction.getMnemonic();
    this.handlers[mnemonic](instruction.getOperands());
  }

  private increment(operands: Operand[]) {
    const operand1Value = operands[0].toInt();
    this.state.registers[operand1Value]++;
    if (this.state.registers[operand1Value] > BYTE) {
      this.state.registers[operand1Value] = 0;
    }
    this.state.PC += 1;
    this.state.lineIndex += 1;
  }

  private loadImmediate(operands: Operand[]) {
    const destinationRegisterIndex = operands[0].toInt();
    const immediate = operands[2].toInt();
    this.state.registers[destinationRegisterIndex] = immediate;
    this.state.PC += 2;
    this.state.lineIndex += 1;
  }

  public portInput(value: number) {
    if (!this.state.isWaitingPortInput) {
      throw new Error('Cannot input to port while not waiting for port input');
    }

    const asmLine = this.state.asmLines[this.state.lineIndex];
    if (asmLine.getMnemonic() !== 'PLD') {
      throw new Error('Illegal state: current instruction is not PLD but we are waiting for port input');
    }

    const portIndex = asmLine.getOperands()[1].toInt();
    this.state.ports.input[portIndex] = value;
  }

  private portLoad(operands: Operand[]) {
    // const registerIndex = operands[0].toInt();
    // const portIndex = operands[1].toInt();
    this.state.isWaitingPortInput = true;
    // this.state.PC += 1;
    // this.state.lineIndex += 1;
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