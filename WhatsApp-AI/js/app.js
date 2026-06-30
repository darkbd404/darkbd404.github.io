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
/* ==========================================
   WhatsApp AI Assistant V5
   app.js - Part 3
========================================== */

/* ---------- Sidebar ---------- */

const menuBtn=document.getElementById("menuBtn");

menuBtn?.addEventListener("click",()=>{

    if(!sidebar) return;

    sidebar.classList.toggle("show");

});

/* ---------- Close Sidebar ---------- */

document.addEventListener("click",(e)=>{

    if(window.innerWidth>900) return;

    if(!sidebar) return;

    const clickInsideSidebar=sidebar.contains(e.target);

    const clickMenu=e.target.closest("#menuBtn");

    if(!clickInsideSidebar && !clickMenu){

        sidebar.classList.remove("show");

    }

});

/* ---------- Window Resize ---------- */

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

        showToast("Search Ready");

    }

});

/* ---------- Online / Offline ---------- */

window.addEventListener("online",()=>{

    showToast("Internet Connected");

});

window.addEventListener("offline",()=>{

    showToast("Internet Disconnected");

});

/* ---------- Global ---------- */

window.showToast=showToast;
window.setAIStatus=setAIStatus;
window.setWAStatus=setWAStatus;
window.updateCounters=updateCounters;

/* ---------- Error Handler ---------- */

window.onerror=function(msg,url,line){

    console.error("App Error:",msg);

    return false;

};

console.log("App V5 Part 3 Loaded");
