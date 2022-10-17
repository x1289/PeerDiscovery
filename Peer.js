import net from 'net';
import EventEmitter from 'events';

export class Peer extends EventEmitter {
  static STATE_DISCONNECTED = 'disconnected';
  static STATE_CONNECTING = 'connecting';
  static STATE_CONNECTED = 'connected';
  static STATE_DISCONNECTING = 'disconnecting';

  constructor(id, network, port, address) {
    super();
    this.id = id;
    this.network = network;
    this.port = port;
    this.address = address;
    this.connectionState = Peer.STATE_DISCONNECTED;
    this.dataBuffer = Buffer.alloc(0);
  }

  appendData(incoming) {
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

  send(msg) {
    if (this.socket !== undefined) {
      this.socket.write(msg);
    }
  }

  isDisconnected() {
    return this.connectionState === Peer.STATE_DISCONNECTED
  }

  isConnected() {
    return this.connectionState === Peer.STATE_CONNECTED;
  }

  isConnecting() {
    return this.connectionState === Peer.STATE_CONNECTING;
  }

  setConnectionState(newState) {
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

  // #region Data Messages
  getHeaders() {
    return;
  }

  getBlocks() {
    return;
  }

  memPool() {
    return;
  }
  // #endregion Data Messages
  // #region Control Messages
  addr() {
    return;
  }

  addrV2() {
    return;
  }

  alert() {
    return;
  }

  feeFilter() {
    return;
  }

  filterAdd() {
    return;
  }

  filterClear() {
    return;
  }

  filterLoad() {
    return;
  }

  getAddr() {
    return;
  }

  ping() {
    return;
  }

  pong() {
    return;
  }

  reject() {
    return;
  }

  sendHeaders() {
    return;
  }

  sendAddrV2() {
    return;
  }

  verAck() {
    return;
  }

  version() {
    return;
  }
  // #endregion Control Messages
  
}