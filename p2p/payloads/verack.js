import { Buffer } from 'buffer';

export class VerAck {
  constructor() {
    this.serializedSize = 0;
  }

  serialize() {
    return Buffer.alloc(0);
  }

  static deserialize() {
    return new VerAck();
  }
}
