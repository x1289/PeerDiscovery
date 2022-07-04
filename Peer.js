import net from 'net';
import EventEmitter from 'events';

const STATE_DISCONNECTED = 'disconnected';
const STATE_CONNECTING = 'connecting';
const STATE_CONNECTED = 'connected';
const STATE_DISCONNECTING = 'disconnecting';

export class Peer extends EventEmitter {
  constructor(id, network, port, address) {
    super();
    this.id = id;
    this.network = network;
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
      this.emit('connect', this.id);
      this.connectionState = STATE_CONNECTING;
      console.log('socket connect');
    })
    
    this.socket.on('data', (data) => {
      this.emit('message', {id: this.id, data})
    })
    
    this.socket.on('end', () => {
      console.log('socket end');
      this.connectionState = STATE_DISCONNECTED;
    })
    
    this.socket.on('error', (error) => {
      console.log('socket error', error);
    })
    
    this.socket.on('lookup', (err, address, family, host) => {
      console.log('socket lookup', err, address, family, host);
    })
  }

  send(msg) {
    if (this.socket !== undefined) {
      this.socket.write(msg);
    }
  }

  isDisconnected() {
    return this.connectionState === STATE_DISCONNECTED
  }

  isConnected() {
    return this.connectionState === STATE_CONNECTED;
  }

  isConnecting() {
    return this.connectionState === STATE_CONNECTING;
  }

}