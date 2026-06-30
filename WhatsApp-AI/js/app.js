"use strict";

/* ==========================================
   WhatsApp AI Assistant V5 (Gemini)
   app.js - Part 1
========================================== */

/* ---------- Elements ---------- */

const loading = document.getElementById("loading");
const app = document.getElementById("app");

const sidebar = document.querySelector(".sidebar");

const themeBtn = document.getElementById("themeBtn");
const settingsBtn = document.getElementById("settingsBtn");
const searchBtn = document.getElementById("searchBtn");

const aiStatus = document.getElementById("ai-status");
const waStatus = document.getElementById("wa-status");

const memoryCount = document.getElementById("memoryCount");
const faqCount = document.getElementById("faqCount");

const toast = document.getElementById("toast");

/* ---------- Loading ---------- */

window.addEventListener("load",()=>{

setTimeout(()=>{

if(loading){

loading.style.display="none";

}

if(app){

app.style.display="block";

}

initializeApp();

},1000);

});

/* ---------- Toast ---------- */

function showToast(message){

if(!toast) return;

toast.textContent=message;

toast.style.display="block";

clearTimeout(window.toastTimer);

window.toastTimer=setTimeout(()=>{

toast.style.display="none";

},2500);

}

/* ---------- Theme ---------- */

let darkMode=

localStorage.getItem("theme")==="dark";

if(darkMode){

document.body.classList.add("dark");

}

themeBtn?.addEventListener("click",()=>{

darkMode=!darkMode;

document.body.classList.toggle("dark");

localStorage.setItem(

"theme",

darkMode?"dark":"light"

);

showToast(

darkMode

?

"Dark Mode"

:

"Light Mode"

);

});

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

/* ---------- Counter ---------- */

function updateCounters(){

if(typeof getMemory==="function"){

memoryCount.textContent=

getMemory().length+" Chats";

}

if(typeof loadFAQ==="function"){

faqCount.textContent=

loadFAQ().length+" Items";

}

}

/* ---------- Initialize ---------- */

function initializeApp(){

updateCounters();

setAIStatus("🟢 Gemini Ready");

setWAStatus("⚪ Waiting");

}

console.log("App V5 Part 1 Loaded");
