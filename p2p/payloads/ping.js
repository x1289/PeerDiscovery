import { Buffer } from 'buffer';

const NONCE_LENGTH = 8;
const NONCE_OFFSET = 0;

export class Ping {
  constructor(nonce) {
    this.nonce = nonce;
  }

  serialize() {
    const nonceBuffer = Buffer.alloc(NONCE_LENGTH);
    nonceBuffer.writeBigUint64LE(this.nonce);
    return nonceBuffer;
  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg) || msg.length !== NONCE_LENGTH) return null;
    const nonce = msg.readBigInt64LE(NONCE_OFFSET);
    return new Ping(nonce);
  }
}