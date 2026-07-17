const API_URL = window.location.origin; // Works on both Render & GitHub Pages
const socket = io(API_URL);
let currentUser = JSON.parse(localStorage.getItem('user'));
let peerConnection, localStream, callTimer, seconds = 0;

const RTC_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// --- UI RENDERERS ---
function renderAuth() {
    document.getElementById('app').innerHTML = `
        <h2 style="margin-bottom:20px;text-align:center">IP Calling System</h2>
        <input type="text" id="username" placeholder="Username">
        <input type="password" id="password" placeholder="Password">
        <button onclick="handleLogin()">Login</button>
        <button onclick="handleRegister()" style="background:transparent;border:1px solid var(--primary);color:var(--primary)">Create Account</button>
    `;
}

function renderDashboard() {
    document.getElementById('app').innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h3>Hello, ${currentUser.profile.displayName}</h3>
            <button onclick="logout()" style="width:auto;padding:8px 15px;font-size:12px;background:var(--danger);color:#fff">Logout</button>
        </div>
        <input type="text" id="search" placeholder="Search users..." oninput="searchUsers(this.value)">
        <div id="user-list"></div>
    `;
    loadFriends();
}

function renderCallScreen(callerName, isIncoming) {
    document.getElementById('app').innerHTML += `
        <div class="call-screen" id="active-call">
            <h2>${isIncoming ? 'Incoming Call' : 'Calling...'}</h2>
            <p>${callerName}</p>
            <div class="timer" id="call-timer">00:00</div>
            <div class="controls">
                <div class="icon-btn" onclick="toggleMute()"></div>
                <div class="icon-btn danger" onclick="endCall()">📞</div>
                <div class="icon-btn" onclick="toggleSpeaker()">🔊</div>
            </div>
        </div>
    `;
    if (!isIncoming) startCallTimer();
}

// --- AUTH LOGIC ---
async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error((await res.json()).message);
        currentUser = await res.json();
        localStorage.setItem('user', JSON.stringify(currentUser));
        initSocket();
        renderDashboard();
    } catch (e) { alert(e.message); }
}

async function handleRegister() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error((await res.json()).message);
        alert('Account created! Please login.');
        renderAuth();
    } catch (e) { alert(e.message); }
}

function logout() {
    localStorage.removeItem('user');
    location.reload();
}

// --- SOCKET & WEBRTC ---
function initSocket() {
    socket.emit('join', { userId: currentUser.id });
    
    socket.on('incoming-call', async ({ offer, callerId }) => {
        // Find caller name from local storage or fetch
        renderCallScreen('Unknown User', true);
        await acceptCall(callerId, offer);
    });

    socket.on('call-answered', ({ answer }) => {
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        startCallTimer();
    });

    socket.on('ice-candidate', ({ candidate }) => {
        if (peerConnection) peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('call-ended', () => cleanupCall());
}

async function startCall(targetUserId, targetSocketId) {
    renderCallScreen('User', false);
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    peerConnection = new RTCPeerConnection(RTC_CONFIG);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    
    peerConnection.ontrack = (e) => document.getElementById('remote-audio').srcObject = e.streams[0];
    peerConnection.onicecandidate = (e) => {
        if (e.candidate) socket.emit('ice-candidate', { targetSocketId, candidate: e.candidate });
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('call-user', { targetSocketId, offer, callerId: currentUser.id });
}

async function acceptCall(callerId, offer) {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peerConnection = new RTCPeerConnection(RTC_CONFIG);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    
    peerConnection.ontrack = (e) => document.getElementById('remote-audio').srcObject = e.streams[0];
    peerConnection.onicecandidate = (e) => {
        if (e.candidate) socket.emit('ice-candidate', { targetSocketId: callerId, candidate: e.candidate });
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer-call', { targetSocketId: callerId, answer });
    startCallTimer();
}

function endCall() {
    socket.emit('end-call', {});
    cleanupCall();
}

function cleanupCall() {
    if (peerConnection) peerConnection.close();
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    clearInterval(callTimer);
    seconds = 0;
    document.getElementById('active-call')?.remove();
}

function startCallTimer() {
    const timerEl = document.getElementById('call-timer');
    callTimer = setInterval(() => {
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        if (timerEl) timerEl.innerText = `${m}:${s}`;
    }, 1000);
}

function toggleMute() {
    if (localStream) localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
}

function toggleSpeaker() {
    const audio = document.getElementById('remote-audio');
    audio.setSinkId && audio.setSinkId('speaker').catch(() => {}); // Basic speaker toggle
}

// --- USER LIST & SEARCH ---
// Note: In a real JSON-only app, search requires fetching all users. 
// For performance, we simulate a friend list or fetch all.
async function searchUsers(query) {
    if (!query) return loadFriends();
    // Since we only have user.json, we must fetch all to search. 
    // In production, add a /api/users/search endpoint.
    // For now, this is a placeholder for the UI requirement.
    document.getElementById('user-list').innerHTML = `<p style="text-align:center;color:#aaa">Search requires backend indexing...</p>`;
}

async function loadFriends() {
    // Mocking friend list for UI demonstration since no DB query endpoint exists yet
    // You should add a GET /api/users route in authRoutes.js to return all users
    document.getElementById('user-list').innerHTML = `
        <div class="user-item">
            <span>Demo User (Online)</span>
            <button onclick="startCall('demo-id', 'demo-socket')" style="width:auto;padding:8px 15px">📞 Call</button>
        </div>
    `;
}

// INIT
if (currentUser) {
    initSocket();
    renderDashboard();
} else {
    renderAuth();
}
