import { authAPI } from './api.js';
import { callManager } from './webrtc.js';

const root = document.getElementById('root');
let currentUser = null;

// 1. Login Screen Render
function renderLogin() {
    root.innerHTML = `
        <div class="auth-container">
            <h2>Login</h2>
            <input type="email" id="email" placeholder="Email">
            <input type="password" id="pass" placeholder="Password">
            <button class="primary-btn" id="loginBtn">Login</button>
            <p class="link-text" id="goRegister">Create Account</p>
        </div>`;
    
    // Event Listeners যোগ করা হলো
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('goRegister').addEventListener('click', renderRegister);
}

// 2. Register Screen Render
function renderRegister() {
    root.innerHTML = `
        <div class="auth-container">
            <h2>Create Account</h2>
            <input type="text" id="name" placeholder="Full Name">
            <input type="email" id="email" placeholder="Email">
            <input type="password" id="pass" placeholder="Password">
            <button class="primary-btn" id="regBtn">Sign Up</button>
            <p class="link-text" id="goLogin">Back to Login</p>
        </div>`;
        
    // Event Listeners যোগ করা হলো
    document.getElementById('regBtn').addEventListener('click', handleRegister);
    document.getElementById('goLogin').addEventListener('click', renderLogin);
}

// 3. Dashboard Screen Render
function renderDashboard() {
    root.innerHTML = `
        <div class="dashboard">
            <div class="header">
                <h3>Contacts</h3>
                <button onclick="logout()" style="background:none;border:none;color:#aaa;">Logout</button>
            </div>
            <div class="contact-list" id="list">
                <!-- Demo Contact -->
                <div class="contact-item" onclick="startDemoCall()">
                    <div class="avatar"></div>
                    <div>
                        <b>Demo User</b><br>
                        <small style="color:#0f0;">Online</small>
                    </div>
                </div>
            </div>
            <button class="fab" onclick="startDemoCall()">📞</button>
        </div>`;
}

// --- Logic Functions ---

async function handleLogin() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    
    if(!email || !pass) return alert("Please fill all fields");
    
    try {
        const d = await authAPI.login(email, pass);
        localStorage.setItem('token', d.data.token);
        currentUser = d.data;
        callManager.init(d.data._id); // Socket join
        renderDashboard();
    } catch(e) { 
        alert(e.message); 
    }
}

async function handleRegister() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    
    if(!name || !email || !pass) return alert("Please fill all fields");

    try {
        const d = await authAPI.register(name, email, pass);
        localStorage.setItem('token', d.data.token);
        currentUser = d.data;
        callManager.init(d.data._id); // Socket join
        renderDashboard();
    } catch(e) { 
        alert(e.message); 
    }
}

function logout() {
    localStorage.removeItem('token');
    location.reload();
}

function startDemoCall() {
    if(confirm("Start demo call with 'Demo User'?")) {
        callManager.startCall('demo-user-id-123');
    }
}

// Initialize App
export function initApp() {
    if(localStorage.getItem('token')) {
        // যদি টোকেন থাকে তবে ড্যাশবোর্ড দেখাবে (Socket init পরে হবে)
        renderDashboard();
        // নোট: ইউজার আইডি না জানা পর্যন্ত socket init করা যাবে না, 
        // তাই লগিন করার পর init করা ভালো। আপাতত ড্যাশবোর্ড লোড হচ্ছে।
    } else {
        renderLogin();
    }
}
