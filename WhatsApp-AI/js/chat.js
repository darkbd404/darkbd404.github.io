"use strict";

/* ==========================================
   Chat Engine V3
========================================== */

const chatHistory = [];

/* ---------- Save History ---------- */

function addHistory(role, text) {

    chatHistory.push({
        role: role,
        text: text,
        time: Date.now()
    });

}

/* ---------- Get History ---------- */

function getChatHistory() {

    return chatHistory;

}

/* ---------- Clear ---------- */

function clearChatHistory() {

    chatHistory.length = 0;

}

/* ---------- Main Chat ---------- */

async function processChat(message) {

    if (!message) {

        return null;

    }

    addHistory("user", message);

    /* ==========================
       FAQ First
    ========================== */

    const faqReply = searchFAQ(message);

    if (faqReply) {

        addHistory("assistant", faqReply);

        addMemory(message, faqReply);

        return faqReply;

    }

    /* ==========================
       AI
    ========================== */

    const aiReply = await askAI(message);

    if (aiReply) {

        addHistory("assistant", aiReply);

        addMemory(message, aiReply);

        return aiReply;

    }

    return "Sorry, I couldn't generate a reply.";

}

/* ---------- Export ---------- */

function exportChat() {

    return JSON.stringify(

        chatHistory,

        null,

        2

    );

}

console.log("Chat Engine V3 Loaded");
