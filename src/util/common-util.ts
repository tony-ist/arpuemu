export function isBitSet(value: number, bitIndex: number) {
  return (value >> bitIndex) % 2 === 1;
}
