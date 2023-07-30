import { describe, expect, it } from 'vitest';
import { parseAsmLine } from '../../asm/parse.ts';

describe('AsmLine', () => {
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