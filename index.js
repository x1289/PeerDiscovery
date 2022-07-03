import net from 'net';
import { Buffer } from 'buffer';
import crypto from 'crypto';

const addr = '51.68.36.57'
const port = 8333;

function checksum(msg) {
  const hashBuffer = hashMessage(msg);
  const cs = hashBuffer.subarray(0,4);
  return cs;
}

function hashMessage(msg) {
  let checkSumHash1 = crypto.createHash('sha256').update(msg).digest();
  let checkSumHash = crypto.createHash('sha256').update(checkSumHash1).digest();
  return checkSumHash;
}

function getVersionMessage() {
  const version = Buffer.from([0x7f, 0x11, 0x01, 0x00]);
  const services = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  const timestamp = Buffer.alloc(8);
  timestamp.writeUInt32LE(Math.floor(+new Date() / 1000), 0);
  
  const addrRecvServices = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
  const addrRecvIPAddress = Buffer.alloc(16);
  const tempAddrRecvIPAddress = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 51, 68, 36, 57])
  tempAddrRecvIPAddress.copy(addrRecvIPAddress, 16 - tempAddrRecvIPAddress.length);
  const addrRecvPort = Buffer.from([0x20, 0x8d]);

  const addrTransServices = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
  const addrTransIPAddress = Buffer.alloc(16);
  const tempAddrTransIPAddress = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0x7f, 0x00, 0x00, 0x01])
  tempAddrTransIPAddress.copy(addrTransIPAddress, 16 - tempAddrTransIPAddress.length);
  const addrTransPort = Buffer.from([0x20, 0x8d]);
  
  const nonce = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  
  const userAgentBytes = Buffer.from([0x10]);
  const userAgent = Buffer.from('/Satoshi:0.21.1/')

  const startHeight = Buffer.from([0x00, 0x00, 0x00, 0x00]);
  
  const relay = Buffer.from([0x00]);

  const versionMessageLength = version.length + services.length + timestamp.length + addrRecvServices.length + addrRecvIPAddress.length +
  addrRecvPort.length + addrTransServices.length + addrTransIPAddress.length + addrTransPort.length + nonce.length + userAgentBytes.length + userAgent.length + startHeight.length + relay.length;
  const versionMessage = Buffer.concat([version, services, timestamp, addrRecvServices, addrRecvIPAddress, addrRecvPort,
    addrTransServices, addrTransIPAddress, addrTransPort, nonce, userAgentBytes, userAgent, startHeight, relay], versionMessageLength);

  return versionMessage;
}

function getMessageHeader(message) {
  if (!message || !message.length) return;
  const startString = Buffer.from([0xf9, 0xbe, 0xb4, 0xd9])
  const commandName = Buffer.alloc(12);
  const tempCommandName = Buffer.from('version');
  tempCommandName.copy(commandName);

  const payloadSize = Buffer.alloc(4);
  payloadSize.writeUInt32LE(message.length, 0);

  const checkSum = checksum(message);
  
  const messageHeaderLength = startString.length + commandName.length + payloadSize.length + checkSum.length;
  return Buffer.concat([startString, commandName, payloadSize, checkSum], messageHeaderLength)
}

const versionMessage = getVersionMessage();
const messageHeader = getMessageHeader(versionMessage);

const msg = Buffer.concat([messageHeader, versionMessage], messageHeader.length + versionMessage.length);
