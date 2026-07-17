import { authAPI } from './api.js';
import { callManager } from './webrtc.js';

const root = document.getElementById('root');
let currentUser = null;

function renderLogin() {
    root.innerHTML = `
        <div class="auth-container">
            <h2>Login</h2>
            <input type="email" id="email" placeholder="Email">
            <input type="password" id="pass" placeholder="Password">
            <button class="primary-btn" onclick="handleLogin()">Login</button>
            <p class="link-text" onclick="renderRegister()">Create Account</p>
        </div>`;
}

function renderRegister() {
    root.innerHTML = `
        <div class="auth-container">
            <h2>Register</h2>
            <input type="text" id="name" placeholder="Full Name">
            <input type="email" id="email" placeholder="Email">
            <input type="password" id="pass" placeholder="Password">
            <button class="primary-btn" onclick="handleRegister()">Sign Up</button>
            <p class="link-text" onclick="renderLogin()">Back to Login</p>
        </div>`;
}

function renderDashboard() {
    root.innerHTML = `
        <div class="dashboard">
            <div class="header"><h3>Contacts</h3><button onclick="logout()" style="background:none;border:none;color:#aaa;">Logout</button></div>
            <div class="contact-list" id="list"></div>
            <button class="fab" onclick="startDemoCall()">📞</button>
        </div>`;
    document.getElementById('list').innerHTML = `<div class="contact-item"><div class="avatar"></div><div><b>Demo User</b><br><small>Online</small></div></div>`;
}

window.handleLogin = async () => {
    try {
        const d = await authAPI.login(document.getElementById('email').value, document.getElementById('pass').value);
        localStorage.setItem('token', d.data.token);
        currentUser = d.data;
        callManager.init(d.data._id);
        renderDashboard();
    } catch(e) { alert(e.message); }
};

window.handleRegister = async () => {
    try {
        const d = await authAPI.register(document.getElementById('name').value, document.getElementById('email').value, document.getElementById('pass').value);
        localStorage.setItem('token', d.data.token);
        currentUser = d.data;
        callManager.init(d.data._id);
        renderDashboard();
    } catch(e) { alert(e.message); }
};

window.logout = () => { localStorage.removeItem('token'); location.reload(); };
window.startDemoCall = () => { if(confirm("Start demo call?")) callManager.startCall('demo-user-id'); };

export function initApp() {
    if(localStorage.getItem('token')) renderDashboard(); else renderLogin();
}
