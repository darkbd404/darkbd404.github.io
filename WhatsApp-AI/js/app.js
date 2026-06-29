/* ==========================================
   WhatsApp AI Assistant - app.js
========================================== */

"use strict";

/* ---------- State & Config ---------- */
const CONFIG = {
    splashDelay: 1500,
    toastDuration: 2500,
    memoryLimit: 20, // Added memory limit config
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
    toast.textContent = message;
    toast.style.display = "block";
    
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
    setTimeout(() => {
        const splash = getEl("splash-screen");
        const app = getEl("app");
        if (splash) splash.style.display = "none";
        if (app) app.style.display = "block";
    }, CONFIG.splashDelay);

    loadSettings();
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
    const apiKeyEl = getEl("apikey");
    const providerEl = getEl("provider");
    const modelEl = getEl("model");
    
    if (apiKeyEl) apiKeyEl.value = localStorage.getItem("apiKey") || "";
    if (providerEl) providerEl.value = localStorage.getItem("provider") || "openrouter";
    if (modelEl) modelEl.value = localStorage.getItem("model") || CONFIG.defaultModel;

    const promptBox = getEl("systemPrompt");
    if (promptBox) {
        promptBox.value = localStorage.getItem("systemPrompt") || CONFIG.defaultPrompt;
    }
    
    const darkMode = localStorage.getItem("darkMode") === "true";
    const darkModeEl = getEl("darkMode");
    if (darkModeEl) darkModeEl.checked = darkMode;
    if (darkMode) document.body.classList.add("dark-mode");
}

getEl("saveApi")?.addEventListener("click", () => {
    localStorage.setItem("apiKey", getEl("apikey").value);
    localStorage.setItem("provider", getEl("provider").value);
    localStorage.setItem("model", getEl("model").value);
    showToast("API Saved");
});

getEl("savePrompt")?.addEventListener("click", () => {
    localStorage.setItem("systemPrompt", getEl("systemPrompt").value);
    showToast("Prompt Saved");
});

getEl("saveSettings")?.addEventListener("click", () => {
    const lang = getEl("language")?.value;
    const isDark = getEl("darkMode")?.checked;
    
    if (lang) localStorage.setItem("language", lang);
    localStorage.setItem("darkMode", isDark);
    
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
// 👇👇👇 এখানে আপনার কোডটি বসানো হয়েছে 👇👇👇
getEl("clearMemory")?.addEventListener("click", () => {
    localStorage.removeItem("ai_memory"); 
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
        
        // Save to memory automatically after successful reply
        if (typeof addMemory === 'function') {
            addMemory(message, reply);
        }

        showToast("Reply Received");
        return reply;

    } catch (error) {
        console.error("AI Error:", error);
        showToast("AI Error");
        return null;
    }
}

console.log("WhatsApp AI Assistant Loaded Successfully");
