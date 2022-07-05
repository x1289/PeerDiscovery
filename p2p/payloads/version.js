import { Buffer } from 'buffer';
import * as CONSTANTS from '../constants.js';
import * as helper from '../helper.js';

//#region Constants
const VERSION_OFFSET = 0;
const VERSION_LENGTH = 4

const SERVICES_OFFSET = 4;
const SERVICES_LENGTH = 8;

const TIMESTAMP_OFFSET = 12;
const TIMESTAMP_LENGTH = 8;

const ADDR_RECV_SERVICES_OFFSET = 20;
const ADDR_RECV_SERVICES_LENGTH = 8;

const ADDR_RECV_IP_OFFSET = 28;
const ADDR_RECV_IP_LENGTH = 16;

const ADDR_RECV_PORT_OFFSET = 44;
const ADDR_RECV_PORT_LENGTH = 2;

const ADDR_TRANS_SERVICES_OFFSET = 46;
const ADDR_TRANS_SERVICES_LENGTH = 8;

const ADDR_TRANS_IP_OFFSET = 54;
const ADDR_TRANS_IP_LENGTH = 16;

const ADDR_TRANS_PORT_OFFSET = 70;
const ADDR_TRANS_PORT_LENGTH = 2;

const NONCE_OFFSET = 72;
const NONCE_LENGTH = 8;

const USER_AGENT_BYTES_OFFSET = 80;

const START_HEIGHT_LENGTH = 4;

const RELAY_LENGTH = 1;

const VERSION_MIN_LENGTH = 86;
//#endregion

export class Version {
  constructor(serializedSize, version, services, timestamp, addrRecvServices, addrRecvIp, addrRecvPort,
    addrTransServices, addrTransIp, addrTransPort, nonce, userAgentBytes, userAgent, startHeight, relay) {
      if (userAgentBytes !== 0x00 && userAgent && userAgentBytes !== userAgent.length) return null;
      this.version = version;
      this.services = services;
      this.timestamp = timestamp;
      this.addrRecvServices = addrRecvServices;
      this.addrRecvIp = addrRecvIp;
      this.addrRecvPort = addrRecvPort;
      this.addrTransServices = addrTransServices;
      this.addrTransIp = addrTransIp;
      this.addrTransPort = addrTransPort;
      this.nonce = nonce;
      this.userAgentBytes = userAgentBytes;
      this.userAgent = userAgent;
      this.startHeight = startHeight;
      this.relay = relay;
      if (serializedSize === null) {
        this.serializedSize = this.serialize().length;
      } else {
        this.serializedSize = serializedSize;
      }
  }

  serialize() {
    const version = Buffer.alloc(4)
    version.writeInt32LE(this.version);
    const services = Buffer.alloc(8);
    services.writeBigUInt64LE(this.services);
    const timestamp = Buffer.alloc(8);
    timestamp.writeBigInt64LE(this.timestamp);
    const addrRecvServices = Buffer.alloc(8);
    addrRecvServices.writeBigUInt64LE(this.addrRecvServices);
    const addrRecvIp = this.addrRecvIp;

    const addrRecvPort = Buffer.alloc(2);
    addrRecvPort.writeUInt16BE(this.addrRecvPort);
    const addrTransServices = Buffer.alloc(8);

    const addrTransIp = this.addrTransIp;

    const addrTransPort = Buffer.alloc(2);
    addrTransPort.writeUInt16BE(this.addrTransPort);
    const nonce = Buffer.alloc(8);
    nonce.writeBigUInt64LE(this.nonce);

    const userAgentBytes = helper.toCompactSizeBuffer(this.userAgentBytes); // = Buffer.alloc(helper.getCompactSizeBytes(this.userAgentBytes));
    const userAgent = Buffer.from(this.userAgent);
    const startHeight = Buffer.alloc(4);
    startHeight.writeInt32LE(this.startHeight);
    const relay = Buffer.from([this.relay ? 0x01 : 0x00]);

    const versionMessageLength = version.length + services.length + timestamp.length + addrRecvServices.length + addrRecvIp.length +
  addrRecvPort.length + addrTransServices.length + addrTransIp.length + addrTransPort.length + nonce.length + userAgentBytes.length + userAgent.length + startHeight.length + relay.length;
  return Buffer.concat([version, services, timestamp, addrRecvServices, addrRecvIp, addrRecvPort,
    addrTransServices, addrTransIp, addrTransPort, nonce, userAgentBytes, userAgent, startHeight, relay], versionMessageLength);
  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg)) return null;
    const version = msg.readUInt32LE(VERSION_OFFSET);
    const services = msg.readBigUInt64LE(SERVICES_OFFSET);
    const timestamp = msg.readBigInt64LE(TIMESTAMP_OFFSET);
    const addrRecvServices = msg.readBigUInt64LE(ADDR_RECV_SERVICES_OFFSET);
    const addrRecvIp = msg.subarray(ADDR_RECV_IP_OFFSET, ADDR_RECV_IP_OFFSET + ADDR_RECV_IP_LENGTH);
    const addrRecvPort = msg.readUInt16BE(ADDR_RECV_PORT_OFFSET);
    const addrTransServices = msg.readBigUInt64LE(ADDR_TRANS_SERVICES_OFFSET);
    const addrTransIp = msg.subarray(ADDR_TRANS_IP_OFFSET, ADDR_TRANS_IP_OFFSET + ADDR_TRANS_IP_LENGTH);
    const addrTransPort = msg.readUInt16BE(ADDR_TRANS_PORT_OFFSET);
    const nonce = msg.readBigUInt64LE(NONCE_OFFSET);
    const userAgentBytes = helper.readCompactSizeValue(msg, USER_AGENT_BYTES_OFFSET);
    const userAgentBytesBytes = helper.getCompactSizeBytes(userAgentBytes);
    const userAgentStart = USER_AGENT_BYTES_OFFSET + helper.getCompactSizeBytes(userAgentBytes);
    const userAgent = msg.subarray(userAgentStart, userAgentStart + userAgentBytes).toString();
    const startHeight = msg.readInt32LE(userAgentStart + userAgentBytes, START_HEIGHT_LENGTH);
    const relay = Boolean(msg.readInt8(userAgentStart + userAgentBytes + START_HEIGHT_LENGTH));

    const serializedSize = VERSION_LENGTH + SERVICES_LENGTH + TIMESTAMP_LENGTH + ADDR_RECV_SERVICES_LENGTH + ADDR_RECV_IP_LENGTH + ADDR_RECV_PORT_LENGTH +
      ADDR_TRANS_SERVICES_LENGTH + ADDR_TRANS_IP_LENGTH + ADDR_TRANS_PORT_LENGTH + NONCE_LENGTH + userAgentBytesBytes + userAgentBytes + START_HEIGHT_LENGTH + RELAY_LENGTH;
    return new Version(serializedSize, version, services, timestamp, addrRecvServices, addrRecvIp, addrRecvPort,
      addrTransServices, addrTransIp, addrTransPort, nonce, userAgentBytes, userAgent, startHeight, relay);
  }
}
