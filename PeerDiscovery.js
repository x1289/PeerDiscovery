import net from 'net';
import { randomUUID } from 'crypto';
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

  createPeer(network, port = 8333, address) {
    if (!net.isIP(address)) return null;
    const peer = new Peer(randomUUID(), network, port, address)
    this.peers[peer.id] = peer;
    return peer.id;
  }

  connectToPeer(peerId) {
    const peer = this.peers[peerId]
    if (!peer) return null;
    peer.connect();
    if (!peer) return false;
    this.startListeningToPeer(peer);
  }

  startListeningToPeer(peer) {
    peer.on('connect', (id) => {
      if (id === peer.id) {
        const connectMessage = this.getVersionMessage();
        peer.send(connectMessage.serialize());
      }
    })
    peer.on('message', ({id, data}) => {
      try {
        if (id !== peer.id) return;
        let subData = data;
        while (subData.length > 0) {
          const msg = Message.deserialize(subData);
          if (!msg || !msg.header) return;
          
          console.log(`Message from Peer ${id} msg:`, msg, msg.size(), subData.length, subData.length - msg.size());
          this.handleMessage(peer, msg);
          subData = subData.subarray(msg.size());
        }
        console.log('exit while');
      } catch (error) {
        console.log('error', error);
      }
    })
  }

  handleMessage(peer, msg) {
    if (!peer || !msg || !msg.header || !msg.payload) return null;
    console.log('handle Message', msg.header.commandName);
    if (msg.header.commandName === 'version' && peer.isConnecting()) {
      peer.connectionState = 'connected'; // TODO: Refactor...
      const verAckMessage = this.getVerAckMessage();
      peer.send(verAckMessage.serialize());
    } else if (msg.header.commandName === 'ping') {
      const pongMessage = this.getPongMessage(msg.payload.nonce);
      peer.send(pongMessage.serialize());
    }
  }

  getPongMessage(nonce) {
    const pongMessageHeader = new MessageHeader(this.network, CONSTANTS.COMMAND_NAME_PONG, 0, Buffer.from(CONSTANTS.EMPTY_STRING_CHECKSUM_HEX));
    const pongMessagePayload = new payloads.Pong(nonce);
    return new Message(pongMessageHeader, pongMessagePayload);
  }

  getVersionMessage() {
    const connectMessagePayload = new payloads.Version(null, this.version, 1037n, BigInt(Math.floor(+new Date() / 1000)), 0n,
    Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0x5f, 0xde, 0x31, 0xd4]), 8333,
    1037n, Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), 0, 123n, 16, '/Satoshi:0.16.2/', 0, true);
    const connectMessagePayloadSerialized = connectMessagePayload.serialize();
    const connectMessageHeader = new MessageHeader(this.network, CONSTANTS.COMMAND_NAME_VERSION, connectMessagePayloadSerialized.length, helper.checksum(connectMessagePayloadSerialized))
    return new Message(connectMessageHeader, connectMessagePayload);
  }

  getVerAckMessage() {
    const verAckHeader = new MessageHeader(this.network, CONSTANTS.COMMAND_NAME_VERACK, 0, Buffer.from(CONSTANTS.EMPTY_STRING_CHECKSUM_HEX));
    const verAckPayload = new payloads.VerAck();
    return new Message(verAckHeader, verAckPayload);
  }
}

let pd = new PeerDiscovery(CONSTANTS.MAINNET_START_STRING);
const peerId = pd.createPeer(CONSTANTS.MAINNET_START_STRING, 8333, '51.68.36.57');

pd.connectToPeer(peerId)