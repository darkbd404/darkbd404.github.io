"use strict";

/* ===========================
   WhatsApp AI Assistant
   app.js
=========================== */

window.addEventListener("load", () => {

    setTimeout(() => {

        document.getElementById("splash-screen").style.display = "none";
        document.getElementById("app").style.display = "block";

    }, 1500);

});

/* ===========================
   Sidebar
=========================== */

const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menu-btn");

let sidebarOpen = false;

menuBtn.addEventListener("click", () => {

    sidebarOpen = !sidebarOpen;

    sidebar.style.left = sidebarOpen ? "0" : "-280px";

});

/* ===========================
   Toast
=========================== */

function showToast(message){

    const toast = document.getElementById("toast");

    toast.innerHTML = message;

    toast.style.display = "block";

    setTimeout(() => {

        toast.style.display = "none";

    },2500);

}

/* ===========================
   Status
=========================== */

const aiStatus = document.getElementById("ai-status");
const waStatus = document.getElementById("wa-status");

function setAIStatus(status){

    aiStatus.innerHTML = status;

}

function setWAStatus(status){

    waStatus.innerHTML = status;

}

/* ===========================
   Pages
=========================== */

const pages = [

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

/* ===========================
   Navigation
=========================== */

document.getElementById("nav-dashboard").onclick=()=>openPage("dashboardPage");

document.getElementById("nav-whatsapp").onclick=()=>openPage("whatsappPage");

document.getElementById("nav-ai").onclick=()=>openPage("aiPage");

document.getElementById("nav-faq").onclick=()=>openPage("faqPage");

document.getElementById("nav-memory").onclick=()=>openPage("memoryPage");

document.getElementById("nav-logs").onclick=()=>openPage("logsPage");

document.getElementById("nav-settings").onclick=()=>openPage("settingsPage");

document.getElementById("nav-about").onclick=()=>openPage("aboutPage");

openPage("dashboardPage");
/* ===========================
   API Configuration
=========================== */

const apiKeyInput = document.getElementById("apikey");
const providerInput = document.getElementById("provider");
const modelInput = document.getElementById("model");

function loadApiSettings(){

    apiKeyInput.value =
        localStorage.getItem("apiKey") || "";

    providerInput.value =
        localStorage.getItem("provider") || "openrouter";

    modelInput.value =
        localStorage.getItem("model") ||
        APP_CONFIG.defaultModel;

}

function saveApiSettings(){

    localStorage.setItem(
        "apiKey",
        apiKeyInput.value.trim()
    );

    localStorage.setItem(
        "provider",
        providerInput.value
    );

    localStorage.setItem(
        "model",
        modelInput.value
    );

    showToast("API Saved");

}

document
.getElementById("saveApi")
.onclick = saveApiSettings;

loadApiSettings();

/* ===========================
   Prompt
=========================== */

const promptBox =
document.getElementById("systemPrompt");

function loadPrompt(){

    promptBox.value =
        localStorage.getItem("systemPrompt") ||

`You are my WhatsApp AI Assistant.

Always reply in the user's language.

Keep replies short.

If you don't know the answer say:

I don't know.`;

}

function savePrompt(){

    localStorage.setItem(

        "systemPrompt",

        promptBox.value

    );

    showToast("Prompt Saved");

}

document
.getElementById("savePrompt")
.onclick = savePrompt;

loadPrompt();

/* ===========================
   Start AI
=========================== */

document
.getElementById("start-ai")
.onclick = async()=>{

    setAIStatus("🟢 Online");

    setWAStatus("🟢 Ready");

    showToast("Testing AI...");

    const reply =
    await askAI("Hello");

    if(reply){

        console.log(reply);

        showToast("AI Connected");

    }else{

        showToast("Connection Failed");

    }

};
/* ==========================================
   FAQ
========================================== */

const faqQuestion = document.getElementById("faqQuestion");
const faqAnswer = document.getElementById("faqAnswer");
const faqList = document.getElementById("faqList");

function renderFAQ(){

    const list = loadFAQ();

    if(list.length===0){

        faqList.innerHTML="No FAQ Added";

        return;

    }

    faqList.innerHTML="";

    list.forEach(item=>{

        faqList.innerHTML+=`

        <div class="card">

            <b>${item.question}</b>

            <p>${item.answer}</p>

        </div>

        `;

    });

}

document.getElementById("addFaq").onclick=()=>{

    const q=faqQuestion.value.trim();

    const a=faqAnswer.value.trim();

    if(!q || !a){

        showToast("Fill all fields");

        return;

    }

    addFAQ(q,a);

    faqQuestion.value="";

    faqAnswer.value="";

    renderFAQ();

    showToast("FAQ Added");

};

renderFAQ();

/* ==========================================
   Memory
========================================== */

const memoryList=document.getElementById("memoryList");

function renderMemory(){

    const memory=getMemory();

    if(memory.length===0){

        memoryList.innerHTML="No Memory";

        return;

    }

    memoryList.innerHTML="";

    memory.forEach(item=>{

        memoryList.innerHTML+=`

        <div class="card">

            <b>User:</b>

            <p>${item.user}</p>

            <b>AI:</b>

            <p>${item.assistant}</p>

        </div>

        `;

    });

}

document.getElementById("clearMemory").onclick=()=>{

    clearMemory();

    renderMemory();

    showToast("Memory Cleared");

};

renderMemory();

/* ==========================================
   Logs
========================================== */

const logs=document.getElementById("logs");

logs.innerHTML="System Ready";

document.getElementById("clearLogs").onclick=()=>{

    logs.innerHTML="Logs Cleared";

    showToast("Logs Cleared");

};

/* ==========================================
   Settings
========================================== */

document.getElementById("saveSettings").onclick=()=>{

    APP_CONFIG.language=document.getElementById("language").value;

    APP_CONFIG.darkMode=document.getElementById("darkMode").checked;

    saveConfig();

    showToast("Settings Saved");

};

/* ==========================================
   Finish
========================================== */

console.log("WhatsApp AI Assistant Loaded");

showToast("Application Ready");
