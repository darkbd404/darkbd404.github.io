const API_URL = window.location.origin;
const socket = io(API_URL);
let currentUser = JSON.parse(localStorage.getItem('user'));
let peerConnection, localStream, callTimerInterval, seconds = 0;
let allUsers = [];
let currentTab = 'dial';
let dialedNumber = '';

const RTC_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// --- NAVIGATION ---
function renderBottomNav() {
    return `
    <div class="bottom-nav">
        <div class="nav-item ${currentTab==='dial'?'active':''}" onclick="switchTab('dial')">
            <span class="nav-icon"></span>Dial
        </div>
        <div class="nav-item ${currentTab==='contacts'?'active':''}" onclick="switchTab('contacts')">
            <span class="nav-icon"></span>Contacts
        </div>
        <div class="nav-item ${currentTab==='logs'?'active':''}" onclick="switchTab('logs')">
            <span class="nav-icon">📋</span>Logs
        </div>
        <div class="nav-item ${currentTab==='profile'?'active':''}" onclick="switchTab('profile')">
            <span class="nav-icon">👤</span>Profile
        </div>
    </div>`;
}

function switchTab(tab) {
    currentTab = tab;
    renderApp();
}

// --- SCREENS ---
function renderLogin() {
    document.getElementById('app').innerHTML = `
        <div class="auth-container">
            <h2 style="text-align:center;margin-bottom:30px;color:var(--primary)">IP Calling System</h2>
            <input type="text" id="username" placeholder="Username" autocomplete="off">
            <input type="password" id="password" placeholder="Password">
            <button onclick="handleLogin()">Login</button>
        </div>`;
}

function renderDialPad() {
    document.getElementById('app').innerHTML = `
        <div class="dial-display" id="dialDisplay">${dialedNumber || '<span style="color:#555">Enter IP Number</span>'}</div>
        <div class="dial-grid">
            ${[1,2,3,4,5,6,7,8,9,'*',0,'#'].map(n => 
                `<div class="dial-btn" onclick="pressKey('${n}')">${n}</div>`
            ).join('')}
            <div class="dial-btn del-btn" onclick="deleteKey()"></div>
            <div class="dial-btn call-btn" onclick="makeCall()"></div>
            <div class="dial-btn" style="visibility:hidden"></div>
        </div>
        ${renderBottomNav()}
    `;
}

function renderContacts() {
    const others = allUsers.filter(u => u.id !== currentUser.id);
    document.getElementById('app').innerHTML = `
        <div style="padding:20px;font-size:20px;font-weight:bold">Contacts</div>
        ${others.map(u => `
            <div class="list-item">
                <div class="item-info">
                    <h4>${u.profile.name}</h4>
                    <p>IP: ${u.ipNumber} | ${u.online ? '🟢 Online' : '⚪ Offline'}</p>
                </div>
                <button class="action-btn" onclick="callFromContact('${u.ipNumber}')">Call</button>
            </div>
        `).join('')}
        ${renderBottomNav()}
    `;
}

function renderLogs() {
    document.getElementById('app').innerHTML = `
        <div style="padding:20px;font-size:20px;font-weight:bold">Call Logs</div>
        ${(currentUser.callLogs || []).length === 0 
            ? '<div style="text-align:center;padding:40px;color:#555">No call history</div>'
            : currentUser.callLogs.slice().reverse().map(log => `
                <div class="list-item">
                    <div class="item-info">
                        <h4>${log.type === 'outgoing' ? '↗ Outgoing' : ' Incoming'} - ${log.targetName || log.targetIp}</h4>
                        <p>${new Date(log.time).toLocaleString()} | ${log.duration || 'Missed'}</p>
                    </div>
                </div>
            `).join('')
        }
        ${renderBottomNav()}
    `;
}

function renderProfile() {
    document.getElementById('app').innerHTML = `
        <div class="profile-header">
            <div class="avatar">${currentUser.profile.name.charAt(0)}</div>
            <h2>${currentUser.profile.name}</h2>
            <p style="color:#aaa;margin-top:5px">${currentUser.profile.userType}</p>
        </div>
        <div class="detail-row"><span>IP Number</span><span style="color:var(--primary)">${currentUser.ipNumber}</span></div>
        <div class="detail-row"><span>Email</span><span>${currentUser.profile.email}</span></div>
        <div class="detail-row"><span>Mobile</span><span>${currentUser.profile.mobile}</span></div>
        <div class="detail-row"><span>Joined</span><span>${new Date(currentUser.profile.createdAt).toLocaleDateString()}</span></div>
        <div style="padding:20px">
            <button onclick="logout()" style="background:var(--danger);color:#fff">Logout</button>
        </div>
        ${renderBottomNav()}
    `;
}

function renderApp() {
    if (!currentUser) return renderLogin();
    if (currentTab === 'dial') renderDialPad();
    else if (currentTab === 'contacts') renderContacts();
    else if (currentTab === 'logs') renderLogs();
    else if (currentTab === 'profile') renderProfile();
}

// --- AUTH ---
async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
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
        await fetchUsers();
        renderApp();
    } catch (e) { alert(e.message); }
}

function logout() {
    localStorage.removeItem('user');
    location.reload();
}

