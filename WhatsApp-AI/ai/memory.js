/* ==========================================
   WhatsApp AI Assistant
   Memory Engine
========================================== */

"use strict";

const MEMORY_KEY = "ai_memory";

function loadMemory() {

    const data = localStorage.getItem(MEMORY_KEY);

    if (!data) return [];

    try {

        return JSON.parse(data);

    } catch (e) {

        return [];

    }

}

function saveMemory(memory) {

    localStorage.setItem(

        MEMORY_KEY,

        JSON.stringify(memory)

    );

}

function addMemory(user, assistant) {

    const memory = loadMemory();

    memory.push({

        time: new Date().toISOString(),

        user: user,

        assistant: assistant

    });

    if (memory.length > APP_CONFIG.memoryLimit) {

        memory.shift();

    }

    saveMemory(memory);

}

function clearMemory() {

    localStorage.removeItem(MEMORY_KEY);

}

function getMemory() {

    return loadMemory();

}

function memoryToPrompt(limit = 10) {

    const memory = loadMemory();

    const last = memory.slice(-limit);

    let text = "";

    last.forEach(item => {

        text += "User: " + item.user + "\n";

        text += "Assistant: " + item.assistant + "\n\n";

    });

    return text;

}
