import { parseAsmLines } from './parse.ts';
import { AsmLine } from './AsmLine';

function removeInlineComment(line: string) {
  const index = line.indexOf('//');
  if (index !== -1) {
    return line.slice(0, index).trim();
  } else {
    return line;
  }
}

function removeComments(asmCode: string[]) {
  return asmCode
    .filter((line) => !line.startsWith('//'))
    .map(removeInlineComment);
}

function removeEmpty(asmCode: string[]) {
  return asmCode.filter((line) => !(line.trim() === ''));
}

function asmLinesToMachineCode(asmLines: AsmLine[]) {
  return asmLines.map((l) => l.toInt());
}

export function assemble(asmCode: string[]) {
  const linesWithoutComments = removeComments(asmCode);
  const nonEmptyLines = removeEmpty(linesWithoutComments);
  const asmLines = parseAsmLines(nonEmptyLines);
  return asmLinesToMachineCode(asmLines);
}