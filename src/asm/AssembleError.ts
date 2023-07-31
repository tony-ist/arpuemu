export class AssembleError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'Assemble Error';
  }

  message: string;
  name: string;
}