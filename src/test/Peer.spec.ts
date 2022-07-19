import 'mocha';
import { expect } from 'chai';
import { Peer } from '../Peer';
import { Buffer } from 'buffer';

describe('Peer class', function () {
    it('should have an existing class', function () {
        expect(Peer).to.not.be.undefined;
    });
    describe('member functions', () => {
        it('should append buffer input to dataBuffer', () => {
            let peer = new Peer('someId', 'someNetwork', 8333, 'someAdress');
            const dataBufferBefore = peer.dataBuffer;
            const inputData = Buffer.from('hello');
            peer.appendData(inputData);
            const expectedBuffer = Buffer.concat([dataBufferBefore, inputData], dataBufferBefore.length + inputData.length);
            expect(Buffer.compare(peer.dataBuffer, expectedBuffer)).to.equal(0);
        });
        it('should have disconnected state on creation', () => {
            let peer = new Peer('someId', 'someNetwork', 8333, 'someAdress');
            expect(peer.isDisconnected()).to.be.true;
            expect(peer.isConnected()).to.be.false;
            expect(peer.isConnecting()).to.be.false;
        });
        it('should set the connectionState according to input', () => {
            let peer = new Peer('someId', 'someNetwork', 8333, 'someAdress');
            expect(peer.connectionState).to.equal(Peer.STATE_DISCONNECTED);
            peer.setConnectionState('something invalid');
            expect(peer.connectionState).to.equal(Peer.STATE_DISCONNECTED);
            peer.setConnectionState(Peer.STATE_CONNECTING);
            expect(peer.connectionState).to.equal(Peer.STATE_CONNECTING);
            peer.setConnectionState(Peer.STATE_CONNECTED);
            expect(peer.connectionState).to.equal(Peer.STATE_CONNECTED);
            peer.setConnectionState(Peer.STATE_DISCONNECTING);
            expect(peer.connectionState).to.equal(Peer.STATE_DISCONNECTING);
            peer.setConnectionState(Peer.STATE_DISCONNECTED);
            expect(peer.connectionState).to.equal(Peer.STATE_DISCONNECTED);
        });
    })
});
