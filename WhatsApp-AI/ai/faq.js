/* ==========================================
   WhatsApp AI Assistant - FAQ Engine
========================================== */

"use strict";

const FAQ_KEY = "ai_faq";

/* ---------- Core Logic ---------- */

function loadFAQ() {
    try {
        const data = localStorage.getItem(FAQ_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("FAQ Load Error:", e);
        return [];
    }
}

function saveFAQ(faqArray) {
    localStorage.setItem(FAQ_KEY, JSON.stringify(faqArray));
}

function addFAQ(question, answer) {
    if (!question.trim() || !answer.trim()) return false;
    
    const faq = loadFAQ();
    faq.push({
        id: Date.now(),
        question: question.trim(),
        answer: answer.trim(),
        created: new Date().toISOString()
    });
    saveFAQ(faq);
    return true;
}

function removeFAQ(id) {
    let faq = loadFAQ();
    faq = faq.filter(item => item.id !== id);
    saveFAQ(faq);
}

function clearFAQ() {
    localStorage.removeItem(FAQ_KEY);
}

/* ---------- Search & Integration ---------- */

/**
 * Searches FAQ for a match.
 * Checks if user message contains FAQ question OR if FAQ question contains user message.
 */
function searchFAQ(userMessage) {
    const faq = loadFAQ();
    if (!faq.length) return null;

    const text = userMessage.toLowerCase();

    // Priority 1: Exact or strong substring match
    for (const item of faq) {
        const q = item.question.toLowerCase();
        // If user asks exactly the question, or question is part of user message
        if (text.includes(q) || q.includes(text)) {
            return item.answer;
        }
    }

    // Priority 2: Keyword overlap (simple implementation)
    const words = text.split(/\s+/).filter(w => w.length > 3);
    for (const item of faq) {
        const q = item.question.toLowerCase();
        const a = item.answer.toLowerCase();
        
        // Check if significant words from user message appear in Q or A
        const matchCount = words.filter(word => q.includes(word) || a.includes(word)).length;
        if (matchCount >= 2) { // Require at least 2 matching keywords
            return item.answer;
        }
    }

    return null;
}

/**
 * Formats FAQ into a string for the System Prompt
 */
function faqToPrompt() {
    const faq = loadFAQ();
    if (!faq.length) return "";

    let prompt = "\n--- KNOWLEDGE BASE (FAQ) ---\nUse these answers if the user asks related questions:\n\n";
    faq.forEach(item => {
        prompt += `Q: ${item.question}\nA: ${item.answer}\n\n`;
    });
    prompt += "--- END KNOWLEDGE BASE ---\n";
    
    return prompt;
}

/* ---------- UI Rendering ---------- */

function renderFAQList() {
    const listEl = document.getElementById("faqList");
    if (!listEl) return;

    const faq = loadFAQ();
    
    if (faq.length === 0) {
        listEl.innerHTML = '<p class="text-muted">No FAQ Added</p>';
        return;
    }

    listEl.innerHTML = faq.map(item => `
        <div class="faq-item" style="border-bottom:1px solid var(--border); padding:10px 0;">
            <strong>Q:</strong> ${item.question}<br>
            <span style="color:var(--text-muted)">A:</span> ${item.answer}
            <button onclick="deleteFAQItem(${item.id})" style="background:#ff4d4d; padding:2px 8px; font-size:0.8rem; margin-left:10px;">Delete</button>
        </div>
    `).join("");
}

// Global function for the delete button onclick
window.deleteFAQItem = function(id) {
    removeFAQ(id);
    renderFAQList();
    showToast("FAQ Deleted");
};

/* ---------- Initialization Hook ---------- */

// Hook into the existing 'addFaq' button in app.js
document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("addFaq");
    const qInput = document.getElementById("faqQuestion");
    const aInput = document.getElementById("faqAnswer");

    if (addBtn && qInput && aInput) {
        addBtn.onclick = () => {
            const success = addFAQ(qInput.value, aInput.value);
            if (success) {
                qInput.value = "";
                aInput.value = "";
                renderFAQList();
                showToast("FAQ Added");
            } else {
                showToast("Please fill both fields");
            }
        };
    }
    
    // Initial Render
    renderFAQList();
});
