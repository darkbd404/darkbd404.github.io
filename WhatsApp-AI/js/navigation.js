"use strict";

/* ==========================================
   Navigation Module V5
========================================== */

const pages = {

dashboard:document.getElementById("dashboardPage"),

settings:document.getElementById("settingsPage"),

faq:document.getElementById("faqPage"),

memory:document.getElementById("memoryPage"),

logs:document.getElementById("logsPage"),

ai:document.getElementById("aiPage"),

whatsapp:document.getElementById("whatsappPage")

};

/* ==========================================
   Show Page
========================================== */

function showPage(page){

Object.values(pages).forEach(p=>{

if(p){

p.style.display="none";

}

});

if(pages[page]){

pages[page].style.display="block";

}

if(window.innerWidth<=900){

document.getElementById("sidebar")

?.classList.remove("show");

}

window.scrollTo({

top:0,

behavior:"smooth"

});

}

/* ==========================================
   Sidebar
========================================== */

document.getElementById("nav-dashboard")?.addEventListener("click",()=>{

showPage("dashboard");

});

document.getElementById("nav-chat")?.addEventListener("click",()=>{

showPage("dashboard");

document.getElementById("messageInput")?.focus();

});

document.getElementById("nav-whatsapp")?.addEventListener("click",()=>{

showPage("whatsapp");

});

document.getElementById("nav-ai")?.addEventListener("click",()=>{

showPage("ai");

});

document.getElementById("nav-faq")?.addEventListener("click",()=>{

showPage("faq");

});

document.getElementById("nav-memory")?.addEventListener("click",()=>{

showPage("memory");

});

document.getElementById("nav-logs")?.addEventListener("click",()=>{

showPage("logs");

});

document.getElementById("nav-settings")?.addEventListener("click",()=>{

showPage("settings");

});

/* ==========================================
   Bottom Navigation
========================================== */

document.getElementById("bottom-dashboard")?.addEventListener("click",()=>{

showPage("dashboard");

});

document.getElementById("bottom-chat")?.addEventListener("click",()=>{

showPage("dashboard");

document.getElementById("messageInput")?.focus();

});

document.getElementById("bottom-whatsapp")?.addEventListener("click",()=>{

showPage("whatsapp");

});

document.getElementById("bottom-ai")?.addEventListener("click",()=>{

showPage("ai");

});

document.getElementById("bottom-settings")?.addEventListener("click",()=>{

showPage("settings");

});

/* ==========================================
   Quick Action Buttons
========================================== */

document.getElementById("quickWhatsapp")?.addEventListener("click",()=>{

showPage("whatsapp");

});

document.getElementById("quickFaq")?.addEventListener("click",()=>{

showPage("faq");

});

document.getElementById("quickMemory")?.addEventListener("click",()=>{

showPage("memory");

});

/* ==========================================
   Default
========================================== */

showPage("dashboard");

console.log("Navigation Module V5 Loaded");
