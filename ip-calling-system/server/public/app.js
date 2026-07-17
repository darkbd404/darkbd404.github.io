// DOM Elements
const root = document.getElementById('root');

// 1. Login Screen
function showLogin() {
    root.innerHTML = `
        <div class="container">
            <h2>Login</h2>
            <input type="email" id="loginEmail" placeholder="Email">
            <input type="password" id="loginPass" placeholder="Password">
            <button id="btnLogin">Login</button>
            <p class="link" id="goRegister">Create Account</p>
        </div>`;
    
    document.getElementById('btnLogin').addEventListener('click', handleLogin);
    document.getElementById('goRegister').addEventListener('click', showRegister);
}

// 2. Register Screen
function showRegister() {
    root.innerHTML = `
        <div class="container">
            <h2>Create Account</h2>
            <input type="text" id="regName" placeholder="Full Name">
            <input type="email" id="regEmail" placeholder="Email">
            <input type="password" id="regPass" placeholder="Password">
            <button id="btnRegister">Sign Up</button>
            <p class="link" id="goLogin">Back to Login</p>
        </div>`;
        
    document.getElementById('btnRegister').addEventListener('click', handleRegister);
    document.getElementById('goLogin').addEventListener('click', showLogin);
}

// 3. Dashboard
function showDashboard(name) {
    root.innerHTML = `
        <div class="container">
            <h2>Welcome, ${name}</h2>
            <p style="color:#0f0; margin: 10px 0;">● Online</p>
            <button onclick="location.reload()" style="background:#cf6679;">Logout</button>
        </div>`;
}

// --- API Functions (Safe Version) ---

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    
    if(!email || !pass) return alert("Please fill all fields");
    
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
        });
        
        // ⚠️ Safe JSON Parse
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch(e) { throw new Error("Server error: Invalid response"); }
        
        if (!res.ok) throw new Error(data.message || "Login failed");
        
        localStorage.setItem('token', data.data.token);
        showDashboard(data.data.name);
    } catch (e) { 
        alert(e.message); 
    }
}

async function handleRegister() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    
    if(!name || !email || !pass) return alert("Please fill all fields");

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password: pass })
        });
        
        // ⚠️ Safe JSON Parse
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch(e) { throw new Error("Server error: Invalid response. Is server awake?"); }
        
        if (!res.ok) throw new Error(data.message || "Registration failed");
        
        localStorage.setItem('token', data.data.token);
        showDashboard(data.data.name);
    } catch (e) { 
        alert(e.message); 
    }
}

// Initialize App
if (localStorage.getItem('token')) {
    showDashboard("User"); 
} else {
    showLogin();
}
