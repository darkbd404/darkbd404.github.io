"use strict";

/* ==========================================
   WhatsApp AI Assistant V3
========================================== */

/* ==========================
   DOM
========================== */

const loading = document.getElementById("loading");
const app = document.getElementById("app");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

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

loading.style.display="none";

app.style.display="block";

initApp();

},1500);

});

/* ==========================
   Toast
========================== */

function showToast(text){

toast.textContent=text;

toast.style.display="block";

clearTimeout(window.toastTimer);

window.toastTimer=setTimeout(()=>{

toast.style.display="none";

},2500);

}

/* ==========================
   Theme
========================== */

let darkMode=false;

themeBtn.addEventListener("click",()=>{

darkMode=!darkMode;

document.body.classList.toggle("dark");

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

menuBtn.addEventListener("click",()=>{

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

"280px"

:

"90px";

}

});

/* ==========================
   Counters
========================== */

function updateCounters(){

memoryCount.innerHTML=

getMemory().length+" Chats";

faqCount.innerHTML=

loadFAQ().length+" Items";

}

/* ==========================
   Status
========================== */

function setAIStatus(text){

aiStatus.innerHTML=text;

}

function setWAStatus(text){

waStatus.innerHTML=text;

}

console.log("V3 Part 1 Loaded");
/* ==========================================
   Chat Engine
========================================== */

function addMessage(text, sender = "ai") {

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

async function sendMessage() {

    const message =
        messageInput.value.trim();

    if (!message) {

        showToast("Type a message");

        return;

    }

    addMessage(message, "user");

    messageInput.value = "";

    showToast("AI is thinking...");

    try {

        const reply = await processChat(message);
        if (reply) {

            addMessage(reply, "ai");

            setAIStatus("🟢 Online");

        } else {

            addMessage(
                "No response received.",
                "ai"
            );

        }

    } catch (e) {

        console.error(e);

        addMessage(
            "Connection failed.",
            "ai"
        );

        setAIStatus("🔴 Offline");

    }

    updateCounters();

}

/* ==========================================
   Events
========================================== */

sendBtn.addEventListener(
    "click",
    sendMessage
);

messageInput.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {

            e.preventDefault();

            sendMessage();

        }

    }
);

/* ==========================================
   Navigation
========================================== */

document
.getElementById("nav-dashboard")
.onclick = () => {

    showToast("Dashboard");

};

document
.getElementById("nav-chat")
.onclick = () => {

    messageInput.focus();

};

document
.getElementById("nav-whatsapp")
.onclick = () => {

    showToast("WhatsApp");

};

document
.getElementById("nav-ai")
.onclick = () => {

    showToast("AI Settings");

};

document
.getElementById("nav-faq")
.onclick = () => {

    showToast("FAQ");

};

document
.getElementById("nav-memory")
.onclick = () => {

    showToast("Memory");

};

document
.getElementById("nav-logs")
.onclick = () => {

    showToast("Logs");

};

document
.getElementById("nav-settings")
.onclick = () => {

    showToast("Settings");

};

console.log("V3 Part 2 Loaded");
/* ==========================================
   Bottom Navigation
========================================== */

const bottomDashboard = document.getElementById("bottom-dashboard");
const bottomChat = document.getElementById("bottom-chat");
const bottomWhatsApp = document.getElementById("bottom-whatsapp");
const bottomAI = document.getElementById("bottom-ai");
const bottomSettings = document.getElementById("bottom-settings");

if(bottomDashboard){
    bottomDashboard.onclick = () => {
        showToast("Dashboard");
        window.scrollTo({
            top:0,
            behavior:"smooth"
        });
    };
}

if(bottomChat){
    bottomChat.onclick = () => {
        messageInput.focus();
        showToast("Chat");
    };
}

if(bottomWhatsApp){
    bottomWhatsApp.onclick = () => {
        showToast("WhatsApp");
    };
}

if(bottomAI){
    bottomAI.onclick = async () => {

        showToast("Checking AI...");

        try{

            const result = await askAI("Reply only: OK");

            if(result){

                setAIStatus("🟢 Online");

                showToast("AI Connected");

            }else{

                setAIStatus("🔴 Offline");

            }

        }catch(e){

            console.error(e);

            setAIStatus("🔴 Offline");

        }

    };
}

