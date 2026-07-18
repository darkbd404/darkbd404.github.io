const API_URL = window.location.origin;
const socket = io(API_URL);
let currentUser = JSON.parse(localStorage.getItem('user'));

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
        <p style="text-align:center;color:#aaa">System Ready. Waiting for calls...</p>
    `;
}

async function handleLogin() {
    const username = document.getElementById('username').value;
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
        socket.emit('join', { userId: currentUser.id });
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
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        alert('Account created! Please login now.');
        renderAuth();
    } catch (e) { alert(e.message); }
}

function logout() {
    localStorage.removeItem('user');
    location.reload();
}

if (currentUser) {
    socket.emit('join', { userId: currentUser.id });
    renderDashboard();
} else {
    renderAuth();
}
