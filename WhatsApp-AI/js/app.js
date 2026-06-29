/* ==========================================
   WhatsApp AI Assistant
   app.js
========================================== */

"use strict";

/* ---------- Splash Screen ---------- */

window.addEventListener("load", () => {

    setTimeout(() => {

        document.getElementById("splash-screen").style.display = "none";

        document.getElementById("app").style.display = "block";

    },1500);

});

/* ---------- Sidebar ---------- */

const sidebar = document.getElementById("sidebar");

const menuBtn = document.getElementById("menu-btn");

let sidebarOpen = false;

menuBtn.onclick = () => {

    if(sidebarOpen){

        sidebar.style.left="-280px";

        sidebarOpen=false;

    }else{

        sidebar.style.left="0";

        sidebarOpen=true;

    }

};

/* ---------- Toast ---------- */

function showToast(message){

    const toast=document.getElementById("toast");

    toast.innerHTML=message;

    toast.style.display="block";

    setTimeout(()=>{

        toast.style.display="none";

    },2500);

}

/* ---------- Status ---------- */

const aiStatus=document.getElementById("ai-status");

const waStatus=document.getElementById("wa-status");

document.getElementById("start-ai").onclick=()=>{

    aiStatus.innerHTML="🟢 Online";

    waStatus.innerHTML="🟢 Ready";

    showToast("AI Started");

};

/* ---------- Pages ---------- */

const pages=[

"dashboardPage",

"whatsappPage",

"aiPage",

"faqPage",

"memoryPage",

"logsPage",

"settingsPage",

"aboutPage"

];

function openPage(page){

    pages.forEach(id=>{

        document.getElementById(id).style.display="none";

    });

    document.getElementById(page).style.display="block";

}

openPage("dashboardPage");
/* ==========================================
   Navigation
========================================== */

document.getElementById("nav-dashboard").onclick=()=>openPage("dashboardPage");

document.getElementById("nav-whatsapp").onclick=()=>openPage("whatsappPage");

document.getElementById("nav-ai").onclick=()=>openPage("aiPage");

document.getElementById("nav-faq").onclick=()=>openPage("faqPage");

document.getElementById("nav-memory").onclick=()=>openPage("memoryPage");

document.getElementById("nav-logs").onclick=()=>openPage("logsPage");

document.getElementById("nav-settings").onclick=()=>openPage("settingsPage");

document.getElementById("nav-about").onclick=()=>openPage("aboutPage");


/* ==========================================
   Save API
========================================== */

const apiKey=document.getElementById("apikey");

const provider=document.getElementById("provider");

const model=document.getElementById("model");

apiKey.value=localStorage.getItem("apiKey")||"";

provider.value=localStorage.getItem("provider")||"openrouter";

model.value=localStorage.getItem("model")||"deepseek/deepseek-chat-v3-0324:free";

document.getElementById("saveApi").onclick=()=>{

localStorage.setItem("apiKey",apiKey.value);

localStorage.setItem("provider",provider.value);

localStorage.setItem("model",model.value);

showToast("API Saved");

};


/* ==========================================
   Prompt
========================================== */

const promptBox=document.getElementById("systemPrompt");

promptBox.value=localStorage.getItem("systemPrompt")||`You are my WhatsApp AI Assistant.

Always reply in the user's language.

Keep replies short.

Be polite.

If you don't know the answer say:
"I don't know."`;

document.getElementById("savePrompt").onclick=()=>{

localStorage.setItem("systemPrompt",promptBox.value);

showToast("Prompt Saved");

};


/* ==========================================
   Settings
========================================== */

document.getElementById("saveSettings").onclick=()=>{

localStorage.setItem("language",

document.getElementById("language").value);

localStorage.setItem("darkMode",

document.getElementById("darkMode").checked);

showToast("Settings Saved");

};


/* ==========================================
   FAQ
========================================== */

document.getElementById("addFaq").onclick=()=>{

showToast("FAQ Feature Coming Soon");

};


/* ==========================================
   Memory
========================================== */

document.getElementById("clearMemory").onclick=()=>{

localStorage.removeItem("memory");

showToast("Memory Cleared");

};


/* ==========================================
   Logs
========================================== */

document.getElementById("clearLogs").onclick=()=>{

localStorage.removeItem("logs");

showToast("Logs Cleared");

};

console.log("WhatsApp AI Assistant Loaded Successfully");
/* ==========================================
   AI Chat Engine
========================================== */

async function sendMessageToAI(message){

    if(!message){

        showToast("Message Empty");

        return;

    }

    showToast("AI Thinking...");

    const reply = await askAI(message);

    if(!reply){

        showToast("No Reply");

        return;

    }

    console.log("User :",message);

    console.log("AI :",reply);

    showToast("Reply Received");

    return reply;

}


/* ==========================================
   Test Button
========================================== */

document.getElementById("start-ai").onclick = async ()=>{

    aiStatus.innerHTML="🟢 Online";

    waStatus.innerHTML="🟢 Connected";

    showToast("Testing AI...");

    const reply = await sendMessageToAI("Hello");

    console.log(reply);

};
