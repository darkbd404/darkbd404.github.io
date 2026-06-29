"use strict";

/* ==========================================
   WhatsApp AI Assistant V2
========================================== */

/* ---------- Elements ---------- */

const loading = document.getElementById("loading");
const app = document.getElementById("app");

const sidebar = document.querySelector(".sidebar");

const themeBtn = document.getElementById("themeBtn");

const sendBtn = document.getElementById("sendBtn");

const messageInput = document.getElementById("messageInput");

const chatContainer = document.getElementById("chatContainer");

const aiStatus = document.getElementById("ai-status");

const waStatus = document.getElementById("wa-status");

const memoryCount = document.getElementById("memoryCount");

const faqCount = document.getElementById("faqCount");


/* ---------- Loading ---------- */

window.addEventListener("load",()=>{

setTimeout(()=>{

loading.style.display="none";

app.style.display="block";

updateCounters();

},1200);

});


/* ---------- Toast ---------- */

function showToast(message){

const toast=document.getElementById("toast");

toast.innerHTML=message;

toast.style.display="block";

setTimeout(()=>{

toast.style.display="none";

},2500);

}


/* ---------- Theme ---------- */

let darkMode=false;

themeBtn.onclick=()=>{

darkMode=!darkMode;

document.body.classList.toggle("dark",darkMode);

showToast(

darkMode?

"Dark Mode Enabled"

:

"Light Mode Enabled"

);

};


/* ---------- Status ---------- */

function setAIStatus(status){

aiStatus.innerHTML=status;

}

function setWAStatus(status){

waStatus.innerHTML=status;

}


/* ---------- Counters ---------- */

function updateCounters(){

memoryCount.innerHTML=

getMemory().length+" Chats";

faqCount.innerHTML=

loadFAQ().length+" Items";

}


/* ---------- Chat Bubble ---------- */

function addBubble(text,type){

const wrapper=document.createElement("div");

wrapper.className=

type==="user"

?

"user-message"

:

"ai-message";

const bubble=document.createElement("div");

bubble.className="bubble";

bubble.innerHTML=text;

wrapper.appendChild(bubble);

chatContainer.appendChild(wrapper);

chatContainer.scrollTop=

chatContainer.scrollHeight;

}


/* ---------- AI Chat ---------- */

async function sendMessage(){

const text=

messageInput.value.trim();

if(text==="") return;

addBubble(text,"user");

messageInput.value="";

showToast("Thinking...");

const reply=

await askAI(text);

if(reply){

addBubble(reply,"ai");

showToast("Reply Received");

updateCounters();

}else{

addBubble(

"Unable to get reply.",

"ai"

);

}

}


/* ---------- Events ---------- */

sendBtn.onclick=sendMessage;

messageInput.addEventListener(

"keypress",

function(e){

if(e.key==="Enter"){

e.preventDefault();

sendMessage();

}

}

);


/* ---------- Test ---------- */

document.getElementById("start-ai").onclick=()=>{

setAIStatus("🟢 Online");

setWAStatus("🟢 Connected");

showToast("AI Ready");

};

console.log("App Part 1 Loaded");
/* ==========================================
   Navigation
========================================== */

const pages = {

dashboard:document.getElementById("dashboardPage")

};

function openPage(page){

Object.values(pages).forEach(item=>{

if(item){

item.style.display="none";

}

});

if(pages[page]){

pages[page].style.display="block";

}

}

/* ==========================================
   Sidebar Navigation
========================================== */

document.getElementById("nav-dashboard").onclick=()=>{

openPage("dashboard");

};

document.getElementById("nav-chat").onclick=()=>{

messageInput.focus();

};

document.getElementById("nav-whatsapp").onclick=()=>{

showToast("WhatsApp Module");

};

document.getElementById("nav-ai").onclick=()=>{

showToast("AI Settings");

};

document.getElementById("nav-faq").onclick=()=>{

showToast("FAQ Manager");

};

document.getElementById("nav-memory").onclick=()=>{

showToast("Memory");

};

