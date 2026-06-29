"use strict";

/* ==========================================
   Navigation Module V3
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

function showPage(page){

Object.values(pages).forEach(item=>{

if(item){

item.style.display="none";

}

});

if(pages[page]){

pages[page].style.display="block";

}

}

/* ==========================
   Sidebar
========================== */

document.getElementById("nav-dashboard")?.addEventListener(

"click",

()=>showPage("dashboard")

);

document.getElementById("nav-chat")?.addEventListener(

"click",

()=>{

document.getElementById("messageInput")?.focus();

showPage("dashboard");

}

);

document.getElementById("nav-whatsapp")?.addEventListener(

"click",

()=>showPage("whatsapp")

);

document.getElementById("nav-ai")?.addEventListener(

"click",

()=>showPage("ai")

);

document.getElementById("nav-faq")?.addEventListener(

"click",

()=>showPage("faq")

);

document.getElementById("nav-memory")?.addEventListener(

"click",

()=>showPage("memory")

);

document.getElementById("nav-logs")?.addEventListener(

"click",

()=>showPage("logs")

);

document.getElementById("nav-settings")?.addEventListener(

"click",

()=>showPage("settings")

);

/* ==========================
   Bottom Navigation
========================== */

document.getElementById("bottom-dashboard")?.addEventListener(

"click",

()=>showPage("dashboard")

);

document.getElementById("bottom-chat")?.addEventListener(

"click",

()=>{

document.getElementById("messageInput")?.focus();

showPage("dashboard");

}

);

document.getElementById("bottom-whatsapp")?.addEventListener(

"click",

()=>showPage("whatsapp")

);

document.getElementById("bottom-ai")?.addEventListener(

"click",

()=>showPage("ai")

);

document.getElementById("bottom-settings")?.addEventListener(

"click",

()=>showPage("settings")

);

/* ==========================
   Default
========================== */

showPage("dashboard");

console.log("Navigation Module Loaded");
