import { BITNESS, RAM_SIZE_IN_BYTES, WORD_SIZE } from '../const/emulator-constants.ts';
import { AsmLine } from '../asm/AsmLine.ts';
import { compileIntermediateRepresentation, IRToMachineCode } from '../asm/assemble.ts';
import { Operand } from '../asm/Operand.ts';
import { bitwiseNot, isBitSet, toWord } from '../util/common-util.ts';

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
  ZF: boolean;
  // Carry out flag
  COUTF: boolean;
  // Most significant bit flag
  MSBF: boolean;
  // Least significant bit flag
  LSBF: boolean;
  // Program memory
  PMEM: number[];
  // Random access memory
  RAM: number[];
  stack: number[];
  inputPorts: number[];
  outputPorts: number[];
  isWaitingPortInput: boolean;
  cycle: number;
}

export function defaultARPUEmulatorState(asmCode: string) {
  const asmLines = compileIntermediateRepresentation(asmCode.split('\n'));
  return {
    asmLines,
    lineIndex: 0,
    registers: [0, 0, 0, 0],
    PC: 0,
    ZF: false,
    COUTF: false,
    MSBF: false,
    LSBF: false,
    PMEM: IRToMachineCode(asmLines),
    RAM: new Array(RAM_SIZE_IN_BYTES).fill(0),
    stack: [],
    inputPorts: [0, 0, 0, 0],
    outputPorts: [0, 0, 0, 0],
    isWaitingPortInput: false,
    cycle: 0,
  };
}

