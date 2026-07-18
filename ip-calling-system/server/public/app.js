const API_URL = window.location.origin;
const socket = io(API_URL);
let currentUser = JSON.parse(localStorage.getItem('user'));
let peerConnection, localStream, callTimerInterval, seconds = 0;
let allUsers = []; 

const RTC_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

function renderAuth() {
    document.getElementById('app').innerHTML = `
        <div class="auth-container">
            <h2>IP Calling System</h2>
            <input type="text" id="username" placeholder="Username" autocomplete="off">
            <input type="password" id="password" placeholder="Password">
            <button onclick="handleLogin()">Login to System</button>
        </div>`;
}

function renderDashboard() {
    document.getElementById('app').innerHTML = `
        <div class="header">
            <h3>Hello, ${currentUser.profile.displayName}</h3>
            <button class="btn-logout" onclick="logout()">Logout</button>
        </div>
        <div style="margin-bottom:15px; color:#aaa; font-size:14px;">Available Users:</div>
        <div class="user-list" id="userList">Loading users...</div>
    `;
    fetchUsers();
}

function renderCallScreen(callerName, isIncoming) {
    const overlay = document.createElement('div');
    overlay.className = 'call-overlay';
    overlay.id = 'activeCallOverlay';
    overlay.innerHTML = `
        <div class="caller-name">${callerName}</div>
        <div class="call-status">${isIncoming ? 'Incoming Call...' : 'Calling...'}</div>
        <div class="timer" id="callTimer">00:00</div>
        <div class="controls">
            <button class="ctrl-btn" id="btnMute" onclick="toggleMute()"></button>
            <button class="ctrl-btn end" onclick="endCall()">📞</button>
            <button class="ctrl-btn" id="btnSpeaker" onclick="toggleSpeaker()">🔊</button>
        </div>
    `;
    document.body.appendChild(overlay);
    if (!isIncoming) startCallTimer();
}

async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    if(!username || !password) return alert("Please enter username and password");

    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        currentUser = data;
        localStorage.setItem('user', JSON.stringify(currentUser));
        initSocket();
        renderDashboard();
    } catch (e) { alert(e.message); }
}

function logout() { localStorage.removeItem('user'); location.reload(); }

function initSocket() {
    socket.emit('join', { userId: currentUser.id });
    socket.on('user-status', ({ userId, online }) => {
        const dot = document.getElementById(`status-${userId}`);
        if(dot) dot.className = `status-dot ${online ? 'online' : ''}`;
    });
    socket.on('incoming-call', async ({ offer, callerId }) => {
        const caller = allUsers.find(u => u.id === callerId) || { profile: { displayName: 'Unknown' } };
        renderCallScreen(caller.profile.displayName, true);
        await acceptCall(callerId, offer);
    });
    socket.on('call-answered', ({ answer }) => {
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        startCallTimer();
        updateCallStatus('Connected');
    });
    socket.on('ice-candidate', ({ candidate }) => {
        if (peerConnection) peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });
    socket.on('call-ended', () => cleanupCall());
}

async function fetchUsers() {
    try {
        const res = await fetch(`${API_URL}/api/users`);
        allUsers = await res.json();
        renderUserList();
    } catch (e) { console.error("Failed to fetch users", e); }
}

function renderUserList() {
    const list = document.getElementById('userList');
    if(!list) return;
    // Filter out current user from the list
    const otherUsers = allUsers.filter(u => u.id !== currentUser.id);
    
    list.innerHTML = otherUsers.map(u => `
        <div class="user-card">
            <div style="display:flex;align-items:center;">
                <span id="status-${u.id}" class="status-dot ${u.online ? 'online' : ''}"></span>
                <span>${u.profile.displayName}</span>
            </div>
            <button class="btn-call" onclick="initiateCall('${u.id}')">Call</button>
        </div>
    `).join('');
}

async function initiateCall(targetUserId) {
    const targetUser = allUsers.find(u => u.id === targetUserId);
    if(!targetUser) return alert("User not found");
    renderCallScreen(targetUser.profile.displayName, false);
    
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peerConnection = new RTCPeerConnection(RTC_CONFIG);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    
    peerConnection.ontrack = (e) => {
        const audio = document.getElementById('remote-audio');
        audio.srcObject = e.streams[0];
        audio.play().catch(e => console.log("Audio play failed", e));
    };
    peerConnection.onicecandidate = (e) => {
        if (e.candidate) socket.emit('ice-candidate', { targetUserId, candidate: e.candidate });
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('call-user', { targetUserId, offer, callerId: currentUser.id });
}

async function acceptCall(callerId, offer) {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peerConnection = new RTCPeerConnection(RTC_CONFIG);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    
    peerConnection.ontrack = (e) => {
        const audio = document.getElementById('remote-audio');
        audio.srcObject = e.streams[0];
        audio.play().catch(e => console.log("Audio play failed", e));
    };
    peerConnection.onicecandidate = (e) => {
        if (e.candidate) socket.emit('ice-candidate', { targetUserId: callerId, candidate: e.candidate });
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer-call', { targetUserId: callerId, answer });
    startCallTimer();
    updateCallStatus('Connected');
}

function endCall() {
    socket.emit('end-call', {});
    cleanupCall();
}

function cleanupCall() {
    if (peerConnection) peerConnection.close();
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    clearInterval(callTimerInterval);
    seconds = 0;
    const overlay = document.getElementById('activeCallOverlay');
    if (overlay) overlay.remove();
}

function startCallTimer() {
    const timerEl = document.getElementById('callTimer');
    callTimerInterval = setInterval(() => {
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        if (timerEl) timerEl.innerText = `${m}:${s}`;
    }, 1000);
}

function updateCallStatus(text) {
    const status = document.querySelector('.call-status');
    if(status) status.innerText = text;
}

function toggleMute() {
    if (localStream) {
        const track = localStream.getAudioTracks()[0];
        track.enabled = !track.enabled;
        document.getElementById('btnMute').classList.toggle('active', !track.enabled);
    }
}

function toggleSpeaker() {
    document.getElementById('btnSpeaker').classList.toggle('active');
}

if (currentUser) {
    initSocket();
    renderDashboard();
} else {
    renderAuth();
}
