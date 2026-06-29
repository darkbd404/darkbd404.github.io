"use strict";

/* ==========================================
   WhatsApp AI Assistant V4
========================================== */

/* ==========================
   DOM Elements
========================== */

const loading = document.getElementById("loading");
const app = document.getElementById("app");

const sidebar = document.getElementById("sidebar");

const menuBtn = document.getElementById("menuBtn");
const themeBtn = document.getElementById("themeBtn");
const searchBtn = document.getElementById("searchBtn");
const settingsBtn = document.getElementById("settingsBtn");

const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const chatContainer = document.getElementById("chatContainer");

const aiStatus = document.getElementById("ai-status");
const waStatus = document.getElementById("wa-status");

const memoryCount = document.getElementById("memoryCount");
const faqCount = document.getElementById("faqCount");

const toast = document.getElementById("toast");

/* ==========================
   Loading
========================== */

window.addEventListener("load",()=>{

setTimeout(()=>{

if(loading){

loading.style.display="none";

}

if(app){

app.style.display="block";

}

initApp();

},1200);

});

/* ==========================
   Toast
========================== */

function showToast(message){

if(!toast) return;

toast.textContent=message;

toast.style.display="block";

clearTimeout(window.toastTimer);

window.toastTimer=setTimeout(()=>{

toast.style.display="none";

},2500);

}

/* ==========================
   Theme
========================== */

let darkMode=

localStorage.getItem("theme")==="true";

if(darkMode){

document.body.classList.add("dark");

}

themeBtn?.addEventListener("click",()=>{

darkMode=!darkMode;

document.body.classList.toggle("dark",darkMode);

localStorage.setItem(

"theme",

darkMode

);

showToast(

darkMode

?

"Dark Mode"

:

"Light Mode"

);

});

/* ==========================
   Sidebar
========================== */

let sidebarOpen=true;

menuBtn?.addEventListener("click",()=>{

sidebarOpen=!sidebarOpen;

if(window.innerWidth<=900){

sidebar.style.display=

sidebarOpen

?

"block"

:

"none";

}else{

sidebar.style.width=

sidebarOpen

?

"260px"

:

"85px";

}

});

/* ==========================
   Status
========================== */

function setAIStatus(text){

if(aiStatus){

aiStatus.textContent=text;

}

}

function setWAStatus(text){

if(waStatus){

waStatus.textContent=text;

}

}

/* ==========================
   Counters
========================== */

function updateCounters(){

if(memoryCount){

memoryCount.textContent=

getMemory().length+" Chats";

}

if(faqCount){

faqCount.textContent=

loadFAQ().length+" Items";

}

}

console.log("App Part 1 Loaded");
/* ==========================================
   Chat Engine
========================================== */

function addMessage(text, sender = "ai") {

    if (!chatContainer) return;

    const wrapper = document.createElement("div");

    wrapper.className =
        sender === "user"
        ? "user-message"
        : "ai-message";

    const bubble = document.createElement("div");

    bubble.className = "bubble";

    bubble.textContent = text;

    wrapper.appendChild(bubble);

    chatContainer.appendChild(wrapper);

    chatContainer.scrollTop =
        chatContainer.scrollHeight;

}

/* ==========================================
   Send Message
========================================== */

async function sendMessage() {

    if (!messageInput) return;

    const message = messageInput.value.trim();

    if (!message) {

        showToast("Type a message");

        return;

    }

    addMessage(message, "user");

    messageInput.value = "";

    showToast("Thinking...");

    try {

        const reply = await processChat(message);

        if (reply) {

            addMessage(reply, "ai");

            setAIStatus("🟢 Online");

        } else {

            addMessage("No response received.", "ai");

        }

    } catch (err) {

        console.error(err);

        addMessage("AI connection failed.", "ai");

        setAIStatus("🔴 Offline");

    }

    updateCounters();

}

/* ==========================================
   Chat Events
========================================== */

sendBtn?.addEventListener("click", sendMessage);

messageInput?.addEventListener("keydown", e => {

    if (e.key === "Enter") {

        e.preventDefault();

        sendMessage();

    }

});

/* ==========================================
   Chat History
========================================== */

function restoreMemory() {

    const history = getMemory();

    if (!history.length) return;

    history.forEach(item => {

        addMessage(item.user, "user");

        addMessage(item.assistant, "ai");

    });

}

console.log("App Part 2 Loaded");
/* ==========================================
   Initialize
========================================== */

function initApp(){

    updateCounters();

    restoreMemory();

    setAIStatus("⚪ Idle");

    setWAStatus("⚪ Waiting");

}

/* ==========================================
   Search Button
========================================== */

searchBtn?.addEventListener("click",()=>{

    showToast("Search feature coming soon");

});

/* ==========================================
   Settings Button
========================================== */

settingsBtn?.addEventListener("click",()=>{

    if(typeof showPage==="function"){

        showPage("settings");

    }

});

/* ==========================================
   Start AI
========================================== */

const startBtn=document.getElementById("start-ai");

startBtn?.addEventListener("click",async()=>{

    showToast("Starting AI...");

    try{

        const reply=await askAI("Reply only: OK");

        if(reply){

            setAIStatus("🟢 Online");

            setWAStatus("🟢 Ready");

            showToast("AI Ready");

        }else{

            setAIStatus("🔴 Offline");

        }

    }catch(e){

        console.error(e);

        setAIStatus("🔴 Offline");

        showToast("Connection Failed");

    }

});

/* ==========================================
   Floating Button
========================================== */

const fab=document.getElementById("fab");

fab?.addEventListener("click",()=>{

    messageInput?.focus();

    showToast("Ready to chat");

});

console.log("App Part 3 Loaded");
/* ==========================================
   Window Resize
========================================== */

window.addEventListener("resize",()=>{

    if(window.innerWidth>900){

        if(sidebar){

            sidebar.style.display="block";
            sidebar.style.width="260px";

        }

    }

});

/* ==========================================
   Dashboard Refresh
========================================== */

function refreshDashboard(){

    updateCounters();

    if(typeof refreshAIPage==="function"){

        refreshAIPage();

    }

    if(typeof refreshWhatsAppPage==="function"){

        refreshWhatsAppPage();

    }

}

/* ==========================================
   Global Refresh
========================================== */

window.addEventListener("focus",()=>{

    refreshDashboard();

});

/* ==========================================
   Auto Refresh
========================================== */

setInterval(()=>{

    refreshDashboard();

},3000);

/* ==========================================
   Safe Functions
========================================== */

window.showToast=showToast;
window.setAIStatus=setAIStatus;
window.setWAStatus=setWAStatus;
window.updateCounters=updateCounters;
window.addMessage=addMessage;

/* ==========================================
   Error Handler
========================================== */

window.addEventListener("error",(event)=>{

    console.error("App Error:",event.error);

});

/* ==========================================
   Finish
========================================== */

console.log("WhatsApp AI Assistant V4 Ready");
