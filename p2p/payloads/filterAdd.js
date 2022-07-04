import { Buffer } from 'buffer';
import * as helper from '../helper.js';

const ELEMENT_BYTES_OFFSET = 0;

export class FilterAdd {
  constructor(serializedSize = null, elementBytes, element) {
    this.elementBytes = elementBytes;
    this.element = element;
    if (serializedSize === null) {
      this.serializedSize = this.serialize().length;
    } else {
      this.serializedSize = serializedSize;
    }
  }

  serialize() {
    const elmentBytesBuffer = helper.toCompactSizeBuffer(this.elementBytes);
    const elementBuffer = Buffer.from(this.element);
    const dataLength = elmentBytesBuffer.length + this.elementBytes;
    return Buffer.concat([elmentBytesBuffer, elementBuffer], dataLength);
  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg)) return null;
    const elementBytes = helper.readCompactSizeValue(msg, ELEMENT_BYTES_OFFSET);
    const elementBytesBytes = helper.getCompactSizeBytes(elementBytes);
    if (msg.length !== (ELEMENT_BYTES_OFFSET + elementBytesBytes)) return null;

    const element = msg.subarray(elementBytesBytes, elementBytesBytes + elementBytes);
    const serializedSize = elementBytesBytes + elementBytes;
    return new FilterAdd(serializedSize, elementBytes, element);
  }
}