if(bottomSettings){
    bottomSettings.onclick = () => {
        showToast("Settings");
    };
}

/* ==========================================
   Buttons
========================================== */

if(searchBtn){

    searchBtn.onclick = () => {

        showToast("Search Coming Soon");

    };

}

if(settingsBtn){

    settingsBtn.onclick = () => {

        showToast("Settings Panel");

    };

}

const startBtn = document.getElementById("start-ai");

if(startBtn){

    startBtn.onclick = async()=>{

        showToast("Starting AI...");

        try{

            const reply = await askAI("Hello");

            if(reply){

                setAIStatus("🟢 Online");

                setWAStatus("🟢 Ready");

                showToast("AI Ready");

            }

        }catch(e){

            console.error(e);

            setAIStatus("🔴 Offline");

            showToast("Connection Failed");

        }

    };

}

/* ==========================================
   Restore Theme
========================================== */

const savedTheme = localStorage.getItem("theme");

if(savedTheme === "true"){

    darkMode = true;

    document.body.classList.add("dark");

}

/* ==========================================
   Initialize
========================================== */

function initApp(){

    updateCounters();

    setAIStatus("⚪ Idle");

    setWAStatus("⚪ Waiting");

    addMessage("👋 Welcome to WhatsApp AI Assistant V3.","ai");

}

/* ==========================================
   Resize
========================================== */

window.addEventListener("resize",()=>{

    if(window.innerWidth > 900){

        sidebar.style.display = "block";

    }

});

console.log("WhatsApp AI Assistant V3 Loaded Successfully");
/* ==========================================
   Settings Page V3
========================================== */

const dashboardPage =
document.getElementById("dashboardPage");

const settingsPage =
document.getElementById("settingsPage");

/* ---------- Open Settings ---------- */

function openSettings(){

dashboardPage.style.display="none";

settingsPage.style.display="block";

}

/* ---------- Open Dashboard ---------- */

function openDashboard(){

settingsPage.style.display="none";

dashboardPage.style.display="block";

}

/* ---------- Sidebar ---------- */

document
.getElementById("nav-settings")
.onclick=openSettings;

document
.getElementById("nav-dashboard")
.onclick=openDashboard;

/* ---------- Bottom Navigation ---------- */

const bottomSettingsBtn=
document.getElementById("bottom-settings");

const bottomDashboardBtn=
document.getElementById("bottom-dashboard");

if(bottomSettingsBtn){

bottomSettingsBtn.onclick=openSettings;

}

if(bottomDashboardBtn){

bottomDashboardBtn.onclick=openDashboard;

}

/* ---------- API Key ---------- */

const apiKeyInput=
document.getElementById("apiKey");

const saveApiBtn=
document.getElementById("saveApiBtn");

if(localStorage.getItem("apiKey")){

apiKeyInput.value=

localStorage.getItem("apiKey");

}

saveApiBtn.onclick=()=>{

localStorage.setItem(

"apiKey",

apiKeyInput.value.trim()

);

showToast("API Key Saved");

};

/* ---------- Model ---------- */

const modelSelect=
document.getElementById("modelSelect");

const saveModelBtn=
document.getElementById("saveModelBtn");

const savedModel=

localStorage.getItem("model");

if(savedModel){

modelSelect.value=savedModel;

}

saveModelBtn.onclick=()=>{

localStorage.setItem(

"model",

modelSelect.value

);

showToast("Model Saved");

};

/* ---------- Temperature ---------- */

const temperature=
document.getElementById("temperature");

const maxTokens=
document.getElementById("maxTokens");

temperature.value=

localStorage.getItem("temperature")||

0.7;

maxTokens.value=

localStorage.getItem("maxTokens")||

1024;

temperature.onchange=()=>{

localStorage.setItem(

"temperature",

temperature.value

);

};

maxTokens.onchange=()=>{

localStorage.setItem(

"maxTokens",

maxTokens.value

);

};

/* ---------- Test Connection ---------- */

const testConnectionBtn=
document.getElementById("testConnectionBtn");

const connectionStatus=
document.getElementById("connectionStatus");

