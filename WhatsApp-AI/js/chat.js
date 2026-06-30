"use strict";

/* ==========================================
   Chat Engine V5 (Gemini)
========================================== */

const chatHistory = [];

/* ---------- History ---------- */

function addHistory(role,text){

    chatHistory.push({

        id:crypto.randomUUID(),

        role,

        text,

        time:new Date().toLocaleString()

    });

}

function getChatHistory(){

    return chatHistory;

}

function clearChatHistory(){

    chatHistory.length = 0;

}

/* ---------- Chat ---------- */

async function processChat(message){

    if(!message){

        return null;

    }

    message = message.trim();

    if(message===""){

        return null;

    }

    addHistory("user",message);

    /* ==========================
       FAQ First
    ========================== */

    const faqReply = searchFAQ(message);

    if(faqReply){

        addHistory("assistant",faqReply);

        addMemory(message,faqReply);

        return faqReply;

    }

    /* ==========================
       Gemini
    ========================== */

    let aiReply = null;

    try{

        aiReply = await askAI(message);

    }

    catch(error){

        console.error(error);

        return "❌ Gemini API Error.";

    }

    if(aiReply){

        addHistory("assistant",aiReply);

        addMemory(message,aiReply);

        return aiReply;

    }

    return "⚠️ No response received.";

}

/* ---------- Export ---------- */

function exportChat(){

    return JSON.stringify(

        chatHistory,

        null,

        2

    );

}

/* ---------- Import ---------- */

function importChat(json){

    try{

        const data = JSON.parse(json);

        if(Array.isArray(data)){

            chatHistory.length = 0;

            chatHistory.push(...data);

            return true;

        }

    }

    catch(error){

        console.error(error);

    }

    return false;

}

/* ---------- Count ---------- */

function chatCount(){

    return chatHistory.length;

}

console.log("Chat Engine V5 Loaded");
