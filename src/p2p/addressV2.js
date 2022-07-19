import { Buffer } from 'buffer';

//#region serialization constants
const TIME_OFFSET = 0;
const TIME_LENGTH = 4;

const SERVICES_OFFSET = 4;

const NETWORK_ID_LENGTH = 1;

const PORT_LENGTH = 2;
//#endregion

//#region bip155 constants
const NETWORK_ID_01 = {ID: 0x01, Enumeration: 'IPV4', AddressLength: 4};
const NETWORK_ID_02 = {ID: 0x02, Enumeration: 'IPV6', AddressLength: 16};
const NETWORK_ID_03 = {ID: 0x03, Enumeration: 'TORV2', AddressLength: 10};
const NETWORK_ID_04 = {ID: 0x04, Enumeration: 'TORV3', AddressLength: 32};
const NETWORK_ID_05 = {ID: 0x05, Enumeration: 'I2P', AddressLength: 32};
const NETWORK_ID_06 = {ID: 0x06, Enumeration: 'CJDNS', AddressLength: 16};
//#endregion

export class AddressV2 {
  static ADDRESS_LENGTH = 26;

  constructor(serializedSize = null, time, services, networkId, addressLength, address, port) {
    this.time = time;
    this.services = services;
    this.networkId = networkId;
    this.addressLength = addressLength;
    this.address = address;
    this.port = port;
    if (serializedSize === null) {
      this.serializedSize = this.serialize().length;
    } else {
      this.serializedSize = serializedSize;
    }
  }

  serialize() {
    if (!this.services || !this.ip || !this.port) return null;
    const timeBuffer = Buffer.alloc(TIME_LENGTH);
    timeBuffer.writeUInt32LE(this.time);

    const servicesBuffer = helper.toCompactSizeBuffer(this.services);

    const networkIdBuffer = Buffer.alloc(NETWORK_ID_LENGTH);
    networkIdBuffer.writeUInt8(this.networkId);

    const addressLengthBuffer = helper.toCompactSizeBuffer(this.addressLength);

    const addressBuffer = Buffer.from(this.address); // TODO: parse this to IP
    
    const portBuffer = Buffer.alloc(PORT_LENGTH);
    portBuffer.writeUInt16BE(this.port);

    const dataLength = timeBuffer.length + servicesBuffer.length + networkIdBuffer.length + addressLengthBuffer.length + addressBuffer.length + portBuffer.length;
    return Buffer.concat([timeBuffer, servicesBuffer, networkIdBuffer, addressLengthBuffer, addressBuffer, portBuffer], dataLength);
  }

  static deserialize(msg) {
    if (!Buffer.isBuffer(msg)) return null;
    const time = msg.readUInt32LE(TIME_OFFSET);
    const services = helper.readCompactSizeValue(msg, SERVICES_OFFSET);
    const servicesBytes = helper.getCompactSizeBytes(services);

    const networkIdOffset = TIME_OFFSET + TIME_LENGTH + servicesBytes;
    const networkId = msg.readUInt8(networkIdOffset)
    const addressLengthOffset = networkIdOffset + NETWORK_ID_LENGTH;

    const addressLength = helper.readCompactSizeValue(msg, addressLengthOffset);
    const addressLengthBytes = helper.getCompactSizeBytes(addressLength);

    const addressOffset = addressLengthOffset + addressLengthBytes;
    const address = Array.from(msg.subarray(addressOffset, addressOffset + addressLength)); // TODO: parse this from Buffer to IP

    const portOffset = addressOffset + addressLength;
    const port = msg.readUInt16BE(portOffset);
    const serializedSize = TIME_LENGTH + servicesBytes + NETWORK_ID_LENGTH + addressLengthBytes + addressLength + PORT_LENGTH;
    return new AddressV2(serializedSize, time, services, networkId, addressLength, address, port)
  }
}
