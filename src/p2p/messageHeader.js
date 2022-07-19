import { Buffer } from 'buffer';
import * as CONSTANTS from './constants.js';

const HEADER_LENGTH = 24;

const START_STRING_OFFSET = 0;
const START_STRING_LENGTH = 4;

const COMMAND_NAME_OFFSET = 4;
const COMMAND_NAME_LENGTH = 12;

const PAYLOAD_SIZE_OFFSET = 16;
const PAYLOAD_SIZE_LENGTH = 4;

const CHECKSUM_OFFSET = 20;
const CHECKSUM_LENGTH = 4;


export class MessageHeader {

  static HEADER_SIZE = 24;

  constructor(startString, commandName, payloadSize, checksum) {
    if (startString === CONSTANTS.MAINNET_START_STRING ||
      startString === CONSTANTS.TESTNET_START_STRING ||
      startString === CONSTANTS.REGTEST_START_STRING) {
        this.startString = startString;
    } else {
      this.valid = false;
    }

    if (!CONSTANTS.COMMAND_NAMES.includes(commandName)) {
      this.valid = false;
    } else {
      this.commandName = commandName;
    }

    if (payloadSize !== null) {
      this.payloadSize = payloadSize;
    } else if (payload === null) {
      this.payloadSize = 0;
    } else {
      this.valid = false;
    }

    this.checksum = checksum;
  }

  serialize() {
    if (this.valid === false) return null;

    const startStringBuffer = Buffer.from(CONSTANTS.START_STRINGS[this.startString]);

    const commandNameBuffer = Buffer.alloc(12);
    Buffer.from(this.commandName).copy(commandNameBuffer);
    
    const payloadSizeBuffer = Buffer.alloc(4);
    let checkSumBuffer;
    if (this.payloadSize !== null) {
      payloadSizeBuffer.writeUInt32LE(this.payloadSize, 0);
      checkSumBuffer = this.checksum;
    } else {
      checkSumBuffer = Buffer.from(CONSTANTS.EMPTY_STRING_CHECKSUM_HEX);
    }

    const data = [startStringBuffer, commandNameBuffer, payloadSizeBuffer, checkSumBuffer];
    const dataLength = data.reduce((res, el) => res += el.length, 0);
    return Buffer.concat(data, dataLength);
  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg)) return null;

    const startStringBuffer = msg.subarray(START_STRING_OFFSET, START_STRING_OFFSET + START_STRING_LENGTH);
    let startString;
    if (Buffer.compare(startStringBuffer, Buffer.from(CONSTANTS.MAINNET_START_STRING_HEX)) === 0) {
      startString = CONSTANTS.MAINNET_START_STRING;
    } else if (Buffer.compare(startStringBuffer, Buffer.from(CONSTANTS.TESTNET_START_STRING_HEX)) === 0) {
      startString = CONSTANTS.TESTNET_START_STRING;
    } else if (Buffer.compare(startStringBuffer, Buffer.from(CONSTANTS.REGTEST_START_STRING_HEX)) === 0) {
      startString = CONSTANTS.REGTEST_START_STRING;
    } else {
      return null;
    }
    
    const commandNameTemp = msg.subarray(COMMAND_NAME_OFFSET, COMMAND_NAME_OFFSET + COMMAND_NAME_LENGTH).toString();
    const commandName = commandNameTemp.slice(0, commandNameTemp.indexOf('\x00'));

    const payloadSize = msg.readUInt32LE(PAYLOAD_SIZE_OFFSET);
    const checkSum = msg.subarray(CHECKSUM_OFFSET, CHECKSUM_OFFSET + CHECKSUM_LENGTH);
    
    return new MessageHeader(startString, commandName, payloadSize, checkSum);
  }
}