document.getElementById("nav-logs").onclick=()=>{

showToast("Logs");

};

document.getElementById("nav-settings").onclick=()=>{

showToast("Settings");

};

/* ==========================================
   Bottom Navigation
========================================== */

const bottomDashboard=

document.getElementById("bottom-dashboard");

const bottomChat=

document.getElementById("bottom-chat");

const bottomAI=

document.getElementById("bottom-ai");

const bottomSettings=

document.getElementById("bottom-settings");

if(bottomDashboard){

bottomDashboard.onclick=()=>{

openPage("dashboard");

};

}

if(bottomChat){

bottomChat.onclick=()=>{

messageInput.focus();

};

}

if(bottomAI){

bottomAI.onclick=()=>{

showToast("AI Panel");

};

}

if(bottomSettings){

bottomSettings.onclick=()=>{

showToast("Settings");

};

}

/* ==========================================
   Restore Previous Chat
========================================== */

const previousMemory=getMemory();

previousMemory.forEach(item=>{

addBubble(item.user,"user");

addBubble(item.assistant,"ai");

});

/* ==========================================
   Theme Restore
========================================== */

const savedTheme=

localStorage.getItem("theme");

if(savedTheme==="dark"){

darkMode=true;

document.body.classList.add("dark");

}

themeBtn.onclick=()=>{

darkMode=!darkMode;

document.body.classList.toggle("dark");

localStorage.setItem(

"theme",

darkMode?"dark":"light"

);

showToast(

darkMode?

"Dark Mode Enabled"

:

"Light Mode Enabled"

);

};

/* ==========================================
   Initialize
========================================== */

updateCounters();

openPage("dashboard");

console.log("App Part 2 Loaded");
/* ==========================================
   Live AI Connection
========================================== */

async function checkAIConnection(){

    const key = localStorage.getItem("apiKey");

    if(!key){

        setAIStatus("🔴 API Key Missing");

        return false;

    }

    try{

        const reply = await askAI("Reply with only OK");

        if(reply){

            setAIStatus("🟢 Online");

            showToast("AI Connected");

            return true;

        }

    }catch(e){

        console.error(e);

    }

    setAIStatus("🔴 Offline");

    showToast("AI Connection Failed");

    return false;

}


/* ==========================================
   WhatsApp Engine
========================================== */

function updateWhatsAppStatus(){

    if(typeof WhatsAppEngine==="undefined"){

        setWAStatus("⚪ Not Loaded");

        return;

    }

    const state = WhatsAppEngine.status();

    if(state.connected){

        setWAStatus("🟢 Connected");

    }else{

        setWAStatus("🔴 Disconnected");

    }

}


/* ==========================================
   Auto Reply
========================================== */

let autoReply=false;

function toggleAutoReply(){

    autoReply=!autoReply;

    localStorage.setItem(

        "autoReply",

        autoReply

    );

    showToast(

        autoReply

        ?

        "Auto Reply Enabled"

        :

        "Auto Reply Disabled"

    );

}

const savedAutoReply=

localStorage.getItem("autoReply");

if(savedAutoReply==="true"){

    autoReply=true;

}


/* ==========================================
   Test Message
========================================== */

async function runSelfTest(){

    console.log("Running Self Test...");

    await checkAIConnection();

    updateWhatsAppStatus();

    updateCounters();

    console.log("Self Test Finished");

}


/* ==========================================
   Start AI Button
========================================== */

document.getElementById("start-ai").onclick=async()=>{

    showToast("Starting AI...");

    const ok=await checkAIConnection();

    if(!ok){

        return;

    }

    if(typeof WhatsAppEngine!=="undefined"){

        WhatsAppEngine.connect("Demo");

    }

    updateWhatsAppStatus();

};


/* ==========================================
   App Ready
========================================== */

window.addEventListener("load",()=>{

    setTimeout(()=>{

        runSelfTest();

    },1800);

});

console.log("WhatsApp AI Assistant V2 Ready");
