import net from 'net';
const { randomUUID } = require('crypto');
import { Message } from './p2p/message.js';
import { MessageHeader } from './p2p/messageHeader.js';
import * as CONSTANTS from './p2p/constants.js';
import * as payloads from './p2p/payloads/payloads.js';
import * as helper from './p2p/helper.js';
import { Peer } from './Peer.js';

class PeerDiscovery {
  constructor(network = CONSTANTS.MAINNET_START_STRING, version = 70015) {
    if (network !== CONSTANTS.MAINNET_START_STRING &&
      network !== CONSTANTS.TESTNET_START_STRING &&
      network !== CONSTANTS.REGTEST_START_STRING) return null;
    this.network = network;
    this.version = version;
    this.peers = {};
  }

  createPeer(port = 8333, address) {
    if (!net.isIP(address)) return false;
    const peer = new Peer(randomUUID(), port, address)
    this.peers[peer.id] = peer;
    return true;
  }

  connectToPeer(peer) {
    peer.connect();
    if (!peer) return false;
    this.socket = net.createConnection(peer.port, peer.address);
    this.socket.on('close', (hadError) => {
      console.log('socket close', hadError);
    })
    
    this.socket.on('connect', () => {
      const connectMessagePayload = new payloads.Version(this.version, 1037n, BigInt(Math.floor(+new Date() / 1000)), 0n,
        Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0x5f, 0xde, 0x31, 0xd4]), 8333,
        1037n, Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), 0, 123n, 16, '/Satoshi:0.16.2/', 0, true);
      const connectMessagePayloadSerialized = connectMessagePayload.serialize();
      const connectMessageHeader = new MessageHeader(this.network, CONSTANTS.COMMAND_NAME_VERSION, connectMessagePayloadSerialized.length, helper.checksum(connectMessagePayloadSerialized))
      const connectMessage = new Message(connectMessageHeader, connectMessagePayload);
      this.socket.write(connectMessage.serialize());
      console.log('socket connect');
    })
    
    this.socket.on('data', (data) => {
      try {
        const msg = Message.deserialize(data);
        console.log('msg', msg);
        this.handleMessage(msg);
      } catch (error) {
        console.log('error', error);
      }
    })
    
    this.socket.on('end', () => {
      console.log('socket end');
    })
    
    this.socket.on('error', (error) => {
      console.log('socket error', error);
    })
    
    this.socket.on('lookup', (err, address, family, host) => {
      console.log('socket lookup', err, address, family, host);
    })
  }

  handleMessage(msg) {
    if (!msg || !msg.header || !msg.payload) return;
    if (msg.header.commandName === 'version') {
      const verAckHeader = new MessageHeader(this.network, CONSTANTS.COMMAND_NAME_VERACK, 0, Buffer.from(CONSTANTS.EMPTY_STRING_CHECKSUM_HEX));
      const verAckPayload = new payloads.VerAck();
      const verAckMessage = new Message(verAckHeader, verAckPayload);
      console.log('verAck', verAckMessage, verAckMessage.serialize());
      this.socket.write(verAckMessage.serialize());
    } else if (msg.header.commandName === 'ping') {

    }
  }
}

let pd = new PeerDiscovery(CONSTANTS.MAINNET_START_STRING);
pd.connectToPeer({port: '8333', address: '51.68.36.57'})