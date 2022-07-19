import { Buffer } from 'buffer';

export class SendHeaders {
  constructor() {
  }

  serialize() {
    return Buffer.alloc(0);
  }

  static deserialize() {
    return new SendHeaders();
  }
}