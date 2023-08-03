import { describe, expect, it } from 'vitest';
import { toHex } from '../../asm/asm-util.ts';

// TODO: Remove top level describe for non-class tests
describe('asm-util', () => {
  describe('toHex', () => {
    it('should pad zeroes', () => {
      expect(toHex([0, 0xF])).toEqual(['00', '0F']);
    });
  });
});