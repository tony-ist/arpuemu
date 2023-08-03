import { describe, expect, it } from 'vitest';
import { parseAsmLine, parseOperand } from '../../asm/parse.ts';
import { Operand } from '../../asm/Operand.ts';
import { ParseError } from '../../asm/ParseError.ts';

describe('parse', () => {
  describe('parseAsmLine', () => {
    it.each([
      ['DEC R3', [0x48]],
      ['ADD R1 R2', [0x01]],
      ['IMM R2 0 64', [0xA4, 64]],
      ['IMM R2 0 0xFF', [0xA4, 0xFF]],
      ['BRA 0b00 0b11 0', [0xE3, 0]],
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
      ['R2', 1],
      ['127', 127],
      ['0xFF', 0xFF],
      ['0b1010', 0b1010],
      ['12_34', 1234],
      ['0x1_F', 0x1F],
      ['0b1010_0011', 0b10100011],
    ])('should parse %s to be %s', (token, immediate) => {
      expect(parseOperand(token)).toEqual(Operand.fromImmediate(token, immediate));
    });

    it('should throw ParseError when immediate exceeds size in bits', () => {
      expect(() => parseOperand('0x100', 8)).toThrow(ParseError);
    });
  });
});