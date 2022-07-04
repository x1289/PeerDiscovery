import { Buffer } from 'buffer';

export class GetAddr {
  constructor() {
    this.serializedSize = 0;
  }

  serialize() {
    return Buffer.alloc(0);
  }

  static deserialize() {
    return new GetAddr();
  }
}