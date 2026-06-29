/* ==========================================
   WhatsApp AI Assistant
   app.js
========================================== */

"use strict";

/* ========= Splash Screen ========= */

window.addEventListener("load", () => {

    setTimeout(() => {

        document.getElementById("splash-screen").style.display = "none";
        document.getElementById("app").style.display = "block";

    },1500);

});

/* ========= Sidebar ========= */

const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menu-btn");

let sidebarOpen = false;

menuBtn.onclick = () => {

    if(sidebarOpen){

        sidebar.style.left="-260px";
        sidebarOpen=false;

    }else{

        sidebar.style.left="0";
        sidebarOpen=true;

    }

};

/* ========= Toast ========= */

function showToast(message){

    const toast=document.getElementById("toast");

    toast.innerText=message;

    toast.style.display="block";

    setTimeout(()=>{

        toast.style.display="none";

    },2500);

}

/* ========= Status ========= */

const aiStatus=document.getElementById("ai-status");
const waStatus=document.getElementById("wa-status");

document.getElementById("start-ai").onclick=()=>{

    aiStatus.innerHTML="🟢 Online";

    waStatus.innerHTML="🟢 Ready";

    showToast("AI Started");

};

/* ========= Local Storage ========= */

localStorage.setItem("project","WhatsApp AI Assistant");

console.log("Project Loaded");
