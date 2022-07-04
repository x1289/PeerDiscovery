import { Buffer } from 'buffer';

const FEE_RATE_OFFSET = 0;
const FEE_RATE_LENGTH = 8;

export class FeeFilter {
  constructor(serializedSize = null, feeRate) {
    this.feeRate = feeRate;
    if (serializedSize === null) {
      this.serializedSize = this.serialize().length;
    } else {
      this.serializedSize = serializedSize;
    }
  }

  serialize() {
    const feeRateBuffer = Buffer.alloc(FEE_RATE_LENGTH);
    feeRateBuffer.writeBigUint64LE(this.feeRate);
    return feeRateBuffer;
  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg) || msg.length !== FEE_RATE_LENGTH) return null;
    const feeRate = msg.readBigUInt64LE(FEE_RATE_OFFSET);
    return new FeeFilter(FEE_RATE_LENGTH, feeRate);
  }
}