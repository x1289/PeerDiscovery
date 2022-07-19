import { Buffer } from 'buffer';

export class FilterClear {
  constructor() {
  }

  serialize() {
    return Buffer.alloc(0);
  }

  static deserialize() {
    return new FilterAdd();
  }
}