const net = require('net');
const { Buffer } = require('buffer');
const crypto = require('crypto');

const addr = '51.68.36.57'
const port = 8333;

function checksum(msg) {
  const hashBuffer = hashMessage(msg);
  const cs = hashBuffer.subarray(0,4);
  console.log('cs', cs);
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
  
  
  // console.log('version', version, 'services', services, 'timestamp', timestamp, 'addrRecvServices', addrRecvServices, 'addrRecvIPAddress', addrRecvIPAddress,
  // 'addrRecvPort', addrRecvPort, 'nonce', nonce, 'userAgentBytes', userAgentBytes, 'startHeight', startHeight);
  // console.log('versionMessage', versionMessage, versionMessage.length);

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
  
  console.log('checksum', checkSum);

  // console.log('startString', startString, 'tempCommandName', tempCommandName, 'commandName', commandName, 'payloadSize', payloadSize, 'checkSum', checkSum)

  const messageHeaderLength = startString.length + commandName.length + payloadSize.length + checkSum.length;
  const messageHeader = Buffer.concat([startString, commandName, payloadSize, checkSum], messageHeaderLength)

  // console.log('message header', messageHeader);

  return messageHeader;
}

const versionMessage = getVersionMessage();
const messageHeader = getMessageHeader(versionMessage);

const msg = Buffer.concat([messageHeader, versionMessage], messageHeader.length + versionMessage.length);

let socket = net.createConnection(port, addr, () => {

})

socket.on('close', (hadError) => {
  console.log('socket close', hadError);
})

socket.on('connect', () => {
  socket.write(msg);
  console.log('socket connect');
})

socket.on('data', (data) => {
  console.log('socket data', data);
})

socket.on('end', () => {
  console.log('socket end');
})

socket.on('error', (error) => {
  console.log('socket error', error);
})

socket.on('lookup', (err, address, family, host) => {
  console.log('socket lookup', err, address, family, host);
})

// const validMessage = Buffer.from([0x80, 0x11, 0x01, 0x00, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xd2, 0x11, 0xbf, 0x62, 0x00, 0x00, 0x00, 0x00, 0x0d, 0x04, 0x00, 0x00,
//   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0x33, 0x44, 0x24, 0x39, 0x20, 0x8d, 0x08, 0x04,
//   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
//   0xec, 0xa4, 0xcf, 0x4b, 0x59, 0x75, 0xe0, 0x14, 0x10, 0x2f, 0x53, 0x61, 0x74, 0x6f, 0x73, 0x68, 0x69, 0x3a, 0x30, 0x2e, 0x32, 0x31, 0x2e, 0x31,
//   0x2f, 0x91, 0xaa, 0x0a, 0x00, 0x00]);

// const validMessageLength = validMessage.length;

// hashMessage(validMessage);

// // const res = hashMessage('');
// const cs = checksum(validMessage);
// // const csInt = Number(res.slice(0,8))