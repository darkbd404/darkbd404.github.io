"use strict";

/* ==========================================
   WhatsApp Page Module
========================================== */

const waConnectionStatus =
document.getElementById("waConnectionStatus");

const waDevice =
document.getElementById("waDevice");

const waQueue =
document.getElementById("waQueue");

const connectWaBtn =
document.getElementById("connectWaBtn");

const disconnectWaBtn =
document.getElementById("disconnectWaBtn");

const refreshWaBtn =
document.getElementById("refreshWaBtn");

function refreshWhatsAppPage(){

    const status = getWhatsAppStatus();

    waConnectionStatus.textContent =
    status.connected ? "🟢 Connected" : "🔴 Disconnected";

    waDevice.textContent =
    status.device || "Unknown";

    waQueue.textContent =
    status.queue;

}

connectWaBtn?.addEventListener("click",()=>{

    connectWhatsApp("Web Demo");

    refreshWhatsAppPage();

    showToast("WhatsApp Connected");

});

disconnectWaBtn?.addEventListener("click",()=>{

    disconnectWhatsApp();

    refreshWhatsAppPage();

    showToast("WhatsApp Disconnected");

});

refreshWaBtn?.addEventListener("click",()=>{

    refreshWhatsAppPage();

    showToast("Status Updated");

});

refreshWhatsAppPage();

console.log("WhatsApp Page Loaded");
