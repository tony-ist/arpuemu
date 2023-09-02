import { describe, expect, it } from 'vitest';
import { parseAsmLine, parseOperand } from '../../asm/parse.ts';
import { Operand } from '../../asm/Operand.ts';
import { ParseError } from '../../asm/ParseError.ts';

describe('parse', () => {
  describe('parseAsmLine', () => {
    it.each([
      ['ADD R1 R2', [0b0100_0000]],
      ['SUB R1 R2', [0b0100_0001]],
      ['RSH R2', [0b0001_0010]],
      ['INC R3', [0b0010_0011]],
      ['DEC R3', [0b0010_0100]],
      ['BIT R1 R3 0b1100_0000', [0b1000_0101, 0b1100_0000]],
      ['CAL 0 0 0b1100_0110', [0b0000_0110, 0b1100_0110]],
      ['RET', [0b0000_0111]],
      ['PST R1 1', [0b0100_1000]],
      ['PLD R1 1', [0b0100_1001]],
      ['IMM R2 0 64', [0b0001_1010, 64]],
      ['IMM R2 0 0xFF', [0b0001_1010, 0xFF]],
      ['STR R1 R2', [0b0100_1011]],
      ['LOD R1 R2', [0b0100_1100]],
      ['SOP R1 2', [0b1000_1101]],
      ['BRA 0b00 0b11 0', [0b1100_1110, 0]],
      ['MOV R1 R2', [0b0100_1111]],
    ])('should return bytes for line "%s"', (line, expected) => {
      const actual = parseAsmLine(line).getBytes();
      expect(actual).toEqual(expected);
    });
  });

  describe('parseOperand', () => {
    it('should parse labels', () => {
      expect(parseOperand('.label')).toEqual(Operand.fromLabel('.label'));
    });

    it.each([
      ['r2', 1],
      ['R2', 1],
      ['127', 127],
      ['0xFF', 0xFF],
      ['0xff', 0xFF],
      ['0b1010', 0b1010],
      ['12_34', 1234],
      ['0x1_F', 0x1F],
      ['0b1010_0011', 0b10100011],
    ])('should parse %s to be %s', (token, immediate) => {
      expect(parseOperand(token)).toEqual(Operand.fromImmediate(token, immediate));
    });
  });
});