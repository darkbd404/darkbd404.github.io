import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Change to your Render URL
let socket;
let peerConnection;
let localStream;

const config = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN servers here for production
    ]
};

export const callManager = {
    init(userId) {
        socket = io(SOCKET_URL);
        
        socket.emit('join', userId);

        socket.on('incoming-call', ({ callerId, offer }) => {
            if (confirm(`Incoming call from ${callerId}. Accept?`)) {
                this.acceptCall(callerId, offer);
            }
        });

        socket.on('ice-candidate', ({ candidate }) => {
            if (peerConnection) {
                peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });
    },

    async startCall(targetUserId) {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        peerConnection = new RTCPeerConnection(config);

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { targetUserId, candidate: event.candidate });
            }
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        socket.emit('call-offer', { targetUserId, offer });
    },

    async acceptCall(callerId, offer) {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        peerConnection = new RTCPeerConnection(config);

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { targetUserId: callerId, candidate: event.candidate });
            }
        };

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('call-answer', { targetUserId: callerId, answer });
    },

    endCall() {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        socket.emit('end-call', { targetUserId: 'currentCaller' }); // Simplified
    }
};
