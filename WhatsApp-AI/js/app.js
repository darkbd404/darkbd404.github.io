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

const aiStatusElement=document.getElementById("ai-status");
const waStatusElement=document.getElementById("wa-status");

const memoryCounter=document.getElementById("memoryCount");
const faqCounter=document.getElementById("faqCount");

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

if(!toast)return;

toast.textContent=text;

toast.style.display="block";

clearTimeout(window.toastTimer);

window.toastTimer=setTimeout(()=>{

toast.style.display="none";

},2500);

}

/* ---------- Dashboard ---------- */

function updateCounters(){

if(memoryCounter){

memoryCounter.textContent=

getMemory().length+" Chats";

}

if(faqCounter){

faqCounter.textContent=

loadFAQ().length+" Items";

}

}

/* ---------- Status ---------- */

function setAIStatus(text){

if(aiStatusElement){

aiStatusElement.textContent=text;

}

}

function setWAStatus(text){

if(waStatusElement){

waStatusElement.textContent=text;

}

}

console.log("App V6 Stable Part 1 Loaded");
/* ==========================================
   WhatsApp AI Assistant
   Version : V6 Stable
   App Engine - Part 2
========================================== */

/* ---------- Theme ---------- */

let darkMode = localStorage.getItem("theme")==="dark";

if(darkMode){

    document.body.classList.add("dark");

}

themeBtn?.addEventListener("click",()=>{

    darkMode=!darkMode;

    document.body.classList.toggle("dark");

    localStorage.setItem(

        "theme",

        darkMode ? "dark" : "light"

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

    if(typeof window.showPage==="function"){

        window.showPage("settings");

    }

});

/* ---------- Floating Button ---------- */

fab?.addEventListener("click",()=>{

    document.getElementById("messageInput")?.focus();

    showToast("Ready");

});

/* ---------- Start AI ---------- */

const startAI=document.getElementById("start-ai");

startAI?.addEventListener("click",async()=>{

    setAIStatus("🟡 Connecting...");

    try{

        const ok=await testConnection();

        if(ok){

            setAIStatus("🟢 Connected");

            showToast("Gemini Connected");

        }else{

            setAIStatus("🔴 Failed");

            showToast("Connection Failed");

        }

    }

    catch(error){

        console.error(error);

        setAIStatus("🔴 Error");

        showToast("Gemini Error");

    }

});

console.log("App V6 Stable Part 2 Loaded");
/* ==========================================
   WhatsApp AI Assistant
   Version : V6 Stable
   App Engine - Part 3
========================================== */

/* ---------- Auto Refresh ---------- */

function refreshDashboard(){

    updateCounters();

}

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

    if(

        !sidebar.contains(e.target) &&

        !e.target.closest("#menuBtn")

    ){

        sidebar.classList.remove("show");

    }

});

/* ---------- Resize ---------- */

window.addEventListener("resize",()=>{

    if(window.innerWidth>900){

        sidebar?.classList.remove("show");

    }

});

/* ---------- Keyboard Shortcut ---------- */

document.addEventListener("keydown",(e)=>{

    if(e.ctrlKey && e.key.toLowerCase()==="k"){

        e.preventDefault();

        document.getElementById("messageInput")?.focus();

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
