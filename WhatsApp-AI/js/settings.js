"use strict";

/* ==========================================
   Settings Module V5 (Gemini)
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

/* ---------- Save Gemini API ---------- */

saveApiBtn?.addEventListener("click",()=>{

    const key = apiKeyInput.value.trim();

    if(!key){

        showToast("Enter Gemini API Key");

        return;

    }

    localStorage.setItem("apiKey",key);

    showToast("Gemini API Key Saved");

});

/* ---------- Save Model ---------- */

saveModelBtn?.addEventListener("click",()=>{

    localStorage.setItem(

        "model",

        modelSelect.value

    );

    showToast("Gemini Model Saved");

});

/* ---------- Temperature ---------- */

temperatureInput?.addEventListener("change",()=>{

    localStorage.setItem(

        "temperature",

        temperatureInput.value

    );

});

/* ---------- Max Tokens ---------- */

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

    connectionStatus.textContent="Testing...";

    showToast("Testing Gemini...");

    try{

        const ok = await testConnection();

        if(ok){

            connectionStatus.textContent="🟢 Gemini Connected";

            showToast("Gemini Connected");

        }else{

            connectionStatus.textContent="🔴 Connection Failed";

            showToast("Gemini Connection Failed");

        }

    }catch(error){

        console.error(error);

        connectionStatus.textContent="🔴 Error";

        showToast("Connection Error");

    }

}

);

loadSettings();

console.log("Gemini Settings Loaded");
