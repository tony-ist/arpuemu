import { parseAsmLines } from './parse.ts';
import { AsmLine } from './AsmLine';
import { AssembleError } from './AssembleError.ts';

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
  return asmLines.filter((line) => !line.getIsData()).map((line) => line.getBytes()).flat();
}

function getLabelIndex(asmLines: AsmLine[], label: string) {
  return asmLines.findIndex((line) => line.getLabel() === label);
}

function cloneAsmLines(asmLines: AsmLine[]) {
  return asmLines.map((line) => line.clone());
}

function throwNoLabel(asmLine: AsmLine, label: string) {
  throw new AssembleError(`Cannot find label "${label}" value for line "${asmLine.toString()}". No such label or offsets were not filled.`);
}

export function fillImmediates(asmLines: AsmLine[]) {
  const result = cloneAsmLines(asmLines);

  for (const asmLine of result) {
    const operands = asmLine.getOperands();

    for (const operand of operands) {
      const label = operand.getLabel();
      if (label !== undefined) {
        const labelIndex = getLabelIndex(asmLines, label);

        const isLoadImmediate = asmLine.getMnemonic() === 'IMM';
        const isDataReference = asmLines[labelIndex].getIsData();

        // Only load value referenced by the label if it is a load immediate instruction
        // and label points to DW (data word) line
        if (isLoadImmediate && isDataReference) {
          const labelValue = asmLines[labelIndex].getDataValue();

          if (labelValue === undefined) {
            throwNoLabel(asmLine, label);
          } else {
            operand.setImmediate(labelValue);
          }

          continue;
        }

        const labelOffset = asmLines[labelIndex].getOffsetInBytes();

        if (labelOffset === undefined) {
          throwNoLabel(asmLine, label);
        } else {
          operand.setImmediate(labelOffset);
        }
      }
    }
  }

  return result;
}

export function fillOffsets(asmLines: AsmLine[]) {
  let offsetInBytes = 0;
  const result = cloneAsmLines(asmLines);

  for (const asmLine of result) {
    asmLine.setOffsetInBytes(offsetInBytes);

    if (!asmLine.getIsData()) {
      offsetInBytes += asmLine.getSizeInBytes();
    }
  }

  return result;
}

export function assemble(asmCode: string[]) {
  const linesWithoutComments = removeComments(asmCode);
  const nonEmptyLines = removeEmpty(linesWithoutComments);
  const asmLines = parseAsmLines(nonEmptyLines);
  const filledOffsetsAsmLines = fillOffsets(asmLines);
  const filledImmediatesAsmLines = fillImmediates(filledOffsetsAsmLines);

  return asmLinesToMachineCode(filledImmediatesAsmLines);
}