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

// 2. Register Screen (Number field added)
function showRegister() {
    root.innerHTML = `
        <div class="container">
            <h2>Create Account</h2>
            <input type="text" id="regName" placeholder="Full Name">
            <input type="email" id="regEmail" placeholder="Email">
            <input type="tel" id="regNumber" placeholder="Phone Number">
            <input type="password" id="regPass" placeholder="Password">
            <button id="btnRegister">Sign Up</button>
            <p class="link" id="goLogin">Back to Login</p>
        </div>`;
        
    document.getElementById('btnRegister').addEventListener('click', handleRegister);
    document.getElementById('goLogin').addEventListener('click', showLogin);
}

// 3. Dashboard
function showDashboard(user) {
    root.innerHTML = `
        <div class="container">
            <h2>Welcome, ${user.name}</h2>
            <p>Email: ${user.email}</p>
            <p>Number: ${user.number}</p>
            <p style="color:#0f0; margin: 10px 0;">● Online</p>
            <button onclick="logout()" style="background:#cf6679;">Logout</button>
        </div>`;
}

// --- API Functions ---

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
        
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch(e) { throw new Error("Server error"); }
        
        if (!res.ok || !data.success) throw new Error(data.message || "Login failed");
        
        localStorage.setItem('user', JSON.stringify(data.data));
        showDashboard(data.data);
    } catch (e) { alert(e.message); }
}

async function handleRegister() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const number = document.getElementById('regNumber').value;
    const pass = document.getElementById('regPass').value;
    
    if(!name || !email || !number || !pass) return alert("Please fill all fields");

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, number, password: pass })
        });
        
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch(e) { throw new Error("Server error"); }
        
        if (!res.ok || !data.success) throw new Error(data.message || "Registration failed");
        
        localStorage.setItem('user', JSON.stringify(data.data));
        showDashboard(data.data);
    } catch (e) { alert(e.message); }
}

function logout() {
    localStorage.removeItem('user');
    location.reload();
}

// Initialize App
const savedUser = localStorage.getItem('user');
if (savedUser) {
    showDashboard(JSON.parse(savedUser)); 
} else {
    showLogin();
}
