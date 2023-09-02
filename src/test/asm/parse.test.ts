import { describe, expect, it } from 'vitest';
import { parseAsmLine, parseOperand } from '../../asm/parse.ts';
import { Operand } from '../../asm/Operand.ts';

describe('parse', () => {
  describe('parseAsmLine', () => {
    it.each([
      ['ADD R1 R2', [0b0100_0000]],
      ['SUB R1 R2', [0b0100_0001]],
      ['RSH R2 R1', [0b0001_0010]],
      ['INC R3 R1', [0b0010_0011]],
      ['DEC R3 R1', [0b0010_0100]],
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

    it.each([
      ['jmp .loop', 'BRA 0 0 .loop'],
      ['jz .loop', 'BRA 0 0b10 .loop'],
      ['jnz .loop', 'BRA 0 0b11 .loop'],
      ['jc .loop', 'BRA 1 0b10 .loop'],
      ['jnc .loop', 'BRA 1 0b11 .loop'],
      ['jmb .loop', 'BRA 2 0b10 .loop'],
      ['jnm .loop', 'BRA 2 0b11 .loop'],
      ['jlb .loop', 'BRA 3 0b10 .loop'],
      ['jnl .loop', 'BRA 3 0b11 .loop'],
      ['imm r1 0xff', 'IMM r1 0 0xff'],
      ['cal .proc', 'CAL 0 0 .proc'],
      ['push r1', 'SOP r1 0'],
      ['pop r1', 'SOP r1 2'],
      ['and r1 r2', 'BIT r1 r2 0b0100_0000'],
      ['nand r1 r2', 'BIT r1 r2 0b1100_0000'],
      ['or r1 r2', 'BIT r1 r2 0b0010_0000'],
      ['nor r1 r2', 'BIT r1 r2 0b1010_0000'],
      ['xor r1 r2', 'BIT r1 r2 0b0001_0000'],
      ['xnor r1 r2', 'BIT r1 r2 0b1001_0000'],
      ['not r1 r2', 'BIT r1 r2 0b0000_0001'],
      ['not r1', 'BIT r1 r1 0b0000_0001'],
      ['inc r1', 'INC r1 r1'],
      ['dec r1', 'DEC r1 r1'],
      ['lsh r1', 'ADD r1 r1'],
      // 'lsh r1 r2' should throw exception in theory
      ['nop', 'MOV R1 R1'],
      ['halt', 'RET 1'],
    ])('should parse alias "%s"', (line, expected) => {
      expect(parseAsmLine(line).toString()).toEqual(expected);
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
      ['0b001_001_01', 0b00100101], // used for 8x8 pixel display
    ])('should parse %s to be %s', (token, immediate) => {
      expect(parseOperand(token)).toEqual(Operand.fromImmediate(token, immediate));
    });
  });
});