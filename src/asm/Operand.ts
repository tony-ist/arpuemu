import { ParseError } from './ParseError.ts';
import { isBinaryNumber, isDecimalNumber, isHexNumber, isLabel, isRegister } from './util.ts';

export class Operand {
  private readonly sizeBits: number;
  private label?: string;
  private immediate?: number;
  private token?: string;

  constructor(token: string, sizeBits: number) {
    if (isLabel(token)) {
      this.label = token;
      return;
    }

    this.sizeBits = sizeBits;
    this.token = token;

    if (isRegister(token)) {
      // Register R1 is first one
      this.immediate = parseInt(token[1]) - 1;
    } else if (isDecimalNumber(token)) {
      this.immediate = parseInt(token);
    } else if (isHexNumber(token)) {
      this.immediate = parseInt(token.slice(2), 16);
    } else if (isBinaryNumber(token)) {
      this.immediate = parseInt(token.slice(2), 2);
    } else {
      throw new ParseError(`Unrecognized operand "${token}"`);
    }

    if (this.immediate >= Math.pow(2, this.sizeBits)) {
      throw new ParseError(`Immediate value for operand "${this.toString()}" should fit in ${this.sizeBits} bits"`);
    }
  }

  toInt() {
    return this.immediate;
  }

  toString() {
    return this.token || this.label;
  }
}