export class ARPUEmulator {
  private readonly state: ARPUEmulatorState;
  private readonly handlers: { [key: string]: (operands: Operand[]) => void } = {
    INC: this.increment.bind(this),
    DEC: this.decrement.bind(this),
    IMM: this.loadImmediate.bind(this),
    PLD: this.portLoad.bind(this),
    PST: this.portStore.bind(this),
    BRA: this.branch.bind(this),
    SOP: this.stackOperation.bind(this),
    CAL: this.call.bind(this),
    RET: this.return.bind(this),
    STR: this.ramStore.bind(this),
    LOD: this.ramLoad.bind(this),
    ADD: this.add.bind(this),
    SUB: this.subtract.bind(this),
    RSH: this.rightShift.bind(this),
    BIT: this.bitwise.bind(this),
    MOV: this.move.bind(this),
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

  private add(operands: Operand[]) {
    const destinationRegisterIndex = operands[0].toInt();
    const sourceRegisterIndex = operands[1].toInt();
    let newValue = this.state.registers[sourceRegisterIndex] + this.state.registers[destinationRegisterIndex];
    this.state.COUTF = false;
    if (newValue >= WORD_SIZE) {
      newValue = toWord(newValue);
      this.state.COUTF = true;
    }
    this.state.registers[destinationRegisterIndex] = newValue;
    this.updateFlags(newValue);
    this.state.PC += 1;
    this.state.lineIndex += 1;
    this.state.cycle += 1;
  }

  private subtract(operands: Operand[]) {
    const destinationRegisterIndex = operands[0].toInt();
    const sourceRegisterIndex = operands[1].toInt();
    let newValue = this.state.registers[destinationRegisterIndex] - this.state.registers[sourceRegisterIndex];
    this.state.COUTF = true;
    if (newValue < 0) {
      newValue = toWord(newValue);
      this.state.COUTF = false;
    }
    this.state.registers[destinationRegisterIndex] = newValue;
    this.updateFlags(newValue);
    this.state.PC += 1;
    this.state.lineIndex += 1;
    this.state.cycle += 1;
  }

  private rightShift(operands: Operand[]) {
    const destinationRegisterIndex = operands[0].toInt();
    const sourceRegisterIndex = operands[1].toInt();
    const newValue = Math.floor(this.state.registers[sourceRegisterIndex] / 2);
    this.state.registers[destinationRegisterIndex] = newValue;
    this.updateFlags(newValue);
    this.state.PC += 1;
    this.state.lineIndex += 1;
    this.state.cycle += 1;
  }

  private increment(operands: Operand[]) {
    const destinationRegisterIndex = operands[0].toInt();
    const sourceRegisterIndex = operands[1].toInt();
    let newValue = this.state.registers[sourceRegisterIndex] + 1;
    this.state.COUTF = false;
    if (newValue >= WORD_SIZE) {
      newValue = 0;
      this.state.COUTF = true;
    }
    this.state.registers[destinationRegisterIndex] = newValue;
    this.updateFlags(newValue);
    this.state.PC += 1;
    this.state.lineIndex += 1;
    this.state.cycle += 1;
  }

  private decrement(operands: Operand[]) {
    const destinationRegisterIndex = operands[0].toInt();
    const sourceRegisterIndex = operands[1].toInt();
    let newValue = this.state.registers[sourceRegisterIndex] - 1;
    this.state.COUTF = false;
    if (newValue < 0) {
      newValue = WORD_SIZE - 1;
      this.state.COUTF = true;
    }
    this.state.registers[destinationRegisterIndex] = newValue;
    this.updateFlags(newValue);
    this.state.PC += 1;
    this.state.lineIndex += 1;
    this.state.cycle += 1;
  }

  private bitwise(operands: Operand[]) {
    const destinationRegisterIndex = operands[0].toInt();
    const sourceRegisterIndex = operands[1].toInt();
    const flags = operands[2].toInt();
    const isAnd = isBitSet(flags, 6);
    const isOr = isBitSet(flags, 5);
    const isXor = isBitSet(flags, 4);
    const isInvert = isBitSet(flags, 7);
    const isNot = isBitSet(flags, 0);

    if (isAnd) {
      this.state.registers[destinationRegisterIndex] =
        this.state.registers[destinationRegisterIndex] & this.state.registers[sourceRegisterIndex];
    } else if (isOr) {
      this.state.registers[destinationRegisterIndex] =
        this.state.registers[destinationRegisterIndex] | this.state.registers[sourceRegisterIndex];
    } else if (isXor) {
      this.state.registers[destinationRegisterIndex] =
        this.state.registers[destinationRegisterIndex] ^ this.state.registers[sourceRegisterIndex];
    }

    if (isInvert) {
      this.state.registers[destinationRegisterIndex] = bitwiseNot(this.state.registers[destinationRegisterIndex]);
    }

    if (isNot) {
      this.state.registers[destinationRegisterIndex] = bitwiseNot(this.state.registers[sourceRegisterIndex]);
    }

    this.updateFlags(this.state.registers[destinationRegisterIndex]);
    this.state.PC += 2;
    this.state.lineIndex += 1;
    this.state.cycle += 1;
  }

  private loadImmediate(operands: Operand[]) {
    const destinationRegisterIndex = operands[0].toInt();
    const immediate = operands[2].toInt();
    this.state.registers[destinationRegisterIndex] = immediate;
    this.state.PC += 2;
    this.state.lineIndex += 1;
    this.state.cycle += 1;
  }

  public portInput(value: number) {
    if (!this.state.isWaitingPortInput) {
      throw new Error('Cannot input to port while not waiting for port input');
    }

    const asmLine = this.state.asmLines[this.state.lineIndex];
    if (asmLine.getMnemonic() !== 'PLD') {
      throw new Error('Illegal state: current instruction is not PLD but we are waiting for port input');
    }

    const destinationRegisterIndex = asmLine.getOperands()[0].toInt();
    const portIndex = asmLine.getOperands()[1].toInt();
    this.state.registers[destinationRegisterIndex] = value;
    this.state.inputPorts[portIndex] = value;
    this.state.PC += 1;
    this.state.lineIndex += 1;
    this.state.isWaitingPortInput = false;
    this.state.cycle += 1;
  }

  private portLoad() {
    this.state.isWaitingPortInput = true;
  }

  private portStore(operands: Operand[]) {
    const sourceRegisterIndex = operands[0].toInt();
    const portIndex = operands[1].toInt();
    this.state.outputPorts[portIndex] = this.state.registers[sourceRegisterIndex];
    this.state.PC += 1;
    this.state.lineIndex += 1;
    this.state.cycle += 1;
  }

  private branch(operands: Operand[]) {
    const destinationOffset = operands[2].toInt();

    if (this.shouldJump(operands)) {
      const jumpToIndex = this.state.asmLines.findIndex(
        (asmLine) => asmLine.getOffsetInBytes() === destinationOffset
      );
      this.state.PC = destinationOffset;
      this.state.lineIndex = jumpToIndex;
    } else {
      this.state.PC += 2;
      this.state.lineIndex += 1;
    }

    this.state.cycle += 1;
  }

  private shouldJump(operands: Operand[]) {
    const condition = operands[0].toInt();
    const flags = operands[1].toInt();
    const isConditional = isBitSet(flags, 1);
    const isNegate = isBitSet(flags, 0);

    if (!isConditional) {
      return true;
    }

    const flag = this.getFlags()[condition];

    return flag !== isNegate;
  }

  private stackOperation(operands: Operand[]) {
    const isPush = !isBitSet(operands[1].toInt(), 1);

    if (isPush) {
      const sourceRegisterIndex = operands[0].toInt();
      const valueToPush = this.state.registers[sourceRegisterIndex];
      this.state.stack.push(valueToPush);
    } else {
      const destinationRegisterIndex = operands[0].toInt();
      this.state.registers[destinationRegisterIndex] = this.popStack();
    }

    this.state.PC += 1;
    this.state.lineIndex += 1;
    this.state.cycle += 1;
  }

  private popStack() {
    const poppedValue = this.state.stack.pop();
    return poppedValue === undefined ? 0 : poppedValue;
  }

  private call(operands: Operand[]) {
    const destinationOffset = operands[2].toInt();
    const procedureIndex = this.state.asmLines.findIndex(
      (asmLine) => asmLine.getOffsetInBytes() === destinationOffset
    );

    this.state.stack.push(this.state.PC + 2);
    this.state.PC = destinationOffset;
    this.state.lineIndex = procedureIndex;
    this.state.cycle += 1;
  }

  private return() {
    const destinationOffset = this.popStack();
    const returnLineIndex = this.state.asmLines.findIndex(
      (asmLine) => asmLine.getOffsetInBytes() === destinationOffset
    );

    this.state.PC = destinationOffset;
    this.state.lineIndex = returnLineIndex;
    this.state.cycle += 1;
  }

  // TODO: Flags
  private ramStore(operands: Operand[]) {
    const sourceRegisterIndex = operands[0].toInt();
    const pointerRegisterIndex = operands[1].toInt();
    const valueToWrite = this.state.registers[sourceRegisterIndex];
    const destinationRAMAddress = this.state.registers[pointerRegisterIndex];

    this.state.RAM[destinationRAMAddress] = valueToWrite;

    this.state.PC += 1;
    this.state.lineIndex += 1;
    this.state.cycle += 1;
  }

  // TODO: Flags
  private ramLoad(operands: Operand[]) {
    const destinationRegisterIndex = operands[0].toInt();
    const pointerRegisterIndex = operands[1].toInt();
    const sourceRAMAddress = this.state.registers[pointerRegisterIndex];
    const valueToWrite = this.state.RAM[sourceRAMAddress];

    this.state.registers[destinationRegisterIndex] = valueToWrite;

    this.state.PC += 1;
    this.state.lineIndex += 1;
    this.state.cycle += 1;
  }

  private move(operands: Operand[]) {
    const destinationRegisterIndex = operands[0].toInt();
    const sourceRegisterIndex = operands[1].toInt();
    this.state.registers[destinationRegisterIndex] = this.state.registers[sourceRegisterIndex];
    this.updateFlags(this.state.registers[sourceRegisterIndex]);
    this.state.PC += 1;
    this.state.lineIndex += 1;
    this.state.cycle += 1;
  }

  public getProgramMemory() {
    return this.state.PMEM;
  }

  public getRegisters() {
    return this.state.registers;
  }

  public getFlags() {
    return [this.state.ZF, this.state.COUTF, this.state.MSBF, this.state.LSBF];
  }

  private updateFlags(value: number) {
    this.state.ZF = value === 0;
    this.state.MSBF = isBitSet(value, BITNESS - 1);
    this.state.LSBF = isBitSet(value, 0);
  }

  public getState() {
    return this.state;
  }

  public setRAM(binaryData: number[]) {
    if (binaryData.length > RAM_SIZE_IN_BYTES) {
      throw new Error(`Binary data argument is "${binaryData.length}" bytes long while max RAM size is ${RAM_SIZE_IN_BYTES}`);
    }
    binaryData.forEach((byte, index) => this.state.RAM[index] = byte);
    if (binaryData.length < RAM_SIZE_IN_BYTES) {
      this.state.RAM.fill(0, binaryData.length);
    }
  }
}