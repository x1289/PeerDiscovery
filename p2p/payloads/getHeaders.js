import { Buffer } from 'buffer';
import * as CONSTANTS from '../constants.js';
import * as helper from '../helper.js';

const VERSION_OFFSET = 0;
const VERSION_LENGTH = 4;

const HASH_COUNT_OFFSET = 4;

const BLOCK_HEADER_HASH_OFFSET = 4;
const BLOCK_HEADER_HASH_LENGTH = 32;

const STOP_HASH_LENGTH = 32;

export class GetHeaders {
  constructor(version, hashCount, blockHeaderHashes, stopHash) {
    this.version = version;
    this.hashCount = hashCount;
    this.blockHeaderHashes = blockHeaderHashes;
    this.stopHash = stopHash;
  }

  serialize() {
    const versionBuffer = Buffer.alloc(VERSION_LENGTH);
    versionBuffer.writeUInt32LE(this.version);
    const hashCountBuffer = helper.toCompactSizeBuffer(this.hashCount);
    const blockHeaderHashesBuffer = this.blockHeaderHashes.map((blockHeaderHash) => {
      return Buffer.from(blockHeaderHash, 'hex');
    });
    const stopHashBuffer = Buffer.from(this.stopHash, 'hex');

    const dataLength = versionBuffer.length + hashCountBuffer.length + blockHeaderHashesBuffer.length * BLOCK_HEADER_HASH_LENGTH + stopHashBuffer.length;
    return Buffer.concat([versionBuffer, hashCountBuffer, ...blockHeaderHashesBuffer, stopHashBuffer], dataLength);
  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg)) return null;

    const version = msg.readUInt32LE(VERSION_OFFSET);
    const hashCount = helper.readCompactSizeValue(msg, HASH_COUNT_OFFSET);
    const hashCountBytes = helper.getCompactSizeBytes(hashCount);

    const blockHeaderHashes = [];
    for (let i = 0; i < hashCount; i++) {
      const blockHeaderHashStart = BLOCK_HEADER_HASH_OFFSET + i * BLOCK_HEADER_HASH_LENGTH;
      blockHeaderHashes.push(msg.subarray(blockHeaderHashStart, blockHeaderHashStart + BLOCK_HEADER_HASH_LENGTH).toString('hex'));
    }

    const stopHashOffset = VERSION_LENGTH + hashCountBytes + hashCount * BLOCK_HEADER_HASH_LENGTH;
    const stopHash = msg.subarray(stopHashOffset, stopHashOffset + STOP_HASH_LENGTH).toString('hex');

    return new GetHeaders(version, hashCount, blockHeaderHashes, stopHash);
  }
}