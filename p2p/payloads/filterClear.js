import { Buffer } from 'buffer';

export class FilterClear {
  constructor() {
    this.serializedSize = 0;
  }

  serialize() {
    return Buffer.alloc(0);
  }

  static deserialize() {
    return new FilterAdd();
  }
}