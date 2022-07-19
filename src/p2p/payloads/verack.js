import { Buffer } from 'buffer';

export class VerAck {
  constructor() {
  }

  serialize() {
    return Buffer.alloc(0);
  }

  static deserialize() {
    return new VerAck();
  }
}
