const root = document.getElementById('root');
let currentUser = null;

// 1. Show Login Form
function showLogin() {
    root.innerHTML = `
        <div class="container">
            <h2>Login</h2>
            <input type="email" id="email" placeholder="Email">
            <input type="password" id="pass" placeholder="Password">
            <button onclick="handleLogin()">Login</button>
            <p style="margin-top:15px;cursor:pointer;color:#aaa;" onclick="showRegister()">Create Account</p>
        </div>`;
}

// 2. Show Register Form
function showRegister() {
    root.innerHTML = `
        <div class="container">
            <h2>Create Account</h2>
            <input type="text" id="name" placeholder="Full Name">
            <input type="email" id="email" placeholder="Email">
            <input type="password" id="pass" placeholder="Password">
            <button onclick="handleRegister()">Sign Up</button>
            <p style="margin-top:15px;cursor:pointer;color:#aaa;" onclick="showLogin()">Back to Login</p>
        </div>`;
}

// 3. Show Dashboard
function showDashboard() {
    root.innerHTML = `
        <div class="container">
            <h2>Welcome, ${currentUser.name}</h2>
            <p>Status: Online</p>
            <button onclick="logout()" style="background:#cf6679;">Logout</button>
        </div>`;
}

// --- Logic Functions ---

async function handleLogin() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        
        currentUser = data.data;
        localStorage.setItem('token', data.data.token);
        showDashboard();
    } catch (e) { alert(e.message); }
}

async function handleRegister() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password: pass })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        
        currentUser = data.data;
        localStorage.setItem('token', data.data.token);
        showDashboard();
    } catch (e) { alert(e.message); }
}

function logout() {
    localStorage.removeItem('token');
    location.reload();
}

// Initialize
if (localStorage.getItem('token')) {
    // In a real app, verify token here. For now, just show dashboard.
    currentUser = { name: "User" }; 
    showDashboard();
} else {
    showLogin();
}
