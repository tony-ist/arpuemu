import { describe, expect, it } from 'vitest';
import { ARPUEmulator, defaultARPUEmulatorState } from '../../emulator/ARPUEmulator.ts';

describe('ARPUEmulator', () => {
  it('should load immediate via IMM instruction', () => {
    const asmCode = 'IMM 0 0 42';
    const emulator = new ARPUEmulator(asmCode);
    emulator.step();
    expect(emulator.getState()).toEqual({
      ...defaultARPUEmulatorState(asmCode),
      registers: [42, 0, 0, 0],
      PC: 2,
      lineIndex: 1,
    });
  });

  it('should increment via INC instruction', () => {
    const asmCode = 'INC R1';
    const emulator = new ARPUEmulator(asmCode);
    emulator.step();
    expect(emulator.getState()).toEqual({
      ...defaultARPUEmulatorState(asmCode),
      registers: [1, 0, 0, 0],
      PC: 1,
      lineIndex: 1,
    });
  });

  it('should read port via PLD instruction', () => {
    const asmCode = 'PLD R1 0';
    const emulator = new ARPUEmulator(asmCode);
    emulator.step();
    expect(emulator.getState()).toEqual(defaultARPUEmulatorState(asmCode));
    emulator.portInput(2);
    expect(emulator.getState()).toEqual({
      ...defaultARPUEmulatorState(asmCode),
      registers: [2, 0, 0, 0],
      PC: 2,
      lineIndex: 1,
    });
  });
});
