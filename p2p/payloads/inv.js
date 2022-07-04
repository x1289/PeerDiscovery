import { Buffer } from 'buffer';
import { Inventory } from '../inventory.js';
import * as helper from '../helper.js';

const COUNT_OFFSET = 0;

export class Inv {
  constructor(serializedSize = null, count, inventories) {
    this.count = count;
    this.inventories = inventories;
    if (serializedSize === null) {
      this.serializedSize = this.serialize().length;
    } else {
      this.serializedSize = serializedSize;
    }
  }

  serialize() {
    const countBuffer = helper.toCompactSizeBuffer(this.count);
    const inventoriesBuffer = this.inventories.map((inventory) => {
      return inventory.serialize();
    });
    const dataLength = countBuffer.length + inventoriesBuffer.length * Inventory.INVENTORY_LENGTH;
    return Buffer.concat([countBuffer, ...inventoriesBuffer], dataLength);
  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg)) {
      console.log('inventory msg not a buffer', msg);
      return null;
    }
    const count = helper.readCompactSizeValue(msg, COUNT_OFFSET);
    const countBytes = helper.getCompactSizeBytes(count);
    if (msg.length !== (countBytes + count * Inventory.INVENTORY_LENGTH)) {
      console.log('inventory bad length', msg, count);
      return null;
    }
    const inventories = [];
    for (let i = 0; i < count; i++) {
      const inventoryStart = countBytes + i * Inventory.INVENTORY_LENGTH;
      const inv1 = Inventory.deserialize(msg.subarray(inventoryStart, inventoryStart + Inventory.INVENTORY_LENGTH));
      inventories.push(inv1);
    }
    const serializedSize = countBytes + count * Inventory.INVENTORY_LENGTH;
    return new Inv(serializedSize, count, inventories);
  }
}