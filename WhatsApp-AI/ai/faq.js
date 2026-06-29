"use strict";

/* ==========================================
   FAQ Engine V3
========================================== */

const FAQ_KEY = "ai_faq_v3";

/* ---------- Load ---------- */

function loadFAQ(){

    try{

        return JSON.parse(

            localStorage.getItem(FAQ_KEY)

        ) || [];

    }

    catch(e){

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

    if(!question || !answer){

        return false;

    }

    const faq=loadFAQ();

    const exists=faq.find(item=>

        item.question.toLowerCase()

        ===

        question.toLowerCase()

    );

    if(exists){

        return false;

    }

    faq.push({

        id:Date.now(),

        question:question,

        answer:answer

    });

    saveFAQ(faq);

    return true;

}

/* ---------- Delete ---------- */

function deleteFAQ(id){

    const faq=

    loadFAQ().filter(

        item=>item.id!==id

    );

    saveFAQ(faq);

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

    const text=

    message.toLowerCase();

    const faq=loadFAQ();

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

    const faq=loadFAQ();

    let prompt="";

    faq.forEach(item=>{

        prompt +=

        "Q: "+

        item.question+

        "\nA: "+

        item.answer+

        "\n\n";

    });

    return prompt;

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

        const data=

        JSON.parse(json);

        if(Array.isArray(data)){

            saveFAQ(data);

            return true;

        }

    }

    catch(e){

        console.error(e);

    }

    return false;

}

console.log("FAQ Engine V3 Loaded");