testConnectionBtn.onclick=async()=>{

connectionStatus.innerHTML=

"Testing...";

const ok=

await testConnection();

if(ok){

connectionStatus.innerHTML=

"🟢 Connected";

showToast(

"Connection Successful"

);

}else{

connectionStatus.innerHTML=

"🔴 Failed";

showToast(

"Connection Failed"

);

}

};

console.log("Settings Module Loaded");
/* ==========================================
   Navigation System V3
========================================== */

const pages = {
    dashboard: document.getElementById("dashboardPage"),
    settings: document.getElementById("settingsPage"),
    faq: document.getElementById("faqPage"),
    memory: document.getElementById("memoryPage"),
    logs: document.getElementById("logsPage"),
    ai: document.getElementById("aiPage"),
    whatsapp: document.getElementById("whatsappPage")
};

function showPage(pageName){

    Object.values(pages).forEach(page=>{

        if(page){
            page.style.display="none";
        }

    });

    if(pages[pageName]){
        pages[pageName].style.display="block";
    }

}

/* Sidebar */

document.getElementById("nav-dashboard")?.addEventListener("click",()=>showPage("dashboard"));
document.getElementById("nav-settings")?.addEventListener("click",()=>showPage("settings"));
document.getElementById("nav-faq")?.addEventListener("click",()=>showPage("faq"));
document.getElementById("nav-memory")?.addEventListener("click",()=>showPage("memory"));
document.getElementById("nav-logs")?.addEventListener("click",()=>showPage("logs"));
document.getElementById("nav-ai")?.addEventListener("click",()=>showPage("ai"));
document.getElementById("nav-whatsapp")?.addEventListener("click",()=>showPage("whatsapp"));

/* Bottom Navigation */

document.getElementById("bottom-dashboard")?.addEventListener("click",()=>showPage("dashboard"));
document.getElementById("bottom-settings")?.addEventListener("click",()=>showPage("settings"));
document.getElementById("bottom-ai")?.addEventListener("click",()=>showPage("ai"));
document.getElementById("bottom-whatsapp")?.addEventListener("click",()=>showPage("whatsapp"));

showPage("dashboard");
/* ==========================================
   FAQ Page V3
========================================== */

const faqQuestion = document.getElementById("faqQuestion");
const faqAnswer = document.getElementById("faqAnswer");
const addFaqBtn = document.getElementById("addFaqBtn");
const faqList = document.getElementById("faqList");
const exportFaqBtn = document.getElementById("exportFaqBtn");
const clearFaqBtn = document.getElementById("clearFaqBtn");

function renderFAQList(){

    if(!faqList) return;

    const data = loadFAQ();

    if(data.length===0){

        faqList.innerHTML="<p>No FAQ Added</p>";

        return;

    }

    faqList.innerHTML="";

    data.forEach(item=>{

        const div=document.createElement("div");

        div.className="setting-card";

        div.innerHTML=`
            <h4>${item.question}</h4>
            <p>${item.answer}</p>
            <button onclick="removeFAQ(${item.id})">
                Delete
            </button>
        `;

        faqList.appendChild(div);

    });

}

function removeFAQ(id){

    deleteFAQ(id);

    renderFAQList();

    updateCounters();

    showToast("FAQ Deleted");

}

if(addFaqBtn){

    addFaqBtn.onclick=()=>{

        const q=faqQuestion.value.trim();

        const a=faqAnswer.value.trim();

        if(!q || !a){

            showToast("Question and Answer required");

            return;

        }

        if(addFAQ(q,a)){

            faqQuestion.value="";
            faqAnswer.value="";

            renderFAQList();

            updateCounters();

            showToast("FAQ Added");

        }else{

            showToast("FAQ already exists");

        }

    };

}

if(exportFaqBtn){

    exportFaqBtn.onclick=()=>{

        const data=exportFAQ();

        navigator.clipboard.writeText(data);

        showToast("FAQ copied to clipboard");

    };

}

if(clearFaqBtn){

    clearFaqBtn.onclick=()=>{

        if(confirm("Delete all FAQ?")){

            clearFAQ();

            renderFAQList();

            updateCounters();

            showToast("All FAQ Deleted");

        }

    };

}

renderFAQList();

console.log("FAQ Page Loaded");
