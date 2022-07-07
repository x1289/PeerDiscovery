import { Buffer } from 'buffer';
import { Address } from '../address.js';
import * as helper from '../helper.js';

const COUNT_OFFSET = 0;

export class Addr {
  constructor(count, addresses) {
    this.count = count;
    this.addresses = addresses;
  }

  serialize() {
    const countBuffer = helper.toCompactSizeBuffer(this.count);
    const addressesBuffer = this.addresses.map((address) => {
      return address.serialize();
    });
    const dataLength = countBuffer.length + addressesBuffer.length * Address.ADDRESS_LENGTH;
    return Buffer.concat([countBuffer, ...addressesBuffer], dataLength);
  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg)) return null;
    const count = helper.readCompactSizeValue(msg, COUNT_OFFSET);
    const countBytes = helper.getCompactSizeBytes(count);

    const addresses = [];
    for (let i = 0; i < count; i++) {
      const addressStart = countBytes + i * Address.ADDRESS_LENGTH;
      addresses.push(Address.deserialize(msg.subarray(addressStart, addressStart + Address.ADDRESS_LENGTH)));
    }
    return new Addr(count, addresses);
  }
}
