import io from 'socket.io-client';

// ⚠️ আপনার Render ব্যাকএন্ড URL টি এখানে বসান (without /api)
const SOCKET_URL = 'https://salam-ip-calling-system.onrender.com'; 

let socket, peerConnection, localStream;
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export const callManager = {
    init(userId) {
        socket = io(SOCKET_URL);
        socket.emit('join', userId);
        
        socket.on('incoming-call', ({ callerId, offer }) => {
            if (confirm(`Incoming call from ${callerId}. Accept?`)) this.acceptCall(callerId, offer);
        });
        socket.on('ice-candidate', ({ candidate }) => {
            if (peerConnection) peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        });
    },
    async startCall(targetUserId) {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        peerConnection = new RTCPeerConnection(config);
        localStream.getTracks().forEach(t => peerConnection.addTrack(t, localStream));
        
        peerConnection.onicecandidate = e => { if(e.candidate) socket.emit('ice-candidate', { targetUserId, candidate: e.candidate }); };
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('call-offer', { targetUserId, offer });
    },
    async acceptCall(callerId, offer) {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        peerConnection = new RTCPeerConnection(config);
        localStream.getTracks().forEach(t => peerConnection.addTrack(t, localStream));
        
        peerConnection.onicecandidate = e => { if(e.candidate) socket.emit('ice-candidate', { targetUserId: callerId, candidate: e.candidate }); };
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('call-answer', { targetUserId: callerId, answer });
    },
    endCall() {
        if(peerConnection) peerConnection.close();
        if(localStream) localStream.getTracks().forEach(t => t.stop());
        socket.emit('end-call', {});
    }
};
