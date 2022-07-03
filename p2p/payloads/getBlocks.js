import { Buffer } from 'buffer';
import * as CONSTANTS from './constants.js.js';

const VERSION_OFFSET = 0;
const VERSION_LENGTH = 4;

const BLOCK_HEADER_HASH_OFFSET = 4;
const BLOCK_HEADER_HASH_LENGTH = 32;

const STOP_HASH_LENGTH = 32;

export class GetBlock {
  constructor(version, hashCount, blockHeaderHashes, stopHash) {
    this.version = version;
    this.hashCount = hashCount;
    this.blockHeaderHashes = blockHeaderHashes;
    this.stopHash = stopHash;
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