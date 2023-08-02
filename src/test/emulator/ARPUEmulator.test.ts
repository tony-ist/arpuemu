import { describe, expect, it } from 'vitest';
import { ARPUEmulator, defaultARPUEmulatorState } from '../../emulator/ARPUEmulator.ts';

describe('ARPUEmulator', () => {
  it('should load immediate via IMM instruction', () => {
    const asmCode = 'IMM 0 0 1';
    const emulator = new ARPUEmulator(asmCode);
    emulator.step();
    expect(emulator.getState()).toEqual({
      ...defaultARPUEmulatorState(asmCode),
      registers: [1, 0, 0, 0],
      PC: 2,
      lineIndex: 1,
    });
  });
});
