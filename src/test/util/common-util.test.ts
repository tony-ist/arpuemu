import { describe, expect, it } from 'vitest';
import { isBitSet } from '../../util/common-util.ts';

describe('isBitSet', () => {
  it.each([
    [-1, false],
    [0, true],
    [1, true],
    [2, false],
    [3, true],
    [4, false],
  ])('for 0b1011 and position % should return %', (position, expected) => {
    expect(isBitSet(0b1011, position)).toEqual(expected);
  });
});
