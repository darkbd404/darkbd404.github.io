"use strict";

/* ==========================================
   WhatsApp AI Assistant
   Version : V6 Stable
   Chat Engine
========================================== */

const chatHistory=[];

const chatContainer=document.getElementById("chatContainer");
const messageInput=document.getElementById("messageInput");
const sendBtn=document.getElementById("sendBtn");

/* ---------- Bubble ---------- */

function addMessage(role,text){

    if(!chatContainer) return;

    const row=document.createElement("div");

    row.className=

    role==="user"

    ?"user-message"

    :"ai-message";

    row.innerHTML=`

    <div class="bubble">

    ${text}

    </div>

    `;

    chatContainer.appendChild(row);

    chatContainer.scrollTop=

    chatContainer.scrollHeight;

}

/* ---------- History ---------- */

function addHistory(role,text){

    chatHistory.push({

        id:Date.now(),

        role,

        text,

        time:new Date().toLocaleString()

    });

}

function clearChatHistory(){

    chatHistory.length=0;

    if(chatContainer){

        chatContainer.innerHTML="";

    }

}

function exportChat(){

    return JSON.stringify(

        chatHistory,

        null,

        2

    );

}

/* ---------- Send ---------- */

async function sendMessage(){

    const message=

    messageInput.value.trim();

    if(!message){

        return;

    }

    addMessage(

        "user",

        message

    );

    addHistory(

        "user",

        message

    );

    messageInput.value="";

    addMessage(

        "assistant",

        "⏳ Thinking..."

    );

    const thinking=

    chatContainer.lastElementChild;

    let reply=

    searchFAQ(message);

    if(!reply){

        reply=

        await askAI(message);

    }

    if(!reply){

        reply=

        "❌ No response.";

    }

    thinking.remove();

    addMessage(

        "assistant",

        reply

    );

    addHistory(

        "assistant",

        reply

    );

    addMemory(

        message,

        reply

    );

    updateCounters();

}

/* ---------- Events ---------- */

sendBtn?.addEventListener(

"click",

sendMessage

);

messageInput?.addEventListener(

"keydown",

e=>{

if(e.key==="Enter"){

e.preventDefault();

sendMessage();

}

}

);

console.log(

"Chat Engine V6 Stable Loaded"

);
