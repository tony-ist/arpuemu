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
      expect(parseOperand('.label')).toEqual(Operand.fromLabel('.label'))
    });

    it('should parse registers', () => {
      expect(parseOperand('R2')).toEqual(Operand.fromImmediate('R2', 1))
    });

    it('should parse decimals', () => {
      expect(parseOperand('127')).toEqual(Operand.fromImmediate('127', 127))
    });

    it('should parse hex', () => {
      expect(parseOperand('0xFF')).toEqual(Operand.fromImmediate('0xFF', 0xFF))
    });

    it('should parse binary', () => {
      expect(parseOperand('0b1010')).toEqual(Operand.fromImmediate('0b1010', 0b1010))
    });

    it('should throw ParseError when immediate exceeds size in bits', () => {
      expect(() => parseOperand('0x100', 8)).toThrow(ParseError)
    });
  });
});