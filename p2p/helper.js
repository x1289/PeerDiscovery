import crypto from 'crypto';
import { Buffer } from 'buffer';
import * as CONSTANTS from './constants.js';

export function checksum(msg) {
  const hashBuffer = hashMessage(msg);
  return hashBuffer.subarray(0, CONSTANTS.CHECKSUM_BYTE_COUNT);
}

export function doubleSHA(msg, len) {
  const hashBuffer = hashMessage(msg);
  return hashBuffer.subarray(0, len);
}

export function hashMessage(msg, encoding = undefined) {
  let checkSumHash1 = crypto.createHash('sha256').update(msg).digest();
  let checkSumHash = crypto.createHash('sha256').update(checkSumHash1).digest(encoding);
  return checkSumHash;
}

export function readCompactSizeValue(buf, offset) {
  if (!Buffer.isBuffer(buf) || buf.length < offset) return null;

  const identifier = buf.readUint8(offset);
  if (identifier < CONSTANTS.COMPACT_SIZE_UINT_16_IDENTIFIER) {
    return identifier;
  } else if (identifier === CONSTANTS.COMPACT_SIZE_UINT_16_IDENTIFIER) {
    if (buf.length < offset + CONSTANTS.COMPACT_SIZE_UINT_16_BYTES) return null;
    return buf.readUint16LE(offset + 1);
  } else if (identifier === CONSTANTS.COMPACT_SIZE_UINT_32_IDENTIFIER) {
    if (buf.length < offset + CONSTANTS.COMPACT_SIZE_UINT_32_BYTES) return null;
    return buf.readUInt32LE(offset + 1);
  } else if (identifier === CONSTANTS.COMPACT_SIZE_UINT_64_IDENTIFIER) {
    if (buf.length < offset + CONSTANTS.COMPACT_SIZE_UINT_64_BYTES) return null;
    return buf.readBigUInt64LE(offset + 1);
  }
}

export function getCompactSizeBytes(compactSizeValue) {
  if (typeof compactSizeValue === 'number') {
    if (compactSizeValue >= 0 && compactSizeValue <= 252) {
      return 1;
    } else if (compactSizeValue >= 253 && compactSizeValue <= 0xffff) {
      return 3;
    } else if (compactSizeValue >= 0x10000 && compactSizeValue <= 0xffffffff) {
      return 5;
    }
  } else if (typeof compactSizeValue === 'bigint') {
    if (compactSizeValue >= 0 && compactSizeValue <= 252) {
      return 1;
    } else if (compactSizeValue >= 253 && compactSizeValue <= 0xffff) {
      return 3;
    } else if (compactSizeValue >= 0x10000 && compactSizeValue <= 0xffffffff) {
      return 5;
    } else if (compactSizeValue >= 0x100000000 && compactSizeValue <= 0xffffffffffffffff) {
      return 9;
    }
  }
}

export function toCompactSizeBuffer(value) {
  if (typeof value === 'number') {
    if (value >= 0 && value <= 252) {
      return Buffer.from([value]);
    } else if (value >= 253 && value <= 0xffff) {
      const valueBuffer = Buffer.alloc(2);
      valueBuffer.writeUInt16LE(value);
      return Buffer.from([0xfd, ...[...valueBuffer]]);
    } else if (value >= 0x10000 && value <= 0xffffffff) {
      const valueBuffer = Buffer.alloc(4);
      valueBuffer.writeUInt32LE(value);
      return Buffer.from([0xfe, ...[...valueBuffer]]);
    }
  } else if (typeof value === 'bigint') {
    if (value >= 0 && value <= 252) {
      return Buffer.from([value]);
    } else if (value >= 253 && value <= 0xffff) {
      const valueBuffer = Buffer.alloc(2);
      valueBuffer.writeUInt16LE(value);
      return Buffer.from([0xfd, ...[...valueBuffer]]);
    } else if (value >= 0x10000 && value <= 0xffffffff) {
      const valueBuffer = Buffer.alloc(4);
      valueBuffer.writeUInt32LE(value);
      return Buffer.from([0xfe, ...[...valueBuffer]]);
    } else if (value >= 0x100000000 && value <= 0xffffffffffffffff) {
      const valueBuffer = Buffer.alloc(8);
      valueBuffer.writeBigUInt64LE(value);
      return Buffer.from([0xfe, ...[...valueBuffer]]);
    }
  }
}

export default {
  checksum,
  hashMessage
}
