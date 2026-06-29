"use strict";

/* ==========================================
   WhatsApp AI Assistant
   Chat Engine
========================================== */

let chatHistory = [];

function addUserMessage(message){

    chatHistory.push({

        type:"user",

        text:message,

        time:new Date().toLocaleTimeString()

    });

}

function addAIMessage(message){

    chatHistory.push({

        type:"assistant",

        text:message,

        time:new Date().toLocaleTimeString()

    });

}

function getChatHistory(){

    return chatHistory;

}

function clearChat(){

    chatHistory=[];

}

async function sendChat(message){

    if(!message){

        showToast("Empty Message");

        return;

    }

    addUserMessage(message);

    const reply = await askAI(message);

    if(reply){

        addAIMessage(reply);

        renderChat();

        return reply;

    }

    showToast("AI Error");

}

function renderChat(){

    const logs=document.getElementById("logs");

    if(!logs) return;

    logs.innerHTML="";

    chatHistory.forEach(item=>{

        logs.innerHTML+=`

        <div class="card">

            <b>${item.type.toUpperCase()}</b>

            <br><br>

            ${item.text}

            <br><br>

            <small>${item.time}</small>

        </div>

        `;

    });

}

async function testChat(){

    await sendChat("Hello");

}

console.log("Chat Engine Loaded");
