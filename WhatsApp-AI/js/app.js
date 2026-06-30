"use strict";

/* ==========================================
   WhatsApp AI Assistant V6
   app.js - Part 1
========================================== */

/* ---------- DOM ---------- */

const loading=document.getElementById("loading");
const app=document.getElementById("app");

const sidebar=document.getElementById("sidebar");

const menuBtn=document.getElementById("menuBtn");

const searchBtn=document.getElementById("searchBtn");
const themeBtn=document.getElementById("themeBtn");
const settingsBtn=document.getElementById("settingsBtn");

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

},800);

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

/* ---------- Counters ---------- */

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

console.log("App V6 Part 1 Loaded");
/* ==========================================
   WhatsApp AI Assistant V6
   app.js - Part 2
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

darkMode ? "Dark Mode" : "Light Mode"

);

});

/* ---------- Sidebar ---------- */

menuBtn?.addEventListener("click",()=>{

sidebar?.classList.toggle("show");

});

/* ---------- Search ---------- */

searchBtn?.addEventListener("click",()=>{

document.getElementById("messageInput")?.focus();

showToast("Search Ready");

});

/* ---------- Settings ---------- */

settingsBtn?.addEventListener("click",()=>{

if(typeof showPage==="function"){

showPage("settings");

}

});

/* ---------- Start AI ---------- */

const startAI=document.getElementById("start-ai");

startAI?.addEventListener("click",async()=>{

setAIStatus("🟡 Connecting...");

showToast("Connecting Gemini...");

try{

const ok=await testConnection();

if(ok){

setAIStatus("🟢 Gemini Connected");

showToast("Gemini Connected");

}else{

setAIStatus("🔴 Offline");

showToast("Connection Failed");

}

}catch(error){

console.error(error);

setAIStatus("🔴 Error");

showToast("Gemini Error");

}

});

console.log("App V6 Part 2 Loaded");
/* ==========================================
   WhatsApp AI Assistant V6
   app.js - Part 3
========================================== */

/* ---------- Floating Button ---------- */

const fab = document.getElementById("fab");

fab?.addEventListener("click",()=>{

    document.getElementById("messageInput")?.focus();

    showToast("Ready to Chat");

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

/* ---------- Error Handler ---------- */

window.onerror = function(message,source,line,column,error){

    console.error("Application Error:",{

        message,

        source,

        line,

        column,

        error

    });

    return false;

};

/* ---------- Initialize ---------- */

(function(){

    updateCounters();

    setAIStatus("⚪ Ready");

    setWAStatus("⚪ Waiting");

    console.log("WhatsApp AI Assistant V6 Ready");

})();
