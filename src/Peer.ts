import net from 'net';
import EventEmitter from 'events';

export class Peer extends EventEmitter {
  id: string;
  network: string;
  port: number;
  address: string;
  connectionState: string;
  dataBuffer: Buffer;
  socket?: net.Socket;

  static STATE_DISCONNECTED = 'disconnected';
  static STATE_CONNECTING = 'connecting';
  static STATE_CONNECTED = 'connected';
  static STATE_DISCONNECTING = 'disconnecting';

  constructor(id: string, network: string, port: number, address: string) {
    super();
    this.id = id;
    this.network = network;
    this.port = port;
    this.address = address;
    this.connectionState = Peer.STATE_DISCONNECTED;
    this.dataBuffer = Buffer.alloc(0);
  }

  appendData(incoming: Buffer) {
    if (!Buffer.isBuffer(incoming)) return;
    this.dataBuffer = Buffer.concat([this.dataBuffer, incoming], this.dataBuffer.length + incoming.length);
  }

  connect() {
    this.socket = net.createConnection(this.port, this.address);
    this.socket.on('close', (hadError) => {
      console.log('socket close', hadError);
    })
    
    this.socket.on('connect', () => {
      this.emit('connect', this.id);
      this.setConnectionState(Peer.STATE_CONNECTING);
      console.log('socket connect');
    })
    
    this.socket.on('data', (data) => {
      this.appendData(data);
      this.emit('message', this.id)
    })
    
    this.socket.on('end', () => {
      console.log('socket end');
      this.setConnectionState(Peer.STATE_DISCONNECTED);
    })
    
    this.socket.on('error', (error) => {
      console.log('socket error', error);
    })
    
    this.socket.on('lookup', (err, address, family, host) => {
      console.log('socket lookup', err, address, family, host);
    })
  }

  send(msg: Buffer) {
    if (this.socket !== undefined) {
      this.socket.write(msg);
    }
  }

  isDisconnected() {
    return this.connectionState === Peer.STATE_DISCONNECTED;
  }

  isConnected() {
    return this.connectionState === Peer.STATE_CONNECTED;
  }

  isConnecting() {
    return this.connectionState === Peer.STATE_CONNECTING;
  }

  setConnectionState(newState: string) {
    if (newState === Peer.STATE_DISCONNECTED) {
      this.connectionState = Peer.STATE_DISCONNECTED;
    } else if (newState === Peer.STATE_CONNECTING) {
      this.connectionState = Peer.STATE_CONNECTING;
    } else if (newState === Peer.STATE_CONNECTED) {
      this.connectionState = Peer.STATE_CONNECTED;
    } else if (newState === Peer.STATE_DISCONNECTING) {
      this.connectionState = Peer.STATE_DISCONNECTING;
    }
  }
}