import { Buffer } from 'buffer';

const TYPE_IDENTIFIER_OFFSET = 0;
const TYPE_IDENTIFIER_LENGTH = 4;

const HASH_OFFSET = 4;
const HASH_LENGTH = 32;

const MSG_TX = 1;
const MSG_BLOCK = 2;
const MSG_FILTERED_BLOCK = 3;
const MSG_CMPCT_BLOCK = 4;

const MSG_WITNESS_TX = 1;
const MSG_WITNESS_BLOCK = 2;
const MSG_FILTERED_WITNESS_BLOCK = 3;

const TYPE_IDENTIFIER = [MSG_TX, MSG_BLOCK, MSG_FILTERED_BLOCK, MSG_CMPCT_BLOCK, MSG_WITNESS_TX, MSG_WITNESS_BLOCK, MSG_FILTERED_WITNESS_BLOCK];

export class Inventory {
  static INVENTORY_LENGTH = 36;

  constructor(typeIdentifier, hash) {
    if (!TYPE_IDENTIFIER.includes(typeIdentifier) || !hash || hash.length !== 2 * HASH_LENGTH) return null;
    this.typeIdentifier = typeIdentifier;
    this.hash = hash;
  }

  serialize() {
    if (!this.typeIdentifier || !this.hash) return null;
    const typeIdentifierBuffer = Buffer.alloc(TYPE_IDENTIFIER_LENGTH);
    typeIdentifierBuffer.writeUInt32LE(this.typeIdentifier);
    const hashBuffer = Buffer.from(this.hash, 'hex');
    return Buffer.concat([typeIdentifierBuffer, hashBuffer], typeIdentifierBuffer.length + hashBuffer.length);
  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg) || msg.length !== Inventory.INVENTORY_LENGTH) return null;
    const typeIdentifier = msg.readUint32LE(TYPE_IDENTIFIER_OFFSET);
    const hash = msg.subarray(HASH_OFFSET, HASH_OFFSET + HASH_LENGTH).toString('hex');
    return new Inventory(typeIdentifier, hash);
  }
}
