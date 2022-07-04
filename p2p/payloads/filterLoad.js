import { Buffer } from 'buffer';
import * as helper from '../helper.js';

const MAX_N_HASH_FUNCS = 50;
const MAX_FILTER_LENGTH = 36000;

const N_FILTER_BYTES_OFFSET = 0;

const N_HASH_FUNCS_LENGTH = 4;
const N_TWEAK_LENGTH = 4;
const N_FLAGS_LENGTH = 1;

export class FilterLoad {
  constructor(serializedSize, nFilterBytes, filter, nHashFuncs, nTweak, nFlags) {
    if (!filter || filter.length > MAX_FILTER_LENGTH || nHashFuncs > MAX_N_HASH_FUNCS) return null;
    this.nFilterBytes = nFilterBytes;
    this.filter = filter;
    this.nHashFuncs = nHashFuncs;
    this.nTweak = nTweak;
    this.nFlags = nFlags;
    if (serializedSize === null) {
      this.serializedSize = this.serialize().length;
    } else {
      this.serializedSize = serializedSize;
    }
  }

  serialize() {
    const nFilterBytesBuffer = helper.toCompactSizeBuffer(this.nFilterBytes);
    const filterBuffer = Buffer.from(this.filter);
    const nHashFuncsBuffer = Buffer.alloc(N_HASH_FUNCS_LENGTH);
    nHashFuncsBuffer.writeUint32LE(this.nHashFuncs)
    const nTweakBuffer = Buffer.alloc(N_TWEAK_LENGTH);
    nTweakBuffer.writeUint32LE(this.nTweak);
    const nFlagsBuffer = Buffer.alloc(N_FLAGS_LENGTH);
    nFlagsBuffer.writeUint8(this.nFlags);
    const dataLength = nFilterBytesBuffer.length + filterBuffer.length + nHashFuncsBuffer.length + nTweakBuffer.length + nFlagsBuffer.length;
    return Buffer.concat([nFilterBytesBuffer, filterBuffer, nHashFuncsBuffer, nTweakBuffer, nFlagsBuffer], dataLength);
  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg)) return null;
    const nFilterBytes = helper.readCompactSizeValue(msg, N_FILTER_BYTES_OFFSET);
    const nFilterBytesBytes = helper.getCompactSizeBytes(nFilterBytes);

    const filter = Array.from(msg.subarray(nFilterBytesBytes, nFilterBytesBytes + nFilterBytes));
    const nHashFuncs = Buffer.readUInt32LE(nFilterBytesBytes + nFilterBytes);
    const nTweak = Buffer.readUInt32LE(nFilterBytesBytes + nFilterBytes + N_HASH_FUNCS_LENGTH);
    const nFlags = Buffer.readUInt8(nFilterBytesBytes + nFilterBytes + N_HASH_FUNCS_LENGTH + N_TWEAK_LENGTH);
    
    const serializedSize = nFilterBytesBytes + nFilterBytes + N_HASH_FUNCS_LENGTH + N_TWEAK_LENGTH + N_FLAGS_LENGTH;
    return new FilterLoad(serializedSize, nFilterBytes, filter, nHashFuncs, nTweak, nFlags);
  }
}