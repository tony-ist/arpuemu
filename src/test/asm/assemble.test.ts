import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { assembleLines, fillImmediates, fillOffsets, removeExtraSpaces } from '../../asm/assemble.ts';
import { toHex } from '../../asm/asm-util.ts';
import { parseAsmLines } from '../../asm/parse.ts';
import { Operand } from '../../asm/Operand.ts';

function readFileLines(filepath: string) {
  const text = fs.readFileSync(filepath, 'utf-8');
  return text.split('\n');
}

function assertProgram(name: string) {
  const prefix = 'src/test/asm/programs';
  const expectedCode = readFileLines(path.join(prefix, `${name}.hex`)).join(' ').trim();
  const asmCode = readFileLines(path.join(prefix, `${name}.s`));
  const machineCode = assembleLines(asmCode);
  const actualCode = toHex(machineCode).join(' ');
  expect(actualCode).toEqual(expectedCode);
}

describe('assemble', () => {
  it.skip('should assemble multiplication', () => {
    assertProgram('multiplication');
  });

  it.skip('should assemble bitwise', () => {
    assertProgram('bitwise');
  });

  it.skip('should assemble io', () => {
    assertProgram('io');
  });

  it.skip('should assemble procedure', () => {
    assertProgram('procedure');
  });

  it.skip('should assemble other', () => {
    assertProgram('other');
  });

  describe('parseAsmLines', () => {
    it('should parse labels', () => {
      const actual = parseAsmLines([
        '.a',
        'DW 3',
      ]);
      expect(actual.length).toEqual(1);
      expect(actual[0].getLabel()).toEqual('.a');
    });

    it('should parse data word', () => {
      const actual = parseAsmLines([
        '.a',
        'dw 0xFF',
      ]);
      expect(actual.length).toEqual(1);
      expect(actual[0].getIsData()).toEqual(true);
      expect(actual[0].getOperands()[0].toInt()).toEqual(0xFF);
    });
  });

  describe('fillOffsets', () => {
    it('should fill offsets', () => {
      const asmLines = parseAsmLines([
        'DW 3',
        'IMM R2 0 .a',
        'ADD R1 R2',
        'DEC R3',
      ]);
      const actual = fillOffsets(asmLines);
      expect(actual.length).toEqual(4);
      expect(actual[0].getOffsetInBytes()).toEqual(0);
      expect(actual[1].getOffsetInBytes()).toEqual(0);
      expect(actual[2].getOffsetInBytes()).toEqual(2);
      expect(actual[3].getOffsetInBytes()).toEqual(3);
    });
  });

  describe('fillImmediates', () => {
    it('should fill immediates for first address', () => {
      const asmLines = parseAsmLines([
        '.a',
        'DW 3',
        'IMM R2 0 .a',
      ]);
      const filledOffsetsAsmLines = fillOffsets(asmLines);
      const actual = fillImmediates(filledOffsetsAsmLines);
      expect(actual.length).toEqual(2);
      expect(actual[1].getOperands()[2]).toEqual(Operand.fromImmediate('.a', 3, '.a'));
    });
    it('should fill immediates for last address', () => {
      const asmLines = parseAsmLines([
        'IMM R2 0 .a',
        '.a',
        'DW 3',
      ]);
      const filledOffsetsAsmLines = fillOffsets(asmLines);
      const actual = fillImmediates(filledOffsetsAsmLines);
      expect(actual.length).toEqual(2);
      expect(actual[0].getOperands()[2]).toEqual(Operand.fromImmediate('.a', 3, '.a'));
    });
  });

  describe('removeExtraSpaces', () => {
    it('should remove extra spaces', () => {
      expect(removeExtraSpaces(['   q w', 'q   w', 'q w   ', ' q w '])).toEqual([' q w', 'q w', 'q w ', ' q w ']);
    });
  });

  describe('definitions', () => {
    it('should assemble definitions in instructions', () => {
      const actual = assembleLines([
        '@DEFINE VALUE 3',
        'IMM R1 0 @VALUE',
        'PST @VALUE @VALUE',
      ]);
      expect(actual).toEqual([0b0000_1010, 0b0000_0011, 0b1111_1000]);
    });

    it('should assemble definitions in aliases', () => {
      const actual = assembleLines([
        '@DEFINE VALUE R2',
        'PUSH @VALUE',
        'POP @VALUE',
      ]);
      expect(actual).toEqual([0b0001_1101, 0b1001_1101]);
    });
  });
});
