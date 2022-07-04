import { Buffer } from 'buffer';

export class SendAddrV2 {
  constructor() {
    this.serializedSize = 0;
  }

  serialize() {
    return Buffer.alloc(0);
  }

  static deserialize() {
    return new SendAddrV2();
  }
}