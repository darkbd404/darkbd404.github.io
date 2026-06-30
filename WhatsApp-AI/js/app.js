"use strict";

/* ==========================================
   WhatsApp AI Assistant
   Version : V6 Stable
   App Engine
========================================== */

/* ---------- DOM ---------- */

const loading=document.getElementById("loading");
const app=document.getElementById("app");

const sidebar=document.getElementById("sidebar");

const menuBtn=document.getElementById("menuBtn");

const searchBtn=document.getElementById("searchBtn");

const themeBtn=document.getElementById("themeBtn");

const settingsBtn=document.getElementById("settingsBtn");

const fab=document.getElementById("fab");

const toast=document.getElementById("toast");

const aiStatus=document.getElementById("ai-status");

const waStatus=document.getElementById("wa-status");

const memoryCount=document.getElementById("memoryCount");

const faqCount=document.getElementById("faqCount");

/* ---------- Loading ---------- */

window.addEventListener("load",()=>{

setTimeout(()=>{

if(loading){

loading.style.display="none";

}

if(app){

app.style.display="block";

}

updateCounters();

},700);

});

/* ---------- Toast ---------- */

function showToast(text){

if(!toast) return;

toast.textContent=text;

toast.style.display="block";

clearTimeout(window.toastTimer);

window.toastTimer=setTimeout(()=>{

toast.style.display="none";

},2500);

}

/* ---------- Dashboard ---------- */

function updateCounters(){

if(memoryCount){

memoryCount.textContent=

memoryCountValue()+" Chats";

}

if(faqCount){

faqCount.textContent=

faqCount()+" Items";

}

}

/* ---------- Status ---------- */

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

console.log("App V6 Stable Part 1 Loaded");
/* ==========================================
   WhatsApp AI Assistant
   Version : V6 Stable
   App Engine - Part 2
========================================== */

/* ---------- Fix Dashboard Counter ---------- */

const faqCounterElement = document.getElementById("faqCount");
const memoryCounterElement = document.getElementById("memoryCount");

function updateCounters(){

    if(memoryCounterElement){

        memoryCounterElement.textContent =
        getMemory().length + " Chats";

    }

    if(faqCounterElement){

        faqCounterElement.textContent =
        loadFAQ().length + " Items";

    }

}

/* ---------- Theme ---------- */

let darkMode =
localStorage.getItem("theme")==="dark";

if(darkMode){

    document.body.classList.add("dark");

}

themeBtn?.addEventListener("click",()=>{

    darkMode=!darkMode;

    document.body.classList.toggle("dark");

    localStorage.setItem(

        "theme",

        darkMode ? "dark":"light"

    );

    showToast(

        darkMode

        ? "Dark Mode Enabled"

        : "Light Mode Enabled"

    );

});

/* ---------- Sidebar ---------- */

menuBtn?.addEventListener("click",()=>{

    sidebar?.classList.toggle("show");

});

/* ---------- Search ---------- */

searchBtn?.addEventListener("click",()=>{

    document.getElementById("messageInput")?.focus();

});

/* ---------- Settings ---------- */

settingsBtn?.addEventListener("click",()=>{

    if(window.showPage){

        window.showPage("settings");

    }

});

/* ---------- Floating Button ---------- */

fab?.addEventListener("click",()=>{

    document.getElementById("messageInput")?.focus();

    showToast("Ready");

});

console.log("App V6 Stable Part 2 Loaded");
/* ==========================================
   WhatsApp AI Assistant
   Version : V6 Stable
   App Engine - Part 3
========================================== */

/* ---------- Start AI ---------- */

const startAI = document.getElementById("start-ai");

startAI?.addEventListener("click", async()=>{

    setAIStatus("🟡 Connecting...");

    showToast("Connecting Gemini...");

    try{

        const ok = await testConnection();

        if(ok){

            setAIStatus("🟢 Connected");

            showToast("Gemini Connected");

        }else{

            setAIStatus("🔴 Failed");

            showToast("Connection Failed");

        }

    }catch(error){

        console.error(error);

        setAIStatus("🔴 Error");

        showToast("Gemini Error");

    }

});

/* ---------- Refresh Dashboard ---------- */

function refreshDashboard(){

    updateCounters();

}

/* ---------- Auto Refresh ---------- */

setInterval(refreshDashboard,5000);

/* ---------- Online / Offline ---------- */

window.addEventListener("online",()=>{

    setAIStatus("🟢 Online");

    showToast("Internet Connected");

});

window.addEventListener("offline",()=>{

    setAIStatus("🔴 Offline");

    showToast("Internet Disconnected");

});

/* ---------- Close Sidebar ---------- */

document.addEventListener("click",(e)=>{

    if(window.innerWidth>900){

        return;

    }

    if(!sidebar){

        return;

    }

    const insideSidebar = sidebar.contains(e.target);

    const menuClicked = e.target.closest("#menuBtn");

    if(!insideSidebar && !menuClicked){

        sidebar.classList.remove("show");

    }

});

/* ---------- Resize ---------- */

window.addEventListener("resize",()=>{

    if(window.innerWidth>900){

        sidebar?.classList.remove("show");

    }

});

/* ---------- Global ---------- */

window.showToast = showToast;
window.updateCounters = updateCounters;
window.setAIStatus = setAIStatus;
window.setWAStatus = setWAStatus;

/* ---------- Initialize ---------- */

updateCounters();

setAIStatus("⚪ Ready");

setWAStatus("⚪ Waiting");

console.log("WhatsApp AI Assistant V6 Stable Ready");
