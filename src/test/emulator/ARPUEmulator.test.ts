import { describe, expect, it } from 'vitest';
import { ARPUEmulator, defaultARPUEmulatorState } from '../../emulator/ARPUEmulator.ts';
import { RAM_SIZE_IN_BYTES } from '../../const/emulator-constants.ts';

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
      cycle: 1,
    });
  });

  it('should increment via INC instruction', () => {
    const asmCode = 'INC R1 R2';
    const emulator = new ARPUEmulator(asmCode);
    emulator.getState().registers[1] = 42;
    emulator.step();
    expect(emulator.getState()).toEqual({
      ...defaultARPUEmulatorState(asmCode),
      registers: [43, 42, 0, 0],
      PC: 1,
      LSBF: true,
      lineIndex: 1,
      cycle: 1,
    });
  });

  it('should decrement via DEC instruction', () => {
    const asmCode = 'DEC R1 R2';
    const emulator = new ARPUEmulator(asmCode);
    emulator.getState().registers[1] = 42;
    emulator.step();
    expect(emulator.getState()).toEqual({
      ...defaultARPUEmulatorState(asmCode),
      registers: [41, 42, 0, 0],
      PC: 1,
      LSBF: true,
      lineIndex: 1,
      cycle: 1,
    });
  });

  it('should read port via PLD instruction', () => {
    const asmCode = 'PLD R1 0';
    const defaultState = defaultARPUEmulatorState(asmCode);
    const emulator = new ARPUEmulator(asmCode);
    emulator.step();
    expect(emulator.getState()).toEqual({
      ...defaultState,
      isWaitingPortInput: true,
    });
    emulator.portInput(2);
    expect(emulator.getState()).toEqual({
      ...defaultState,
      registers: [2, 0, 0, 0],
      inputPorts: [2, 0, 0, 0],
      PC: 1,
      lineIndex: 1,
      cycle: 1,
    });
  });

  it('should write to port via PST instruction', () => {
    const asmLines = [
      'IMM R1 0 3',
      'PST R1 0',
    ];
    const asmCode = asmLines.join('\n');
    const defaultState = defaultARPUEmulatorState(asmCode);
    const emulator = new ARPUEmulator(asmCode);
    emulator.step();
    emulator.step();
    expect(emulator.getState()).toEqual({
      ...defaultState,
      registers: [3, 0, 0, 0],
      outputPorts: [3, 0, 0, 0],
      PC: 3,
      lineIndex: 2,
      cycle: 2,
    });
  });

  describe('branch via BRA instruction', () => {
    describe('unconditional', () => {
      it('should make a forward jump anyway', () => {
        const asmLines = [
          'BRA 0 0 .branch',
          'IMM R1 0 1',
          '.branch',
          'IMM R1 0 2',
        ];
        const asmCode = asmLines.join('\n');
        const defaultState = defaultARPUEmulatorState(asmCode);
        const emulator = new ARPUEmulator(asmCode);
        emulator.step();
        expect(emulator.getState()).toEqual({
          ...defaultState,
          PC: 4,
          lineIndex: 2,
          cycle: 1,
        });
      });

      it('should make a backward jump anyway', () => {
        const asmLines = [
          '.branch',
          'IMM R1 0 2',
          'BRA 0 0 .branch',
          'IMM R1 0 1',
        ];
        const asmCode = asmLines.join('\n');
        const defaultState = defaultARPUEmulatorState(asmCode);
        const emulator = new ARPUEmulator(asmCode);
        emulator.getState().PC = 2;
        emulator.getState().lineIndex = 1;
        emulator.step();
        expect(emulator.getState()).toEqual({
          ...defaultState,
          PC: 0,
          lineIndex: 0,
          cycle: 1,
        });
      });

    });

    describe('conditional', () => {
      describe('without negate', () => {
        it('should make a jump when condition ZF is true', () => {
          const asmLines = [
            'BRA 0 0b01 .branch',
            'IMM R1 0 1',
            '.branch',
            'IMM R1 0 2',
          ];
          const asmCode = asmLines.join('\n');
          const defaultState = defaultARPUEmulatorState(asmCode);
          const emulator = new ARPUEmulator(asmCode);
          emulator.getState().ZF = true;
          emulator.step();
          expect(emulator.getState()).toEqual({
            ...defaultState,
            // TODO: ZF should be false after jump if PC != 0
            ZF: true,
            PC: 4,
            lineIndex: 2,
            cycle: 1,
          });
        });

        it('should make a jump when condition COUT is true', () => {
          const asmLines = [
            'BRA 1 0b01 .branch',
            'IMM R1 0 1',
            '.branch',
            'IMM R1 0 2',
          ];
          const asmCode = asmLines.join('\n');
          const defaultState = defaultARPUEmulatorState(asmCode);
          const emulator = new ARPUEmulator(asmCode);
          emulator.getState().COUTF = true;
          emulator.step();
          expect(emulator.getState()).toEqual({
            ...defaultState,
            COUTF: true,
            PC: 4,
            lineIndex: 2,
            cycle: 1,
          });
        });
      });

      describe('with negate', () => {
        it('should make a jump when condition ZF is false', () => {
          const asmLines = [
            'BRA 0 0b11 .branch',
            'IMM R1 0 1',
            '.branch',
            'IMM R1 0 2',
          ];
          const asmCode = asmLines.join('\n');
          const defaultState = defaultARPUEmulatorState(asmCode);
          const emulator = new ARPUEmulator(asmCode);
          emulator.step();
          expect(emulator.getState()).toEqual({
            ...defaultState,
            PC: 4,
            lineIndex: 2,
            cycle: 1,
          });
        });

        it('should make a jump when condition COUT is false', () => {
          const asmLines = [
            'BRA 1 0b11 .branch',
            'IMM R1 0 1',
            '.branch',
            'IMM R1 0 2',
          ];
          const asmCode = asmLines.join('\n');
          const defaultState = defaultARPUEmulatorState(asmCode);
          const emulator = new ARPUEmulator(asmCode);
          emulator.step();
          expect(emulator.getState()).toEqual({
            ...defaultState,
            PC: 4,
            lineIndex: 2,
            cycle: 1,
          });
        });
      });
    });
  });

  describe('stack operation via SOP instruction', () => {
    it('should push', () => {
      const asmLines = [
        'SOP R1 0',
      ];
      const asmCode = asmLines.join('\n');
      const defaultState = defaultARPUEmulatorState(asmCode);
      const emulator = new ARPUEmulator(asmCode);
      emulator.getState().registers[0] = 42;
      emulator.step();
      expect(emulator.getState()).toEqual({
        ...defaultState,
        registers: [42, 0, 0, 0],
        stack: [42],
        PC: 1,
        lineIndex: 1,
        cycle: 1,
      });
    });

    it('should pop', () => {
      const asmLines = [
        'SOP R1 1',
      ];
      const asmCode = asmLines.join('\n');
      const defaultState = defaultARPUEmulatorState(asmCode);
      const emulator = new ARPUEmulator(asmCode);
      emulator.getState().stack.push(42);
      emulator.step();
      expect(emulator.getState()).toEqual({
        ...defaultState,
        registers: [42, 0, 0, 0],
        stack: [],
        PC: 1,
        lineIndex: 1,
        cycle: 1,
      });
    });

    it('should pop 0 from empty stack', () => {
      const asmLines = [
        'SOP R1 1',
      ];
      const asmCode = asmLines.join('\n');
      const defaultState = defaultARPUEmulatorState(asmCode);
      const emulator = new ARPUEmulator(asmCode);
      emulator.getState().registers[0] = 42;
      emulator.step();
      expect(emulator.getState()).toEqual({
        ...defaultState,
        registers: [0, 0, 0, 0],
        stack: [],
        PC: 1,
        lineIndex: 1,
        cycle: 1,
      });
    });
  });

  it('should call via CAL instruction', () => {
    const asmLines = [
      'CAL 0 0 .procedure',
      '.procedure',
      'IMM R1 0 0',
    ];
    const asmCode = asmLines.join('\n');
    const defaultState = defaultARPUEmulatorState(asmCode);
    const emulator = new ARPUEmulator(asmCode);
    emulator.step();
    expect(emulator.getState()).toEqual({
      ...defaultState,
      stack: [2],
      PC: 2,
      lineIndex: 1,
      cycle: 1,
    });
  });

  it('should return via RET instruction', () => {
    const asmLines = [
      'CAL 0 0 .procedure',
      '.procedure',
      'RET'
    ];
    const asmCode = asmLines.join('\n');
    const defaultState = defaultARPUEmulatorState(asmCode);
    const emulator = new ARPUEmulator(asmCode);
    emulator.step();
    emulator.step();
    expect(emulator.getState()).toEqual({
      ...defaultState,
      stack: [],
      PC: 2,
      lineIndex: 1,
      cycle: 2,
    });
  });

  it('should store in RAM via STR instruction', () => {
    const asmLines = [
      'STR R1 R2',
    ];
    const asmCode = asmLines.join('\n');
    const defaultState = defaultARPUEmulatorState(asmCode);
    const emulator = new ARPUEmulator(asmCode);
    emulator.getState().registers[0] = 42;
    emulator.step();
    const RAM = new Array(RAM_SIZE_IN_BYTES).fill(0);
    RAM[0] = 42;
    expect(emulator.getState()).toEqual({
      ...defaultState,
      registers: [42, 0, 0, 0],
      RAM,
      PC: 1,
      lineIndex: 1,
      cycle: 1,
    });
  });

  it('should load from RAM via LOD instruction', () => {
    const asmLines = [
      'LOD R1 R2',
    ];
    const asmCode = asmLines.join('\n');
    const defaultState = defaultARPUEmulatorState(asmCode);
    const emulator = new ARPUEmulator(asmCode);
    emulator.getState().RAM[0] = 42;
    emulator.step();
    const RAM = new Array(RAM_SIZE_IN_BYTES).fill(0);
    RAM[0] = 42;
    expect(emulator.getState()).toEqual({
      ...defaultState,
      registers: [42, 0, 0, 0],
      RAM,
      PC: 1,
      lineIndex: 1,
      cycle: 1,
    });
  });

  it('should add via ADD instruction', () => {
    const asmLines = [
      'ADD R1 R2',
    ];
    const asmCode = asmLines.join('\n');
    const defaultState = defaultARPUEmulatorState(asmCode);
    const emulator = new ARPUEmulator(asmCode);
    emulator.getState().registers = [2, 3, 0, 0];
    emulator.step();
    expect(emulator.getState()).toEqual({
      ...defaultState,
      registers: [5, 3, 0, 0],
      PC: 1,
      lineIndex: 1,
      cycle: 1,
    });
  });

  it('should move via MOV instruction', () => {
    const asmLines = [
      'MOV R1 R2',
    ];
    const asmCode = asmLines.join('\n');
    const defaultState = defaultARPUEmulatorState(asmCode);
    const emulator = new ARPUEmulator(asmCode);
    emulator.getState().registers = [0, 42, 0, 0];
    emulator.step();
    expect(emulator.getState()).toEqual({
      ...defaultState,
      registers: [42, 42, 0, 0],
      PC: 1,
      lineIndex: 1,
      cycle: 1,
    });
  });
});
