import { describe, expect, it } from 'vitest';
import { AsmLine } from '../../asm/AsmLine.ts';
import { Operand } from '../../asm/Operand.ts';

describe('AsmLine', () => {
  describe('clone', () => {
    it('should clone all properties', () => {
      const operands = [
        Operand.fromImmediate('0', 0),
        Operand.fromImmediate('0b10', 0b10),
        Operand.fromLabel('.loop'),
      ];
      const asmLine = new AsmLine('BRA', operands, 'JZ', [Operand.fromLabel('.loop')]);
      const clone = asmLine.clone();
      expect(asmLine.toString() === clone.toString());
      expect(clone === asmLine).toBe(false);
      expect(clone.getMnemonic()).toEqual(asmLine.getMnemonic());
      expect(clone.getOperands() === asmLine.getOperands()).toBe(false);
      expect(clone.getAliasMnemonic()).toEqual(asmLine.getAliasMnemonic());
      expect(clone.getAliasOperands() === asmLine.getAliasOperands()).toBe(false);
    });
  });
});