:root {
    --bg: #f0f2f5;
    --card: #ffffff;
    --text: #111b21;
    --text-muted: #667781;
    --primary: #00a884;
    --header-bg: #008069;
    --header-text: #ffffff;
    --sidebar-bg: #ffffff;
    --border: #e9edef;
    --input-bg: #f0f2f5;
}

body.dark-mode {
    --bg: #111b21;
    --card: #1f2c33;
    --text: #e9edef;
    --text-muted: #8696a0;
    --primary: #00a884;
    --header-bg: #1f2c33;
    --header-text: #e9edef;
    --sidebar-bg: #111b21;
    --border: #2a3942;
    --input-bg: #2a3942;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
    background-color: var(--bg);
    color: var(--text);
    transition: background 0.3s, color 0.3s;
}

/* Splash Screen */
#splash-screen {
    position: fixed; inset: 0;
    background: var(--primary);
    color: white;
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
}
.logo-box { text-align: center; }

/* App Layout */
#app { display: none; }
header {
    background: var(--header-bg);
    color: var(--header-text);
    padding: 1rem;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
header button { background: none; border: none; color: inherit; font-size: 1.5rem; cursor: pointer; }

/* Sidebar */
#sidebar {
    position: fixed; top: 0; left: -280px; bottom: 0;
    width: 280px; background: var(--sidebar-bg);
    border-right: 1px solid var(--border);
    z-index: 200; transition: left 0.3s ease;
    display: flex; flex-direction: column;
}
#sidebar .profile { padding: 2rem 1rem; text-align: center; border-bottom: 1px solid var(--border); }
.avatar { font-size: 3rem; margin-bottom: 0.5rem; }
#sidebar nav ul { list-style: none; padding: 1rem 0; flex: 1; }
#sidebar nav li { padding: 0; }
.nav-btn {
    width: 100%; padding: 1rem 1.5rem;
    background: none; border: none; text-align: left;
    color: var(--text); font-size: 1rem; cursor: pointer;
    transition: background 0.2s;
}
.nav-btn:hover { background: var(--input-bg); }

/* Main Content */
main { padding: 1rem; max-width: 800px; margin: 0 auto; }
.page { display: none; animation: fadeIn 0.3s; }
.page.active { display: block; } /* Fallback if JS fails */

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Cards */
.card {
    background: var(--card);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.card h2, .card h3 { margin-bottom: 1rem; color: var(--text); }

/* Form Elements */
.form-label { display: block; margin-bottom: 0.5rem; font-weight: 500; margin-top: 1rem; }
input, select, textarea {
    width: 100%; padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 6px; background: var(--input-bg);
    color: var(--text); font-size: 1rem;
}
textarea { resize: vertical; }

button:not(.nav-btn):not(header button) {
    background: var(--primary); color: white;
    border: none; padding: 0.75rem 1.5rem;
    border-radius: 6px; font-weight: 600;
    cursor: pointer; margin-top: 1rem;
    transition: opacity 0.2s;
}
button:hover { opacity: 0.9; }

/* Toggle Switch */
.switch { position: relative; display: inline-block; width: 50px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
    position: absolute; cursor: pointer; inset: 0;
    background-color: #ccc; transition: .4s; border-radius: 24px;
}
.slider:before {
    position: absolute; content: ""; height: 18px; width: 18px;
    left: 3px; bottom: 3px; background-color: white;
    transition: .4s; border-radius: 50%;
}
input:checked + .slider { background-color: var(--primary); }
input:checked + .slider:before { transform: translateX(26px); }

/* Toast */
#toast {
    display: none; position: fixed; bottom: 2rem; left: 50%;
    transform: translateX(-50%); background: #333; color: white;
    padding: 0.75rem 1.5rem; border-radius: 20px;
    z-index: 1000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    font-size: 0.9rem;
}
