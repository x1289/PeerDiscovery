import { Buffer } from 'buffer';

const ANNOUNCE_OFFSET = 0;
const ANNOUNCE_LENGTH = 1;

const VERSION_OFFSET = 1;
const VERSION_LENGTH = 8;

export class SendCmpct {
  constructor(announce, version) {
    this.announce = announce;
    this.version = version;
  }

  serialize() {
    const announceBuffer = this.announce === true ? Buffer.from([0x01]) : Buffer.from([0x00]);
    versionBuffer = Buffer.alloc(VERSION_LENGTH);
    versionBuffer.writeBigUInt64LE(this.version);
    return Buffer.concat([announceBuffer, versionBuffer], announceBuffer.length + versionBuffer.length);
  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg)) return null;
    const announce = Boolean(msg.readInt8(ANNOUNCE_OFFSET));
    const version = msg.readBigUInt64LE(VERSION_OFFSET);
    return new SendCmpct(announce, version);
  }
}