// --- DIAL PAD LOGIC ---
function pressKey(key) {
    if (dialedNumber.length < 15) {
        dialedNumber += key;
        renderDialPad();
    }
}

function deleteKey() {
    dialedNumber = dialedNumber.slice(0, -1);
    renderDialPad();
}

function callFromContact(ip) {
    dialedNumber = ip;
    switchTab('dial');
    setTimeout(makeCall, 300);
}

// --- SOCKET & WEBRTC ---
async function fetchUsers() {
    try {
        const res = await fetch(`${API_URL}/api/users`);
        allUsers = await res.json();
    } catch (e) { console.error(e); }
}

function initSocket() {
    socket.emit('join', { userId: currentUser.id, ipNumber: currentUser.ipNumber });
    
    socket.on('user-status', () => { if(currentTab === 'contacts') renderContacts(); });
    
    socket.on('incoming-call', async ({ offer, callerId, callerName, callerIp }) => {
        showCallOverlay(callerName || callerIp, true);
        await acceptCall(callerId, offer, callerName || callerIp);
    });

    socket.on('call-answered', ({ answer }) => {
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        startTimer();
        updateCallUI('Connected');
    });

    socket.on('ice-candidate', ({ candidate }) => {
        if (peerConnection) peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('call-ended', () => cleanupCall());
    socket.on('call-error', ({ message }) => { alert(message); cleanupCall(); });
}

async function makeCall() {
    if (!dialedNumber) return alert("Enter IP Number");
    const targetUser = allUsers.find(u => u.ipNumber === dialedNumber);
    const displayName = targetUser ? targetUser.profile.name : dialedNumber;
    
    showCallOverlay(displayName, false);
    
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peerConnection = new RTCPeerConnection(RTC_CONFIG);
    localStream.getTracks().forEach(t => peerConnection.addTrack(t, localStream));
    
    peerConnection.ontrack = (e) => {
        document.getElementById('remote-audio').srcObject = e.streams[0];
    };
    peerConnection.onicecandidate = (e) => {
        if (e.candidate) socket.emit('ice-candidate', { targetUserId: targetUser?.id, candidate: e.candidate });
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    socket.emit('call-ip', { 
        targetIp: dialedNumber, 
        offer, 
        callerId: currentUser.id, 
        callerName: currentUser.profile.name 
    });

    // Add to logs
    addLog('outgoing', displayName, dialedNumber);
}

async function acceptCall(callerId, offer, callerName) {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peerConnection = new RTCPeerConnection(RTC_CONFIG);
    localStream.getTracks().forEach(t => peerConnection.addTrack(t, localStream));
    
    peerConnection.ontrack = (e) => {
        document.getElementById('remote-audio').srcObject = e.streams[0];
    };
    peerConnection.onicecandidate = (e) => {
        if (e.candidate) socket.emit('ice-candidate', { targetUserId: callerId, candidate: e.candidate });
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer-call', { targetUserId: callerId, answer });
    
    startTimer();
    updateCallUI('Connected');
    addLog('incoming', callerName, '');
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
    const overlay = document.getElementById('callOverlay');
    if (overlay) overlay.remove();
    dialedNumber = '';
    if(currentTab === 'dial') renderDialPad();
}

function showCallOverlay(name, isIncoming) {
    const div = document.createElement('div');
    div.className = 'call-overlay';
    div.id = 'callOverlay';
    div.innerHTML = `
        <h2>${isIncoming ? 'Incoming Call' : 'Calling...'}</h2>
        <h1 style="margin:10px 0;color:var(--primary)">${name}</h1>
        <div class="timer" id="callTimer">00:00</div>
        <div class="controls">
            <button class="ctrl-btn" id="btnMute" onclick="toggleMute()">🎤</button>
            <button class="ctrl-btn end" onclick="endCall()">📞</button>
            <button class="ctrl-btn" id="btnSpk" onclick="toggleSpeaker()"></button>
        </div>
    `;
    document.body.appendChild(div);
    if(!isIncoming) startTimer();
}

function startTimer() {
    callTimerInterval = setInterval(() => {
        seconds++;
        const m = String(Math.floor(seconds/60)).padStart(2,'0');
        const s = String(seconds%60).padStart(2,'0');
        const el = document.getElementById('callTimer');
        if(el) el.innerText = `${m}:${s}`;
    }, 1000);
}

function updateCallUI(status) {
    const el = document.querySelector('.call-overlay h2');
    if(el) el.innerText = status;
}

function toggleMute() {
    if(localStream) {
        const t = localStream.getAudioTracks()[0];
        t.enabled = !t.enabled;
        document.getElementById('btnMute').style.opacity = t.enabled ? '1' : '0.3';
    }
}

function toggleSpeaker() {
    document.getElementById('btnSpk').classList.toggle('active');
}

function addLog(type, name, ip) {
    if(!currentUser.callLogs) currentUser.callLogs = [];
    currentUser.callLogs.push({ type, targetName: name, targetIp: ip, time: new Date().toISOString(), duration: '' });
    localStorage.setItem('user', JSON.stringify(currentUser));
}

// INIT
if (currentUser) {
    initSocket();
    fetchUsers().then(renderApp);
} else {
    renderLogin();
}
