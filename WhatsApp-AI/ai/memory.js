/* ==========================================
   WhatsApp AI Assistant - Memory Engine
========================================== */

"use strict";

const MEMORY_KEY = "ai_memory";
// Fallback limit if CONFIG is not defined in app.js
const MEMORY_LIMIT = (typeof CONFIG !== 'undefined' && CONFIG.memoryLimit) ? CONFIG.memoryLimit : 20;

/* ---------- Core Logic ---------- */

function loadMemory() {
    try {
        const data = localStorage.getItem(MEMORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Memory Load Error:", e);
        return [];
    }
}

function saveMemory(memoryArray) {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memoryArray));
}

function addMemory(userMsg, assistantMsg) {
    if (!userMsg && !assistantMsg) return; // Prevent saving empty turns
    
    const memory = loadMemory();
    memory.push({
        id: Date.now(),
        time: new Date().toISOString(),
        user: userMsg || "",
        assistant: assistantMsg || ""
    });

    // Trim oldest messages if limit is exceeded
    while (memory.length > MEMORY_LIMIT) {
        memory.shift();
    }

    saveMemory(memory);
}

function clearMemory() {
    localStorage.removeItem(MEMORY_KEY);
    renderMemoryList(); // Update UI immediately
}

function getMemory() {
    return loadMemory();
}

/* ---------- AI Integration ---------- */

/**
 * Formats memory into a prompt context for the AI.
 * @param {number} limit - Number of recent turns to include.
 */
function memoryToPrompt(limit = 10) {
    const memory = loadMemory();
    if (!memory.length) return "";

    const last = memory.slice(-limit);
    let text = "\n--- CONVERSATION HISTORY ---\nUse this context to remember previous messages:\n\n";
    
    last.forEach(item => {
        if (item.user) text += `User: ${item.user}\n`;
        if (item.assistant) text += `Assistant: ${item.assistant}\n`;
        text += "\n";
    });
    
    text += "--- END HISTORY ---\n";
    return text;
}

/* ---------- UI Rendering ---------- */

function renderMemoryList() {
    const listEl = document.getElementById("memoryList");
    if (!listEl) return;

    const memory = loadMemory();
    
    if (memory.length === 0) {
        listEl.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:1rem;">No Memory Saved</p>';
        return;
    }

    // Show most recent conversations at the top
    const reversed = [...memory].reverse();
    
    listEl.innerHTML = reversed.map(item => {
        const date = new Date(item.time).toLocaleString();
        return `
            <div class="memory-item" style="border-bottom:1px solid var(--border); padding:10px 0;">
                <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:5px;">${date}</div>
                <div><strong>You:</strong> ${escapeHTML(item.user)}</div>
                <div style="color:var(--primary); margin-top:4px;"><strong>AI:</strong> ${escapeHTML(item.assistant)}</div>
            </div>
        `;
    }).join("");
}

// Helper to prevent XSS when displaying user/AI text
function escapeHTML(str) {
    if (!str) return "";
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/* ---------- Initialization Hook ---------- */

document.addEventListener("DOMContentLoaded", () => {
    // Initial Render
    renderMemoryList();
    
    // Ensure UI updates when the clear button is clicked
    const clearBtn = document.getElementById("clearMemory");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            // Small delay to ensure localStorage is cleared by app.js first
            setTimeout(renderMemoryList, 50); 
        });
    }
});
