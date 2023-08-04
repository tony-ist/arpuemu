export function isBitSet(value: number, bitIndex: number) {
  return (value >> bitIndex) % 2 === 1;
}

export function bitwiseNot(x: number) {
  return ~x & 0b1111_1111;
}

export function groupElements<T>(array: T[], groupSize: number) {
  if (groupSize < 1) {
    throw new Error('Group size should be more than zero');
  }

  const result = [];
  let buffer = [];
  let i = 1;

  for (const element of array) {
    buffer.push(element);

    if (i === groupSize) {
      result.push(buffer);
      buffer = [];
      i = 1;
    } else {
      i += 1;
    }
  }

  if (buffer.length > 0) {
    result.push(buffer);
  }

  return result;
}
