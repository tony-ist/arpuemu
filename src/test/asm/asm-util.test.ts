import { describe, expect, it } from 'vitest';
import { fromHex, isAlias, toHex } from '../../asm/asm-util.ts';

// TODO: Remove top level describe for non-class tests
describe('asm-util', () => {
  describe('toHex', () => {
    it('should pad zeroes', () => {
      expect(toHex([0, 0xF])).toEqual(['00', '0F']);
    });
  });

  describe('fromHex', () => {
    it('should parse hex', () => {
      expect(fromHex(['00', '01', 'FF', '123'])).toEqual([0, 1, 255, 291]);
    });
  });

  describe('isAlias', () => {
    it.each([
      'imm r1 .label',
      'imm r1 0xFF',
      'jmp .loop',
      'cal .proc',
      'push r1',
      'and r1 r2',
      'not r1',
      'not r1 r2',
      'inc r1',
      'lsh r1',
      'nop',
      'halt',
    ])('should classify "%s" as alias', (line) => {
      expect(isAlias(line)).toEqual(true);
    });

    it.each([
      'imm r1 0 .label',
      'imm r1 0 0xFF',
      'bra 0 0 .loop',
      'cal 0 0 .proc',
      'sop r1 0',
      'inc r1 r2',
      'ret',
      'ret 1',
    ])('should not classify "%s" as alias', (line) => {
      expect(isAlias(line)).toEqual(false);
    });
  });
});