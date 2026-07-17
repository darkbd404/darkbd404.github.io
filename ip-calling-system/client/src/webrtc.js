import io from 'socket.io-client';

// Render-এ ডিপ্লয় করার সময় এই URL পরিবর্তন করতে হবে
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket;
let peerConnection;
let localStream;

const config = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Production-এ TURN সার্ভার যোগ করুন
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
        try {
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
        } catch (err) {
            console.error("Error starting call:", err);
            alert("Microphone access denied or error occurred.");
        }
    },

    async acceptCall(callerId, offer) {
        try {
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
        } catch (err) {
            console.error("Error accepting call:", err);
        }
    },

    endCall() {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        // Note: In a real app, pass the specific targetUserId
        socket.emit('end-call', { targetUserId: 'currentCaller' }); 
    }
};
