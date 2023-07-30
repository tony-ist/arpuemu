import { describe, expect, it } from 'vitest';
import { assemble } from '../../asm/assemble.ts';
import fs from 'fs';
import path from 'path';

function readFileLines(filepath: string) {
  const text = fs.readFileSync(filepath, 'utf-8');
  return text.split('\n');
}

function assertProgram(name: string) {
  const prefix = 'src/test/asm/programs';
  const expectedCode = readFileLines(path.join(prefix, `${name}.hex`));
  const asmCode = readFileLines(path.join(prefix, `${name}.s`))
  const actualCode = assemble(asmCode);
  expect(actualCode).toEqual(expectedCode);
}

describe('assemble', () => {
  it('should assemble multiplication', () => {
    assertProgram('multiplication');
  });
});
