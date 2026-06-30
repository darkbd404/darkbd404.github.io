"use strict";

/* ==========================================
   WhatsApp AI Assistant
   Version : V6 Stable
   FAQ Engine
========================================== */

const FAQ_KEY = "wa_ai_faq_v6";

/* ---------- Load ---------- */

function loadFAQ(){

    try{

        const data = localStorage.getItem(FAQ_KEY);

        return data ? JSON.parse(data) : [];

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

        item.question.toLowerCase()===

        question.toLowerCase()

    );

    if(exists){

        return false;

    }

    faq.push({

        id:Date.now(),

        question,

        answer,

        created:new Date().toLocaleString()

    });

    saveFAQ(faq);

    return true;

}

/* ---------- Delete ---------- */

function deleteFAQ(id){

    saveFAQ(

        loadFAQ().filter(

            item=>item.id!==id

        )

    );

}

/* ---------- Clear ---------- */

function clearFAQ(){

    localStorage.removeItem(

        FAQ_KEY

    );

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

            text.includes(

                item.question.toLowerCase()

            )

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

        return true;

    }

    catch(error){

        console.error(error);

        return false;

    }

}

/* ---------- Count ---------- */

function faqCount(){

    return loadFAQ().length;

}

console.log("FAQ Engine V6 Stable Loaded");
