export class ParseError implements Error {
  constructor(message: string) {
    this.message = message;
    this.name = 'Parse Error';
  }

  message: string;
  name: string;
}