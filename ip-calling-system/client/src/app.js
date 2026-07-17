import { authAPI } from './api.js';
import { callManager } from './webrtc.js';

// State Management
const state = {
    user: null,
    token: localStorage.getItem('token'),
    currentView: 'login'
};

// DOM Elements
const root = document.getElementById('root');

// --- UI Components ---

const renderLogin = () => {
    root.innerHTML = `
        <div class="auth-container">
            <h2>Welcome Back</h2>
            <form id="loginForm">
                <input type="email" id="loginEmail" placeholder="Email" required />
                <input type="password" id="loginPassword" placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="#" id="showRegister">Register</a></p>
        </div>
    `;
    
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        renderRegister();
    });
};

const renderRegister = () => {
    root.innerHTML = `
        <div class="auth-container">
            <h2>Create Account</h2>
            <form id="registerForm">
                <input type="text" id="regName" placeholder="Full Name" required />
                <input type="email" id="regEmail" placeholder="Email" required />
                <input type="password" id="regPassword" placeholder="Password" required />
                <button type="submit">Register</button>
            </form>
            <p>Already have an account? <a href="#" id="showLogin">Login</a></p>
        </div>
    `;

    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        renderLogin();
    });
};

const renderDashboard = () => {
    root.innerHTML = `
        <div class="dashboard">
            <header>
                <h3>Contacts</h3>
                <button id="logoutBtn">Logout</button>
            </header>
            <div id="contactList"></div>
            <button id="startCallBtn" class="fab">📞</button>
        </div>
    `;
    
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    loadContacts();
};

const renderCallScreen = (targetUserId, isOutgoing = true) => {
    root.innerHTML = `
        <div class="call-screen">
            <div class="caller-info">
                <div class="avatar"></div>
                <h3>Calling...</h3>
            </div>
            <div class="call-controls">
                <button id="muteBtn" class="icon-btn">🎤</button>
                <button id="endCallBtn" class="icon-btn danger">❌</button>
                <button id="speakerBtn" class="icon-btn">🔊</button>
            </div>
        </div>
    `;

    document.getElementById('endCallBtn').addEventListener('click', () => {
        callManager.endCall();
        renderDashboard();
    });

    // Start WebRTC Call
    if (isOutgoing) {
        callManager.startCall(targetUserId);
    }
};

// --- Logic Functions ---

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const data = await authAPI.login(email, password);
        state.token = data.data.token;
        state.user = data.data;
        localStorage.setItem('token', state.token);
        renderDashboard();
    } catch (err) {
        alert(err.message || 'Login failed');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const data = await authAPI.register(name, email, password);
        state.token = data.data.token;
        state.user = data.data;
        localStorage.setItem('token', state.token);
        renderDashboard();
    } catch (err) {
        alert(err.message || 'Registration failed');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    state.token = null;
    state.user = null;
    renderLogin();
}

async function loadContacts() {
    // Mock data for now, will replace with API call later
    const list = document.getElementById('contactList');
    list.innerHTML = `
        <div class="contact-item" onclick="renderCallScreen('user123')">
            <span>User One</span>
            <span class="status online"></span>
        </div>
    `;
}

export function initApp() {
    if (state.token) {
        renderDashboard();
    } else {
        renderLogin();
    }
}
