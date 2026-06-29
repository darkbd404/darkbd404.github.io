/* ==========================================
   WhatsApp AI Assistant - app.js
========================================== */

"use strict";

/* ---------- State & Config ---------- */
const CONFIG = {
    splashDelay: 1500,
    toastDuration: 2500,
    defaultPrompt: `You are my WhatsApp AI Assistant.\nAlways reply in the user's language.\nKeep replies short.\nBe polite.\nIf you don't know the answer say:\n"I don't know."`,
    defaultModel: "deepseek/deepseek-chat-v3-0324:free"
};

const PAGES = [
    "dashboardPage", "whatsappPage", "aiPage", "faqPage", 
    "memoryPage", "logsPage", "settingsPage", "aboutPage"
];

/* ---------- Helpers ---------- */

/** Safe element getter */
const getEl = (id) => document.getElementById(id);

/** Show toast notification */
function showToast(message) {
    const toast = getEl("toast");
    if (!toast) return;
    toast.textContent = message; // Use textContent for security/performance
    toast.style.display = "block";
    
    // Clear existing timeout to prevent flickering if called rapidly
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    
    window.toastTimeout = setTimeout(() => {
        toast.style.display = "none";
    }, CONFIG.toastDuration);
}

/** Switch visible page */
function openPage(pageId) {
    PAGES.forEach(id => {
        const el = getEl(id);
        if (el) el.style.display = (id === pageId) ? "block" : "none";
    });
}

/* ---------- Initialization ---------- */

window.addEventListener("load", () => {
    // Splash Screen
    setTimeout(() => {
        const splash = getEl("splash-screen");
        const app = getEl("app");
        if (splash) splash.style.display = "none";
        if (app) app.style.display = "block";
    }, CONFIG.splashDelay);

    // Load Saved Data
    loadSettings();
    
    // Initial View
    openPage("dashboardPage");
});

/* ---------- Sidebar Logic ---------- */

let sidebarOpen = false;
const sidebar = getEl("sidebar");
const menuBtn = getEl("menu-btn");

if (menuBtn && sidebar) {
    menuBtn.onclick = () => {
        sidebarOpen = !sidebarOpen;
        sidebar.style.left = sidebarOpen ? "0" : "-280px";
    };
}

/* ---------- Navigation ---------- */

// Map nav IDs to page IDs dynamically to avoid repetitive code
const navMap = {
    "nav-dashboard": "dashboardPage",
    "nav-whatsapp": "whatsappPage",
    "nav-ai": "aiPage",
    "nav-faq": "faqPage",
    "nav-memory": "memoryPage",
    "nav-logs": "logsPage",
    "nav-settings": "settingsPage",
    "nav-about": "aboutPage"
};

Object.keys(navMap).forEach(navId => {
    const btn = getEl(navId);
    if (btn) {
        btn.onclick = () => openPage(navMap[navId]);
    }
});

/* ---------- Settings & Storage ---------- */

function loadSettings() {
    // API Config
    const apiKeyEl = getEl("apikey");
    const providerEl = getEl("provider");
    const modelEl = getEl("model");
    
    if (apiKeyEl) apiKeyEl.value = localStorage.getItem("apiKey") || "";
    if (providerEl) providerEl.value = localStorage.getItem("provider") || "openrouter";
    if (modelEl) modelEl.value = localStorage.getItem("model") || CONFIG.defaultModel;

    // System Prompt
    const promptBox = getEl("systemPrompt");
    if (promptBox) {
        promptBox.value = localStorage.getItem("systemPrompt") || CONFIG.defaultPrompt;
    }
    
    // UI Settings (Apply dark mode if saved)
    const darkMode = localStorage.getItem("darkMode") === "true";
    const darkModeEl = getEl("darkMode");
    if (darkModeEl) darkModeEl.checked = darkMode;
    if (darkMode) document.body.classList.add("dark-mode"); // Assuming CSS class exists
}

// Save API Credentials
getEl("saveApi")?.addEventListener("click", () => {
    localStorage.setItem("apiKey", getEl("apikey").value);
    localStorage.setItem("provider", getEl("provider").value);
    localStorage.setItem("model", getEl("model").value);
    showToast("API Saved");
});

// Save System Prompt
getEl("savePrompt")?.addEventListener("click", () => {
    localStorage.setItem("systemPrompt", getEl("systemPrompt").value);
    showToast("Prompt Saved");
});

// Save General Settings
getEl("saveSettings")?.addEventListener("click", () => {
    const lang = getEl("language")?.value;
    const isDark = getEl("darkMode")?.checked;
    
    if (lang) localStorage.setItem("language", lang);
    localStorage.setItem("darkMode", isDark);
    
    // Apply dark mode immediately
    if (isDark) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
    
    showToast("Settings Saved");
});

/* ---------- Features ---------- */

// Start AI / Test Connection
getEl("start-ai")?.addEventListener("click", async () => {
    const aiStatus = getEl("ai-status");
    const waStatus = getEl("wa-status");
    
    if (aiStatus) aiStatus.innerHTML = "🟢 Online";
    if (waStatus) waStatus.innerHTML = "🟢 Connected";
    
    showToast("Testing AI...");
    
    try {
        // Note: askAI must be defined globally or imported
        const reply = await sendMessageToAI("Hello");
        console.log("Test Reply:", reply);
    } catch (error) {
        console.error(error);
        showToast("AI Test Failed");
    }
});

// FAQ
getEl("addFaq")?.addEventListener("click", () => {
    showToast("FAQ Feature Coming Soon");
});

// Memory
getEl("clearMemory")?.addEventListener("click", () => {
    localStorage.removeItem("memory");
    showToast("Memory Cleared");
});

// Logs
getEl("clearLogs")?.addEventListener("click", () => {
    localStorage.removeItem("logs");
    showToast("Logs Cleared");
});

/* ---------- AI Engine ---------- */

async function sendMessageToAI(message) {
    if (!message || !message.trim()) {
        showToast("Message Empty");
        return null;
    }

    showToast("AI Thinking...");

    try {
        // Ensure askAI is available in scope
        if (typeof askAI !== 'function') {
            throw new Error("askAI function not defined");
        }

        const reply = await askAI(message);

        if (!reply) {
            showToast("No Reply");
            return null;
        }

        console.log("User :", message);
        console.log("AI :", reply);
        showToast("Reply Received");
        return reply;

    } catch (error) {
        console.error("AI Error:", error);
        showToast("AI Error");
        return null;
    }
}

console.log("WhatsApp AI Assistant Loaded Successfully");
