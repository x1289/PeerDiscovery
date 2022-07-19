import { Buffer } from 'buffer';

const NONCE_LENGTH = 8;
const NONCE_OFFSET = 0;

export class Ping {
  constructor(nonce) {
    this.nonce = nonce;
  }

  serialize() {
    const nonceBuffer = Buffer.alloc(NONCE_LENGTH);
    nonceBuffer.writeBigUInt64LE(this.nonce);
    return nonceBuffer;
  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg)) return null;
    const nonce = msg.readBigUInt64LE(NONCE_OFFSET);
    return new Ping(nonce);
  }
}