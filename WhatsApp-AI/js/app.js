:root {
    --bg: #f0f2f5;
    --card: #ffffff;
    --text: #111b21;
    --text-muted: #667781;
    --primary: #00a884;
    --primary-hover: #008f6f;
    --header-bg: #008069;
    --header-text: #ffffff;
    --sidebar-bg: #ffffff;
    --border: #e9edef;
    --input-bg: #f0f2f5;
    --shadow: 0 1px 3px rgba(0,0,0,0.1);
}

body.dark-mode {
    --bg: #111b21;
    --card: #1f2c33;
    --text: #e9edef;
    --text-muted: #8696a0;
    --primary: #00a884;
    --primary-hover: #00c49d;
    --header-bg: #1f2c33;
    --header-text: #e9edef;
    --sidebar-bg: #111b21;
    --border: #2a3942;
    --input-bg: #2a3942;
    --shadow: 0 1px 3px rgba(0,0,0,0.3);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
    background-color: var(--bg);
    color: var(--text);
    transition: background 0.3s, color 0.3s;
    line-height: 1.5;
}

/* Custom Scrollbar */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
body.dark-mode ::-webkit-scrollbar-thumb { background: #444; }
::-webkit-scrollbar-thumb:hover { background: #aaa; }

/* Splash Screen */
#splash-screen {
    position: fixed; inset: 0;
    background: var(--primary);
    color: white;
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
}
.logo-box { text-align: center; animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 0.8; } 50% { opacity: 1; } 100% { opacity: 0.8; } }

/* App Layout */
#app { display: none; min-height: 100vh; }

header {
    background: var(--header-bg);
    color: var(--header-text);
    padding: 1rem;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
    box-shadow: var(--shadow);
}
header h2 { font-size: 1.25rem; font-weight: 600; }
header button { background: none; border: none; color: inherit; font-size: 1.5rem; cursor: pointer; padding: 0.25rem; }

/* Sidebar */
#sidebar {
    position: fixed; top: 0; left: -280px; bottom: 0;
    width: 280px; background: var(--sidebar-bg);
    border-right: 1px solid var(--border);
    z-index: 200; transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex; flex-direction: column;
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
}
#sidebar .profile { padding: 2rem 1rem; text-align: center; border-bottom: 1px solid var(--border); }
.avatar { font-size: 3rem; margin-bottom: 0.5rem; }
#sidebar nav ul { list-style: none; padding: 1rem 0; flex: 1; overflow-y: auto; }
.nav-btn {
    width: 100%; padding: 1rem 1.5rem;
    background: none; border: none; text-align: left;
    color: var(--text); font-size: 1rem; cursor: pointer;
    transition: background 0.2s, color 0.2s;
    border-left: 3px solid transparent;
}
.nav-btn:hover { background: var(--input-bg); color: var(--primary); }
.nav-btn.active { border-left-color: var(--primary); background: var(--input-bg); font-weight: 600; }

/* Main Content */
main { padding: 1.5rem; max-width: 900px; margin: 0 auto; width: 100%; }
.page { display: none; animation: fadeIn 0.3s ease-out; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Cards */
.card {
    background: var(--card);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow);
    border: 1px solid var(--border);
}
.card h2 { margin-bottom: 1.25rem; color: var(--text); font-size: 1.5rem; }
.card h3 { margin-bottom: 0.75rem; color: var(--text); font-size: 1.1rem; }

/* Form Elements */
.form-label { display: block; margin-bottom: 0.5rem; font-weight: 500; margin-top: 1rem; color: var(--text); }
input, select, textarea {
    width: 100%; padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px; background: var(--input-bg);
    color: var(--text); font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}
input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(0, 168, 132, 0.2);
}
textarea { resize: vertical; min-height: 100px; font-family: inherit; }

/* Buttons */
button:not(.nav-btn):not(header button) {
    background: var(--primary); color: white;
    border: none; padding: 0.75rem 1.5rem;
    border-radius: 8px; font-weight: 600;
    cursor: pointer; margin-top: 1rem;
    transition: background 0.2s, transform 0.1s;
    font-size: 1rem;
}
button:hover { background: var(--primary-hover); }
button:active { transform: scale(0.98); }

/* Toggle Switch */
.switch { position: relative; display: inline-block; width: 50px; height: 26px; vertical-align: middle; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
    position: absolute; cursor: pointer; inset: 0;
    background-color: #ccc; transition: .4s; border-radius: 34px;
}
.slider:before {
    position: absolute; content: ""; height: 18px; width: 18px;
    left: 4px; bottom: 4px; background-color: white;
    transition: .4s; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
input:checked + .slider { background-color: var(--primary); }
input:checked + .slider:before { transform: translateX(24px); }

/* Toast Notification */
#toast {
    display: none; position: fixed; bottom: 2rem; left: 50%;
    transform: translateX(-50%); background: #333; color: white;
    padding: 0.75rem 1.5rem; border-radius: 50px;
    z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 0.9rem; font-weight: 500;
    animation: slideUp 0.3s ease-out;
}
@keyframes slideUp { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

/* Responsive Design */
@media (max-width: 768px) {
    header h2 { font-size: 1.1rem; }
    main { padding: 1rem; }
    .card { padding: 1.25rem; }
    
    /* On mobile, sidebar covers full width when open */
    #sidebar { width: 80%; max-width: 300px; }
}
