"use strict";

/* ==========================================
   Settings Module V3
========================================== */

const apiKeyInput = document.getElementById("apiKey");
const saveApiBtn = document.getElementById("saveApiBtn");

const modelSelect = document.getElementById("modelSelect");
const saveModelBtn = document.getElementById("saveModelBtn");

const temperatureInput = document.getElementById("temperature");
const maxTokensInput = document.getElementById("maxTokens");

const testConnectionBtn = document.getElementById("testConnectionBtn");
const connectionStatus = document.getElementById("connectionStatus");

/* ---------- Load Settings ---------- */

function loadSettings(){

    if(apiKeyInput){

        apiKeyInput.value =
        localStorage.getItem("apiKey") || "";

    }

    if(modelSelect){

        modelSelect.value =
        localStorage.getItem("model") ||
        APP.MODEL;

    }

    if(temperatureInput){

        temperatureInput.value =
        localStorage.getItem("temperature") || "0.7";

    }

    if(maxTokensInput){

        maxTokensInput.value =
        localStorage.getItem("maxTokens") || "1024";

    }

}

/* ---------- Save API ---------- */

saveApiBtn?.addEventListener("click",()=>{

    localStorage.setItem(

        "apiKey",

        apiKeyInput.value.trim()

    );

    showToast("API Key Saved");

});

/* ---------- Save Model ---------- */

saveModelBtn?.addEventListener("click",()=>{

    localStorage.setItem(

        "model",

        modelSelect.value

    );

    showToast("Model Saved");

});

/* ---------- Save Temperature ---------- */

temperatureInput?.addEventListener("change",()=>{

    localStorage.setItem(

        "temperature",

        temperatureInput.value

    );

});

/* ---------- Save Max Tokens ---------- */

maxTokensInput?.addEventListener("change",()=>{

    localStorage.setItem(

        "maxTokens",

        maxTokensInput.value

    );

});

/* ---------- Test Connection ---------- */

testConnectionBtn?.addEventListener(

"click",

async()=>{

connectionStatus.innerHTML="Testing...";

const result=await testConnection();

if(result){

connectionStatus.innerHTML="🟢 Connected";

showToast("AI Connected");

}else{

connectionStatus.innerHTML="🔴 Failed";

showToast("Connection Failed");

}

}

);

loadSettings();

console.log("Settings Module Loaded");
