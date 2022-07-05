import { Buffer } from 'buffer';
import { MessageHeader } from './messageHeader.js';
import * as CONSTANTS from './constants.js';
import * as payloads from './payloads/payloads.js';

export class Message {
  constructor(header = null, payload = null) {
    this.header = header;
    this.payload = payload;
  }

  size() {
    return MessageHeader.HEADER_SIZE + (this.payload === null ? 0 : this.payload.serializedSize);
  }

  serialize() {
    if (!this.header) return null;
    const serializedHeader = this.header.serialize();
    const serializedPayload = this.payload === null ? Buffer.alloc(0) : this.payload.serialize();
    return Buffer.concat([serializedHeader, serializedPayload], serializedHeader.length + serializedPayload.length);
  }

  static deserialize(msg) {
    if (!msg || !Buffer.isBuffer(msg) || msg.length < MessageHeader.HEADER_SIZE) return null;
    const header = MessageHeader.deserialize(msg.subarray(0, MessageHeader.HEADER_SIZE));
    let payload = null;
    if (msg.length > MessageHeader.HEADER_SIZE && header?.commandName) payload = Message.deserializePayload(header.commandName, msg.subarray(MessageHeader.HEADER_SIZE, msg.length));
    return new Message(header, payload);
  }

  static deserializePayload(commandName, payload) {
    switch (commandName) {
        case CONSTANTS.COMMAND_NAME_FEE_FILTER:
          return payloads.FeeFilter.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_GET_HEADERS:
          return payloads.GetHeaders.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_GET_BLOCKS:
          return payloads.GetBlocks.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_MEMPOOL:
          break;
        case CONSTANTS.COMMAND_INV:
          return payloads.Inv.deserialize(payload);
        case CONSTANTS.COMMAND_GET_DATA:
          break;
        case CONSTANTS.COMMAND_NAME_HEADERS:
          break;
        case CONSTANTS.COMMAND_NAME_TX:
          break;
        case CONSTANTS.COMMAND_NAME_BLOCK:
          break;
        case CONSTANTS.COMMAND_NAME_MERKLE_BLOCK:
          break;
        case CONSTANTS.COMMAND_NAME_NOT_FOUND:
          break;
        case CONSTANTS.COMMAND_NAME_VERSION:
          return payloads.Version.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_VERACK:
          return payloads.VerAck.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_PING:
          return payloads.Ping.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_PONG:
          return payloads.Pong.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_GET_ADDR:
          return payloads.GetAddr.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_ADDR:
          return payloads.Addr.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_ADDR_V2:
          return payloads.AddrV2.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_FILTER_LOAD:
          return payloads.FilterLoad.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_FILTER_ADD:
          return payloads.FilterAdd.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_FILTER_CLEAR:
          return payloads.FilterClear.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_ALERT: // DEPRECATED
          break;
        case CONSTANTS.COMMAND_NAME_SEND_ADDR_V2:
          return payloads.SendAddrV2.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_SEND_HEADERS:
          return payloads.SendHeaders.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_REJECT: // DEPRECATED
          break;
        case CONSTANTS.COMMAND_NAME_CMPCT_BLOCK:
          break;
        case CONSTANTS.COMMAND_NAME_SEND_CMPCT:
          return payloads.SendCmpct.deserialize(payload);
        case CONSTANTS.COMMAND_NAME_GET_BLOCK_TXN:
          break;
        case CONSTANTS.COMMAND_NAME_BLOCK_TXN:
          break;
        default:
          return null;
    }
  }
}
