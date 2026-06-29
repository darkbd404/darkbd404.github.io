"use strict";

/* ==========================================
   Logs Page Module
========================================== */

const logsContainer =
document.getElementById("logsContainer");

const exportLogsBtn =
document.getElementById("exportLogsBtn");

const clearLogsBtn =
document.getElementById("clearLogsBtn");

const LOG_KEY="system_logs";

/* ---------- */

function getLogs(){

    return JSON.parse(

        localStorage.getItem(LOG_KEY)

        ||

        "[]"

    );

}

function saveLogs(logs){

    localStorage.setItem(

        LOG_KEY,

        JSON.stringify(logs)

    );

}

function addLog(text){

    const logs=getLogs();

    logs.unshift({

        time:new Date().toLocaleString(),

        text:text

    });

    saveLogs(logs);

}

/* ---------- */

function renderLogs(){

    if(!logsContainer) return;

    const logs=getLogs();

    if(logs.length===0){

        logsContainer.innerHTML="<p>No Logs</p>";

        return;

    }

    logsContainer.innerHTML="";

    logs.forEach(item=>{

        const div=document.createElement("div");

        div.className="log-item";

        div.innerHTML=`

        <b>${item.time}</b>

        <br><br>

        ${item.text}

        `;

        logsContainer.appendChild(div);

    });

}

/* ---------- */

exportLogsBtn?.addEventListener("click",()=>{

    navigator.clipboard.writeText(

        JSON.stringify(getLogs(),null,2)

    );

    showToast("Logs Copied");

});

clearLogsBtn?.addEventListener("click",()=>{

    if(!confirm("Clear all logs?")) return;

    saveLogs([]);

    renderLogs();

    showToast("Logs Cleared");

});

renderLogs();

console.log("Logs Page Loaded");
