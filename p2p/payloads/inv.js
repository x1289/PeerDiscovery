import { Buffer } from 'buffer';
import * as CONSTANTS from '../constants.js';
import { Inventory } from '../inventory.js';
import * as helper from '../helper.js';

const COUNT_OFFSET = 0;

export class Inv {
  constructor(count, inventories) {
    this.count = count;
    this.inventories = inventories;
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
    if (!Buffer.isBuffer(msg)) return null;
    const count = helper.readCompactSizeValue(msg, COUNT_OFFSET);
    const countBytes = helper.getCompactSizeBytes(count);
    if (msg.length !== (countBytes + count * Inventory.INVENTORY_LENGTH)) return null;
    const inventories = [];
    for (let i = 0; i < count; i++) {
      const inventoryStart = countBytes + i * Inventory.INVENTORY_LENGTH;
      inventories.push(Inventory.deserialize(msg.subarray(inventoryStart, inventoryStart + Inventory.INVENTORY_LENGTH)));
    }
    return new Inv(count, inventories);
  }
}