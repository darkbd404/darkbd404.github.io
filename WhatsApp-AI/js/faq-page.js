"use strict";

/* ==========================================
   FAQ Page Module V3
========================================== */

const faqQuestion = document.getElementById("faqQuestion");
const faqAnswer = document.getElementById("faqAnswer");

const addFaqBtn = document.getElementById("addFaqBtn");

const faqList = document.getElementById("faqList");

const exportFaqBtn = document.getElementById("exportFaqBtn");

const clearFaqBtn = document.getElementById("clearFaqBtn");

/* ==========================================
   Render
========================================== */

function renderFAQPage(){

    if(!faqList) return;

    const faq = loadFAQ();

    if(faq.length===0){

        faqList.innerHTML="<p>No FAQ Available</p>";

        return;

    }

    faqList.innerHTML="";

    faq.forEach(item=>{

        const card=document.createElement("div");

        card.className="memory-item";

        card.innerHTML=`

        <h4>${item.question}</h4>

        <p>${item.answer}</p>

        <button class="action-btn"

        onclick="deleteFAQItem(${item.id})">

        Delete

        </button>

        `;

        faqList.appendChild(card);

    });

}

/* ==========================================
   Add
========================================== */

addFaqBtn?.addEventListener("click",()=>{

    const q=faqQuestion.value.trim();

    const a=faqAnswer.value.trim();

    if(!q||!a){

        showToast("Question & Answer Required");

        return;

    }

    if(addFAQ(q,a)){

        faqQuestion.value="";

        faqAnswer.value="";

        renderFAQPage();

        updateCounters();

        showToast("FAQ Added");

    }else{

        showToast("FAQ Already Exists");

    }

});

/* ==========================================
   Delete
========================================== */

function deleteFAQItem(id){

    deleteFAQ(id);

    renderFAQPage();

    updateCounters();

    showToast("FAQ Deleted");

}

/* ==========================================
   Export
========================================== */

exportFaqBtn?.addEventListener("click",()=>{

    const data=exportFAQ();

    navigator.clipboard.writeText(data);

    showToast("FAQ Copied");

});

/* ==========================================
   Clear
========================================== */

clearFaqBtn?.addEventListener("click",()=>{

    if(!confirm("Delete all FAQ?")){

        return;

    }

    clearFAQ();

    renderFAQPage();

    updateCounters();

    showToast("FAQ Cleared");

});

/* ==========================================
   Init
========================================== */

renderFAQPage();

console.log("FAQ Page Module Loaded");
