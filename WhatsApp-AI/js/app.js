/* ==========================================
   WhatsApp AI Assistant V5
   app.js - Part 2
========================================== */

/* ---------- Search ---------- */

searchBtn?.addEventListener("click",()=>{

    const input=document.getElementById("messageInput");

    if(input){

        input.focus();

    }

    showToast("Search Ready");

});

/* ---------- Settings ---------- */

settingsBtn?.addEventListener("click",()=>{

    if(typeof showPage==="function"){

        showPage("settings");

    }

});

/* ---------- Floating Button ---------- */

const fab=document.getElementById("fab");

fab?.addEventListener("click",()=>{

    document.getElementById("messageInput")?.focus();

    showToast("Ready to Chat");

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

    }catch(e){

        console.error(e);

        setAIStatus("🔴 Error");

        showToast("Gemini Error");

    }

});

/* ---------- Restore Theme ---------- */

if(localStorage.getItem("theme")==="dark"){

    document.body.classList.add("dark");

}

/* ---------- Refresh Dashboard ---------- */

function refreshDashboard(){

    updateCounters();

}

/* ---------- Auto Refresh ---------- */

setInterval(()=>{

    refreshDashboard();

},5000);

console.log("App V5 Part 2 Loaded");
