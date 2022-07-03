import { Buffer } from 'buffer';
import { MessageHeader } from './messageHeader.js';
import * as CONSTANTS from './constants.js';
import * as payloads from './payloads/payloads.js';

export class Message {
  constructor(header = null, payload = null) {
    this.header = header;
    this.payload = payload;
  }

  serialize() {
    if (!this.header || !this.payload) return null;
    const serializedHeader = this.header.serialize();
    const serializedPayload = this.payload.serialize();
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
        case CONSTANTS.COMMAND_NAME_GET_HEADERS:
          break;
        case CONSTANTS.COMMAND_NAME_GET_BLOCKS:
          break;
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
          break;
          
        case CONSTANTS.COMMAND_NAME_PING:
          break;
        case CONSTANTS.COMMAND_NAME_PONG:
          break;
          
        case CONSTANTS.COMMAND_NAME_GET_ADDR:
          break;
        case CONSTANTS.COMMAND_NAME_ADDR:
          break;
        case CONSTANTS.COMMAND_NAME_ADDR_V2:
          break;
          
        case CONSTANTS.COMMAND_NAME_FILTER_LOAD:
          break;
        case CONSTANTS.COMMAND_NAME_FILTER_ADD:
          break;
        case CONSTANTS.COMMAND_NAME_FILTER_CLEAR:
          break;
          
        case CONSTANTS.COMMAND_NAME_ALERT:
          break;
          
        case CONSTANTS.COMMAND_NAME_SEND_ADDR_V2:
          break;
          
        case CONSTANTS.COMMAND_NAME_SEND_HEADERS:
          break;
          
        case CONSTANTS.COMMAND_NAME_REJECT:
          break;
        default:
          return null;
    }
  }
}
