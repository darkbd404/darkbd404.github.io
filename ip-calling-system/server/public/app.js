const root = document.getElementById('root');

function showLogin() {
    root.innerHTML = `
        <div class="container">
            <h2>Login</h2>
            <input type="email" id="loginEmail" placeholder="Email">
            <input type="password" id="loginPass" placeholder="Password">
            <button id="btnLogin">Login</button>
        </div>`;
    
    document.getElementById('btnLogin').addEventListener('click', handleLogin);
}

function showDashboard(user) {
    root.innerHTML = `
        <div class="container">
            <h2>Welcome, ${user.name}</h2>
            <p>Email: ${user.email}</p>
            <p>Number: ${user.number}</p>
            <button onclick="logout()" style="background:#cf6679;">Logout</button>
        </div>`;
}

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
        try { data = JSON.parse(text); } catch(e) { throw new Error("Server not responding. Wait 1 min and try again."); }
        
        if (!res.ok || !data.success) throw new Error(data.message || "Login failed");
        
        localStorage.setItem('user', JSON.stringify(data.data));
        showDashboard(data.data);
    } catch (e) { alert(e.message); }
}

function logout() {
    localStorage.removeItem('user');
    location.reload();
}

// Initialize
const savedUser = localStorage.getItem('user');
if (savedUser) {
    showDashboard(JSON.parse(savedUser)); 
} else {
    showLogin();
}
