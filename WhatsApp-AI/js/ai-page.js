"use strict";

/* ==========================================
   AI Page Module
========================================== */

const currentModel =
document.getElementById("currentModel");

const aiLiveStatus =
document.getElementById("aiLiveStatus");

const reloadModelBtn =
document.getElementById("reloadModelBtn");

const pingAiBtn =
document.getElementById("pingAiBtn");

const clearChatBtn =
document.getElementById("clearChatBtn");

function refreshAIPage(){

currentModel.innerHTML=

localStorage.getItem("model")

||

APP.MODEL;

aiLiveStatus.innerHTML=

document.getElementById("ai-status").innerHTML;

}

reloadModelBtn?.addEventListener(

"click",

()=>{

refreshAIPage();

showToast("Model Reloaded");

}

);

pingAiBtn?.addEventListener(

"click",

async()=>{

showToast("Pinging...");

const ok=

await testConnection();

if(ok){

showToast("AI Online");

}else{

showToast("AI Offline");

}

refreshAIPage();

}

);

clearChatBtn?.addEventListener(

"click",

()=>{

clearChatHistory();

document.getElementById(

"chatContainer"

).innerHTML="";

showToast("Chat Cleared");

}

);

refreshAIPage();

console.log("AI Page Loaded");
