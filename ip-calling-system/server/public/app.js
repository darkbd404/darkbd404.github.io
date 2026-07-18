const API_URL = window.location.origin;
const socket = io(API_URL);
let currentUser = JSON.parse(localStorage.getItem('user'));
let peerConnection, localStream, callTimerInterval, seconds = 0;
let allUsers = [];
let currentTab = 'dial';
let dialedNumber = '';

const RTC_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// --- NAVIGATION & RENDERING ---
function renderBottomNav() {
    const icons = { dial: '📞', contacts: '', logs: '📋', profile: '👤' };
    return `<div class="bottom-nav">
        ${Object.keys(icons).map(tab => `
            <div class="nav-item ${currentTab===tab?'active':''}" onclick="switchTab('${tab}')">
                <span class="nav-icon">${icons[tab]}</span>
                <span>${tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </div>
        `).join('')}
    </div>`;
}

function switchTab(tab) { currentTab = tab; renderApp(); }

function renderLogin() {
    document.getElementById('app').innerHTML = `
        <div style="display:flex;flex-direction:column;justify-content:center;height:100%;padding:30px;">
            <h2 style="text-align:center;margin-bottom:40px;font-size:28px;">IP Calling System 📱</h2>
            <input type="text" id="username" placeholder="Username" autocomplete="off">
            <input type="password" id="password" placeholder="Password">
            <button onclick="handleLogin()">Login Securely 🔐</button>
        </div>`;
}

function renderDialPad() {
    document.getElementById('app').innerHTML = `
        <div class="dial-input-container">
            <input type="text" class="dial-input" id="dialInput" value="${dialedNumber}" placeholder="Enter IP Number..." readonly onclick="this.select()">
        </div>
        <div class="dial-grid">
            ${[1,2,3,4,5,6,7,8,9,'*',0,'#'].map(n => `<div class="dial-btn" onclick="pressKey('${n}')">${n}</div>`).join('')}
            <div class="dial-btn del-btn" onclick="deleteKey()"></div>
            <div class="dial-btn call-btn-main" onclick="makeCall()">📞</div>
            <div class="dial-btn" style="visibility:hidden"></div>
        </div>
        ${renderBottomNav()}`;
}

function renderContacts() {
    const others = allUsers.filter(u => u.id !== currentUser.id);
    document.getElementById('app').innerHTML = `
        <div style="padding:25px;font-size:22px;font-weight:bold;">Contacts 👥</div>
        ${others.map(u => `
            <div class="list-item">
                <div class="item-left">
                    <img src="${u.profile.avatar}" class="avatar-small" onerror="this.src='https://via.placeholder.com/45'">
                    <div class="item-info">
                        <h4>${u.profile.name}</h4>
                        <p>IP: ${u.ipNumber} | ${u.online ? '🟢 Online' : '⚪ Offline'}</p>
                    </div>
                </div>
                <button class="action-btn" onclick="callFromContact('${u.ipNumber}')">Call 📞</button>
            </div>
        `).join('')}
        ${renderBottomNav()}`;
}

function renderLogs() {
    const logs = (currentUser.callLogs || []).slice().reverse();
    document.getElementById('app').innerHTML = `
        <div style="padding:25px;font-size:22px;font-weight:bold;">Call Logs 📋</div>
        ${logs.length === 0 ? '<div style="text-align:center;padding:50px;color:var(--text-muted)">No history yet ️</div>' : 
        logs.map(log => `
            <div class="list-item">
                <div class="item-left">
                    <div style="font-size:24px;">${log.type === 'outgoing' ? '↗️' : '↙️'}</div>
                    <div class="item-info">
                        <h4>${log.targetName || log.targetIp}</h4>
                        <p>${new Date(log.time).toLocaleString()} | ${log.duration || 'Missed '}</p>
                    </div>
                </div>
            </div>
        `).join('')}
        ${renderBottomNav()}`;
}

function renderProfile() {
    const p = currentUser.profile;
    document.getElementById('app').innerHTML = `
        <div class="profile-header">
            <img src="${p.avatar}" class="avatar-large" onerror="this.src='https://via.placeholder.com/110'">
            <h2>${p.name}</h2>
            <p class="bio-text">"${p.bio}" 💭</p>
        </div>
        <div class="detail-row"><span class="detail-label"> IP Number</span><span style="color:var(--primary);font-weight:bold;">${currentUser.ipNumber}</span></div>
        <div class="detail-row"><span class="detail-label"> Email</span><span>${p.email}</span></div>
        <div class="detail-row"><span class="detail-label">📱 Mobile</span><span>${p.mobile}</span></div>
        <div class="detail-row"><span class="detail-label">📍 Location</span><span>${p.location}</span></div>
        <div class="detail-row"><span class="detail-label">⚧ Gender</span><span>${p.gender}</span></div>
        <div class="detail-row"><span class="detail-label">📅 Joined</span><span>${p.joined}</span></div>
        <div style="padding:20px;">
            <button onclick="logout()" style="background:rgba(255,71,87,0.15);color:var(--danger);border:1px solid rgba(255,71,87,0.3);box-shadow:none;">Logout 🚪</button>
        </div>
        ${renderBottomNav()}`;
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

function logout() { localStorage.removeItem('user'); location.reload(); }

// --- DIAL PAD LOGIC ---
function pressKey(key) {
    if (dialedNumber.length < 15) {
        dialedNumber += key;
        updateDialDisplay();
    }
}
function deleteKey() {
    dialedNumber = dialedNumber.slice(0, -1);
    updateDialDisplay();
}
function updateDialDisplay() {
    const input = document.getElementById('dialInput');
    if(input) input.value = dialedNumber;
}
function callFromContact(ip) {
    dialedNumber = ip;
    switchTab('dial');
    setTimeout(makeCall, 400);
}

// --- SOCKET & WEBRTC (AUDIO FIX INCLUDED) ---
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
        const caller = allUsers.find(u => u.id === callerId) || { profile: { name: callerName || 'Unknown', avatar: '' } };
        showCallOverlay(caller, true);
        // Audio play will happen inside acceptCall after user interaction
        await acceptCall(callerId, offer, caller);
    });

    socket.on('call-answered', ({ answer }) => {
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        startTimer();
        updateCallUI('Connected ✅');
    });

    socket.on('ice-candidate', ({ candidate }) => {
        if (peerConnection) peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('call-ended', () => cleanupCall());
    socket.on('call-error', ({ message }) => { alert(message); cleanupCall(); });
}

async function makeCall() {
    if (!dialedNumber) return alert("Enter IP Number first! 🔢");
    const targetUser = allUsers.find(u => u.ipNumber === dialedNumber);
    if(!targetUser) return alert("Invalid IP Number ❌");
    
    showCallOverlay(targetUser, false);
    
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peerConnection = new RTCPeerConnection(RTC_CONFIG);
    localStream.getTracks().forEach(t => peerConnection.addTrack(t, localStream));
    
    peerConnection.ontrack = (e) => {
        const audio = document.getElementById('remote-audio');
        audio.srcObject = e.streams[0];
        // Play audio immediately when track is received
        audio.play().catch(e => console.log("Audio autoplay blocked", e));
    };
    peerConnection.onicecandidate = (e) => {
        if (e.candidate) socket.emit('ice-candidate', { targetUserId: targetUser.id, candidate: e.candidate });
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    socket.emit('call-ip', { targetIp: dialedNumber, offer, callerId: currentUser.id, callerName: currentUser.profile.name });
    addLog('outgoing', targetUser.profile.name, dialedNumber);
}

async function acceptCall(callerId, offer, callerData) {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peerConnection = new RTCPeerConnection(RTC_CONFIG);
    localStream.getTracks().forEach(t => peerConnection.addTrack(t, localStream));
    
    peerConnection.ontrack = (e) => {
        const audio = document.getElementById('remote-audio');
        audio.srcObject = e.streams[0];
        // CRITICAL FIX: Play audio here because this runs after user clicked "Answer"
        audio.play().then(() => console.log("Remote audio playing 🔊")).catch(e => console.log("Audio error", e));
    };
    peerConnection.onicecandidate = (e) => {
        if (e.candidate) socket.emit('ice-candidate', { targetUserId: callerId, candidate: e.candidate });
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer-call', { targetUserId: callerId, answer });
    
    startTimer();
    updateCallUI('Connected ✅');
    addLog('incoming', callerData.profile.name, '');
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

function showCallOverlay(user, isIncoming) {
    const div = document.createElement('div');
    div.className = 'call-overlay';
    div.id = 'callOverlay';
    div.innerHTML = `
        <div class="call-info">
            <img src="${user.profile?.avatar || 'https://via.placeholder.com/140'}" class="caller-avatar" onerror="this.src='https://via.placeholder.com/140'">
            <h2 style="margin-top:20px;">${isIncoming ? 'Incoming Call 📲' : 'Calling... 📞'}</h2>
            <p>${user.profile?.name || user.ipNumber}</p>
            <div class="timer" id="callTimer">00:00</div>
        </div>
        <div class="controls">
            <button class="ctrl-btn" id="btnMute" onclick="toggleMute()"></button>
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
    const el = document.querySelector('.call-info h2');
    if(el) el.innerText = status;
}

function toggleMute() {
    if(localStream) {
        const t = localStream.getAudioTracks()[0];
        t.enabled = !t.enabled;
        document.getElementById('btnMute').classList.toggle('active', !t.enabled);
    }
}

function toggleSpeaker() {
    document.getElementById('btnSpk').classList.toggle('active');
    // Note: Actual speaker switching requires setSinkId which is limited in browsers
}

function addLog(type, name, ip) {
    if(!currentUser.callLogs) currentUser.callLogs = [];
    currentUser.callLogs.push({ type, targetName: name, targetIp: ip, time: new Date().toISOString(), duration: seconds > 0 ? `${Math.floor(seconds/60)}m ${seconds%60}s` : 'Missed' });
    localStorage.setItem('user', JSON.stringify(currentUser));
}

// INIT
if (currentUser) {
    initSocket();
    fetchUsers().then(renderApp);
} else {
    renderLogin();
}
