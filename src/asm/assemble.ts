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

function gelLabelIndex(asmLines: AsmLine[], label: string) {
  return asmLines.findIndex((line) => line.getLabel() === label);
}

function getLabelOffset(asmLines: AsmLine[], label: string) {
  return asmLines[gelLabelIndex(asmLines, label)]?.getOffsetInBytes();
}

function getLabelValue(asmLines: AsmLine[], label: string) {
  return asmLines[gelLabelIndex(asmLines, label)]?.getDataValue();
}

function cloneAsmLines(asmLines: AsmLine[]) {
  return asmLines.map((line) => line.clone());
}

export function fillImmediates(asmLines: AsmLine[]) {
  const result = cloneAsmLines(asmLines);

  for (const asmLine of result) {
    const operands = asmLine.getOperands();

    for (const operand of operands) {
      const label = operand.getLabel();
      if (label !== undefined) {
        // Load immediate is the only instruction that loads value at label not label address
        if (asmLine.getMnemonic() === 'IMM') {
          const labelValue = getLabelValue(asmLines, label);

          if (labelValue === undefined) {
            throw new AssembleError(`Cannot find label "${label}" value for line "${asmLine.toString()}". No such label or offsets were not filled.`);
          }

          operand.setImmediate(labelValue);
        } else {
          const labelOffset = getLabelOffset(asmLines, label);

          if (labelOffset === undefined) {
            throw new AssembleError(`Cannot find label "${label}" offset for line "${asmLine.toString()}". No such label or offsets were not filled.`);
          }

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