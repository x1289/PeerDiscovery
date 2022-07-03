import { Buffer } from 'buffer';
import * as CONSTANTS from './constants.js';

const COUNT_OFFSET = 0;

export class Inv {
  constructor(count, inventory) {
    this.count = count;
    this.inventory = inventory;
  }

  serialize() {

  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg) || msg && msg.length > CONSTANTS.MAX_SIZE || msg.length < VERSION_LENGTH + STOP_HASH_LENGTH) return null;

    this.version = msg.readUInt32LE(VERSION_OFFSET);
    this.stopHash = msg.subarray(msg.length - 1 - STOP_HASH_LENGTH, msg.length - 1);
    this.blockHeaderHashes = [];
  }
}