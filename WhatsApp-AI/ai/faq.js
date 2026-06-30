"use strict";

/* ==========================================
   FAQ Engine V5 (Gemini)
========================================== */

const FAQ_KEY = "gemini_faq_v5";

/* ---------- Load ---------- */

function loadFAQ(){

    try{

        const data = localStorage.getItem(FAQ_KEY);

        if(!data){

            return [];

        }

        return JSON.parse(data);

    }

    catch(error){

        console.error(error);

        return [];

    }

}

/* ---------- Save ---------- */

function saveFAQ(faq){

    localStorage.setItem(

        FAQ_KEY,

        JSON.stringify(faq)

    );

}

/* ---------- Add ---------- */

function addFAQ(question,answer){

    question = question.trim();

    answer = answer.trim();

    if(!question || !answer){

        return false;

    }

    const faq = loadFAQ();

    const exists = faq.find(item=>

        item.question.toLowerCase()===question.toLowerCase()

    );

    if(exists){

        return false;

    }

    faq.push({

        id:crypto.randomUUID(),

        question,

        answer,

        created:new Date().toLocaleString()

    });

    saveFAQ(faq);

    if(typeof updateCounters==="function"){

        updateCounters();

    }

    return true;

}

/* ---------- Delete ---------- */

function deleteFAQ(id){

    const faq = loadFAQ()

    .filter(item=>item.id!==id);

    saveFAQ(faq);

    if(typeof updateCounters==="function"){

        updateCounters();

    }

}

/* ---------- Clear ---------- */

function clearFAQ(){

    localStorage.removeItem(FAQ_KEY);

    if(typeof updateCounters==="function"){

        updateCounters();

    }

}

/* ---------- Search ---------- */

function searchFAQ(message){

    if(!message){

        return null;

    }

    const text = message.toLowerCase();

    const faq = loadFAQ();

    for(const item of faq){

        if(

            text.includes(item.question.toLowerCase())

        ){

            return item.answer;

        }

    }

    return null;

}

/* ---------- Prompt ---------- */

function faqToPrompt(){

    return loadFAQ()

    .map(item=>

`Question: ${item.question}
Answer: ${item.answer}`

    )

    .join("\n\n");

}

/* ---------- Export ---------- */

function exportFAQ(){

    return JSON.stringify(

        loadFAQ(),

        null,

        2

    );

}

/* ---------- Import ---------- */

function importFAQ(json){

    try{

        const data = JSON.parse(json);

        if(!Array.isArray(data)){

            return false;

        }

        saveFAQ(data);

        if(typeof updateCounters==="function"){

            updateCounters();

        }

        return true;

    }

    catch(error){

        console.error(error);

        return false;

    }

}

/* ---------- Count ---------- */

function faqCountValue(){

    return loadFAQ().length;

}

console.log("FAQ Engine V5 Loaded");
