export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'Parse Error';
  }

  message: string;
  name: string;
}