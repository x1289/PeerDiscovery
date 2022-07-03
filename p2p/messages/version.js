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
  constructor(version, services, timestamp, addrRecvServices, addrRecvIp, addrRecvPort,
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
    addrRecvPort.writeUint16BE(this.addrRecvPort);
    const addrTransServices = Buffer.alloc(8);

    const addrTransIp = this.addrTransIp;

    const addrTransPort = Buffer.alloc(2);
    addrTransPort.writeUint16BE(this.addrTransPort);
    const nonce = Buffer.alloc(8);
    nonce.writeBigUint64LE(this.nonce);

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
    if (!Buffer.isBuffer(msg) || msg.length < VERSION_MIN_LENGTH) return null;

    const version = msg.readUint32LE(VERSION_OFFSET);
    const services = msg.readBigUInt64LE(SERVICES_OFFSET);
    const timestamp = msg.readBigInt64LE(TIMESTAMP_OFFSET);
    const addrRecvServices = msg.readBigUInt64LE(ADDR_RECV_SERVICES_OFFSET);;
    const addrRecvIp = msg.subarray(ADDR_RECV_IP_OFFSET, ADDR_RECV_IP_OFFSET + ADDR_RECV_IP_LENGTH);
    const addrRecvPort = msg.readUint16BE(ADDR_RECV_PORT_OFFSET);
    const addrTransServices = msg.readBigUInt64LE(ADDR_TRANS_SERVICES_OFFSET);
    const addrTransIp = msg.subarray(ADDR_TRANS_IP_OFFSET, ADDR_TRANS_IP_OFFSET + ADDR_TRANS_IP_LENGTH);
    const addrTransPort = msg.readUint16BE(ADDR_TRANS_PORT_OFFSET);
    const nonce = msg.readBigUInt64LE(NONCE_OFFSET);
    const userAgentBytes = helper.readCompactSizeValue(msg, USER_AGENT_BYTES_OFFSET);
    const userAgentStart = USER_AGENT_BYTES_OFFSET + helper.getCompactSizeBytes(userAgentBytes);
    const userAgent = msg.subarray(userAgentStart, userAgentStart + userAgentBytes).toString();
    const startHeight = msg.readInt32LE(userAgentStart + userAgentBytes, START_HEIGHT_LENGTH);
    const relay = Boolean(msg.readInt8(userAgentStart + userAgentBytes + START_HEIGHT_LENGTH));

    return new Version(version, services, timestamp, addrRecvServices, addrRecvIp, addrRecvPort,
      addrTransServices, addrTransIp, addrTransPort, nonce, userAgentBytes, userAgent, startHeight, relay);
  }
}

// const sampleVersionMessage = Buffer.from([0x80, 0x11, 0x01, 0x00, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xef, 0x7f, 0xc0, 0x62,
// 0x00, 0x00, 0x00, 0x00, 0x0d, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
// 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0x33, 0x44, 0x24, 0x39, 0x20, 0x8d, 0x08, 0x04,
// 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
// 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x62, 0xa1, 0xd9, 0xe0, 0x64, 0xdb, 0xd3, 0xee,
// 0x10, 0x2f, 0x53, 0x61, 0x74, 0x6f, 0x73, 0x68, 0x69, 0x3a, 0x30, 0x2e, 0x32, 0x31, 0x2e, 0x31,
// 0x2f, 0x97, 0xaa, 0x0a, 0x00, 0x00])

// const sampleVersionMessage2 = Buffer.from([0x80, 0x11, 0x01, 0x00, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf0, 0x5c, 0xc1, 0x62,
// 0x00, 0x00, 0x00, 0x00, 0x0d, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
// 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0x33, 0x44, 0x24, 0x39, 0x20, 0x8d, 0x08, 0x04,
// 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
// 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xdd, 0x32, 0xa7, 0x26, 0x37, 0x75, 0x41, 0x9e,
// 0x10, 0x2f, 0x53, 0x61, 0x74, 0x6f, 0x73, 0x68, 0x69, 0x3a, 0x30, 0x2e, 0x32, 0x31, 0x2e, 0x31,
// 0x2f, 0xa7, 0xaa, 0x0a, 0x00, 0x00]);

// const deserialized = Version.deserialize(sampleVersionMessage);
// console.log('deserialized', deserialized, Version.deserialize(deserialized.serialize()));