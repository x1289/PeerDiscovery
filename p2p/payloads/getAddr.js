import { Buffer } from 'buffer';

export class GetAddr {
  constructor() {
  }

  serialize() {
    return Buffer.alloc(0);
  }

  static deserialize() {
    return new GetAddr();
  }
}