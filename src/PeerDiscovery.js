import net from 'net';
import { randomUUID } from 'crypto';
import { Message } from './p2p/message.js.js';
import { MessageHeader } from './p2p/messageHeader.js.js';
import * as CONSTANTS from './p2p/constants.js.js';
import * as payloads from './p2p/payloads/payloads.js.js';
import * as helper from './p2p/helper.js.js';
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
    this.startListeningToPeer(peer);
  }

  handleMessageFromPeer(id) {
    if (!id) return;
    const peer = this.peers[id];
    if (!peer || peer.dataBuffer.length < MessageHeader.HEADER_SIZE) return;

    while(peer.dataBuffer.length > 0) {
      const nextHeaderIndex = peer.dataBuffer.indexOf(Buffer.from(CONSTANTS.START_STRINGS[peer.network]));
      if (nextHeaderIndex === -1) break;
      const msg = peer.dataBuffer.subarray(nextHeaderIndex);
      const msgHeader = MessageHeader.deserialize(msg);
      if (msg.length < (MessageHeader.HEADER_SIZE + msgHeader.payloadSize)) break;
      const payloadBuffer = msg.subarray(MessageHeader.HEADER_SIZE, MessageHeader.HEADER_SIZE + msgHeader.payloadSize);

      const payloadChecksum = helper.checksum(payloadBuffer);

      if (Buffer.compare(payloadChecksum, msgHeader.checksum) !== 0) {
        peer.dataBuffer = msg.subarray(MessageHeader.HEADER_SIZE + msgHeader.payloadSize);
        continue;
      }

      const payload = Message.deserializePayload(msgHeader.commandName, payloadBuffer);
      const newMessage = new Message(msgHeader, payload);
      peer.dataBuffer = msg.subarray(MessageHeader.HEADER_SIZE + msgHeader.payloadSize);

      this.handleMessage(peer, newMessage);
    }
  }

  startListeningToPeer(peer) {
    peer.on('connect', (id) => {
      if (id === peer.id) {
        const versionMessage = this.getVersionMessage();
        const versionMessageSerialized = versionMessage.serialize()
        peer.send(versionMessageSerialized);
      }
    })
    peer.on('message', (id) => {
      try {
        if (id !== peer.id) return;
        this.handleMessageFromPeer(id);
      } catch (error) {
        console.log('error', error);
      }
    })
  }

  handleMessage(peer, msg) {
    console.log(`Handle message from peer '${peer.id}':`, msg)
    if (!peer || !msg || !msg.header || !msg.payload) return null;
    if (msg.header.commandName === 'version' && peer.isConnecting()) {
      peer.connectionState = 'connected'; // TODO: Refactor: better way to set peer as connected...
      const verAckMessage = this.getVerAckMessage();
      peer.send(verAckMessage.serialize());
    } else if (msg.header.commandName === 'ping') {
      const pongMessage = this.getPongMessage(msg.payload.nonce);
      peer.send(pongMessage.serialize());
    }
  }

  getPongMessage(nonce) {
    const pongMessageHeader = new MessageHeader(this.network, CONSTANTS.COMMAND_NAME_PONG, 8, Buffer.from(CONSTANTS.EMPTY_STRING_CHECKSUM_HEX));
    const pongMessagePayload = new payloads.Pong(nonce);
    return new Message(pongMessageHeader, pongMessagePayload);
  }

  getVersionMessage() {
    // currently hardcoded sample version message
    const connectMessagePayload = new payloads.Version(this.version, 1037n, BigInt(Math.floor(+new Date() / 1000)), 0n,
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
