import { ParseError } from './ParseError.ts';
import { isLabel } from './util.ts';

function isDecimalNumber(token: string) {
  return /[0-9]+/.test(token);
}

function isHexNumber(token: string) {
  return token.startsWith('0x');
}

function isBinaryNumber(token: string) {
  return token.startsWith('0b');
}

export class Operand {
  private sizeBits: number;
  private label?: string;
  private immediate?: number;

  constructor(token: string, index: number) {
    if (index > 2) {
      throw new ParseError('Only 3 operands are supported');
    }

    if (isLabel(token)) {
      this.label = token;
    } else if (isDecimalNumber(token)) {
      this.immediate = parseInt(token);
    } else if (isHexNumber(token)) {
      this.immediate = parseInt(token.slice(2), 16);
    } else if (isBinaryNumber(token)) {
      this.immediate = parseInt(token.slice(2), 2);
    } else {
      throw new ParseError(`Unrecognized operand "${token}"`);
    }

    this.sizeBits = index === 2 ? 8 : 2;
  }
}