import { describe, expect, it } from 'vitest';
import { groupElements, isBitSet } from '../../util/common-util.ts';

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

describe('groupElements', () => {
  it('should group elements unevenly', () => {
    expect(groupElements([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
  });

  it('should group elements evenly', () => {
    expect(groupElements([1, 2, 3, 4, 5, 6], 3)).toEqual([[1, 2, 3], [4, 5, 6]]);
  });

  it('should group elements by 1', () => {
    expect(groupElements([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });
});
