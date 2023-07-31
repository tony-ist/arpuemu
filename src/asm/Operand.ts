export class Operand {
  private label?: string;
  private immediate?: number;
  private token: string;

  constructor(token: string, immediate?: number, label?: string) {
    this.token = token;
    this.immediate = immediate;
    this.label = label;
  }

  public static fromLabel(label: string) {
    return new Operand(label, undefined, label);
  }

  public static fromImmediate(token: string, immediate: number, label?: string) {
    return new Operand(token, immediate, label);
  }

  getLabel() {
    return this.label;
  }

  setImmediate(immediate: number) {
    this.immediate = immediate;
  }

  toInt() {
    return this.immediate;
  }

  toString() {
    return this.token || this.label;
  }

  clone() {
    return new Operand(this.token, this.immediate, this.label);
  }
}