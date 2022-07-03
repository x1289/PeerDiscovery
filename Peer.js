import net from 'net';

const STATE_DISCONNECTED = 'disconnected';
const STATE_CONNECTING = 'connecting';
const STATE_CONNECTED = 'connected';
const STATE_DISCONNECTING = 'disconnecting';

export class Peer {
  constructor(id, port, address) {
    this.id = id;
    this.port = port;
    this.address = address;
    this.connectionState = STATE_DISCONNECTED;
  }

  connect() {
    this.socket = net.createConnection(this.port, this.address);
    this.socket.on('close', (hadError) => {
      console.log('socket close', hadError);
    })
    
    this.socket.on('connect', () => {
      this.connectionState = STATE_CONNECTING;
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
}