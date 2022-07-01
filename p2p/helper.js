import crypto from 'crypto';
import * as CONSTANTS from './constants.js';

export function checksum(msg) {
  const hashBuffer = hashMessage(msg);
  return hashBuffer.subarray(0, CONSTANTS.CHECKSUM_BYTE_COUNT);
}

export function hashMessage(msg, encoding = undefined) {
  let checkSumHash1 = crypto.createHash('sha256').update(msg).digest();
  let checkSumHash = crypto.createHash('sha256').update(checkSumHash1).digest(encoding);
  return checkSumHash;
}

export default {
  checksum,
  hashMessage
}
