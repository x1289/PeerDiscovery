import { Buffer } from 'buffer';

const TIME_OFFSET = 0;
const TIME_LENGTH = 4;

const SERVICES_OFFSET = 4;
const SERVICES_LENGTH = 12;

const IP_OFFSET = 16;
const IP_LENGTH = 16;

const PORT_OFFSET = 28;
const PORT_LENGTH = 2;

export class Address {
  static ADDRESS_LENGTH = 30;

  constructor(time, services, ip, port) {
    this.time = time;
    this.services = services;
    this.ip = ip;
    this.port = port;
  }

  serialize() {
    if (!this.time || !this.services || !this.ip || !this.port) return null;
    const timeBuffer = Buffer.alloc(TIME_LENGTH);
    timeBuffer.writeUInt32LE(this.time);
    const servicesBuffer = Buffer.alloc(SERVICES_LENGTH);
    servicesBuffer.writeBigUint64LE(this.services);
    const ipBuffer = Buffer.alloc(IP_LENGTH);
    const ipStringBuffer = Buffer.from(this.ip, 'hex');
    ipStringBuffer.copy(ipBuffer, IP_LENGTH - ipStringBuffer.length);
    const portBuffer = Buffer.alloc(PORT_LENGTH);
    portBuffer.writeUint16BE(this.port);
    return Buffer.concat([timeBuffer, servicesBuffer, ipBuffer, portBuffer], timeBuffer.length + servicesBuffer.length + ipBuffer.length + portBuffer.length);
  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg) || msg.length !== Address.ADDRESS_LENGTH) return null;
    const time = msg.readUint32LE(TIME_OFFSET);
    const services = msg.readBigUint64LE(SERVICES_OFFSET);
    const ip = msg.subarray(IP_OFFSET, IP_OFFSET + IP_LENGTH).toString('hex');
    const port = msg.readUint16BE(PORT_OFFSET);
    return new Address(time, services, ip, port)
  }
}
