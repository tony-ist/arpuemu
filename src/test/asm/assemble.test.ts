import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { assemble } from '../../asm/assemble.ts';
import { toHex } from '../../asm/util.ts';

function readFileLines(filepath: string) {
  const text = fs.readFileSync(filepath, 'utf-8');
  return text.split('\n');
}

function assertProgram(name: string) {
  const prefix = 'src/test/asm/programs';
  const expectedCode = readFileLines(path.join(prefix, `${name}.hex`)).join(' ');
  const asmCode = readFileLines(path.join(prefix, `${name}.s`))
  const machineCode = assemble(asmCode);
  const actualCode = toHex(machineCode).join(' ');
  expect(actualCode).toEqual(expectedCode);
}

describe('assemble', () => {
  it('should assemble multiplication', () => {
    assertProgram('multiplication');
  });
});
