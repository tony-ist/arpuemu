import { describe, expect, it } from 'vitest';
import { fromHex, toHex } from '../../asm/asm-util.ts';

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
});