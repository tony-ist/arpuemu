import { describe, expect, it } from 'vitest';
import { toHex } from '../../asm/util.ts';

describe('util', () => {
  describe('toHex', () => {
    it('should pad zeroes', () => {
      expect(toHex([0, 0xF])).toEqual(['00', '0F']);
    });
  });
});