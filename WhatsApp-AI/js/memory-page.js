"use strict";

/* ==========================================
   Memory Page Module V3
========================================== */

const memoryList =
document.getElementById("memoryList");

const memorySearch =
document.getElementById("memorySearch");

const exportMemoryBtn =
document.getElementById("exportMemoryBtn");

const importMemoryBtn =
document.getElementById("importMemoryBtn");

const clearMemoryBtn =
document.getElementById("clearMemoryBtn");

const memoryImportBox =
document.getElementById("memoryImportBox");

/* ==========================================
   Render
========================================== */

function renderMemoryPage(filter=""){

    if(!memoryList) return;

    const data = getMemory();

    memoryList.innerHTML="";

    const result = data.filter(item=>{

        const text=(item.user+" "+item.assistant).toLowerCase();

        return text.includes(filter.toLowerCase());

    });

    if(result.length===0){

        memoryList.innerHTML="<p>No Memory Found</p>";

        return;

    }

    result.reverse().forEach(item=>{

        const card=document.createElement("div");

        card.className="memory-item";

        card.innerHTML=`

        <h4>${item.time}</h4>

        <p><b>User:</b> ${item.user}</p>

        <p><b>AI:</b> ${item.assistant}</p>

        `;

        memoryList.appendChild(card);

    });

}

/* ==========================================
   Search
========================================== */

memorySearch?.addEventListener("input",()=>{

    renderMemoryPage(

        memorySearch.value

    );

});

/* ==========================================
   Export
========================================== */

exportMemoryBtn?.addEventListener("click",()=>{

    const data=exportMemory();

    navigator.clipboard.writeText(data);

    showToast("Memory Copied");

});

/* ==========================================
   Import
========================================== */

importMemoryBtn?.addEventListener("click",()=>{

    const ok=

    importMemory(

        memoryImportBox.value

    );

    if(ok){

        renderMemoryPage();

        updateCounters();

        showToast("Memory Imported");

    }else{

        showToast("Invalid JSON");

    }

});

/* ==========================================
   Clear
========================================== */

clearMemoryBtn?.addEventListener("click",()=>{

    if(!confirm("Delete all Memory?")){

        return;

    }

    clearMemory();

    renderMemoryPage();

    updateCounters();

    showToast("Memory Cleared");

});

/* ==========================================
   Init
========================================== */

renderMemoryPage();

console.log("Memory Page Module Loaded");
