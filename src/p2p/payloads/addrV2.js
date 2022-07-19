import { Buffer } from 'buffer';
import { AddressV2 } from '../addressV2.js';
import * as helper from '../helper.js';

const COUNT_OFFSET = 0;

export class AddrV2 {
  constructor(addressCount, addresses) {
    this.addressCount = addressCount;
    this.addresses = addresses;
  }

  serialize() {
    const countBuffer = helper.toCompactSizeBuffer(this.addressCount);
    let addressesLength = 0;
    const addressesBuffer = this.addresses.map((address) => {
      const serialized = address.serialize();
      addressesLength += serialized.length;
      return serialized;
    });
    const dataLength = countBuffer.length + addressesLength;
    return Buffer.concat([countBuffer, ...addressesBuffer], dataLength);
  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg)) return null;
    const addressCount = helper.readCompactSizeValue(msg, COUNT_OFFSET);
    const addressCountBytes = helper.getCompactSizeBytes(addressCount);
    const addresses = [];
    const subMsg = msg.subarray(addressCountBytes);
    for (let i = 0; i < addressCount; i++) {
      const addrV2 = AddressV2.deserialize(subMsg);
      addresses.push(addrV2);
    }
    return new AddrV2(addressCount, addresses);
  }
}