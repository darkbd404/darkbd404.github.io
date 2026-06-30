"use strict";

/* ==========================================
   WhatsApp AI Assistant
   Version : V6 Stable
   Memory Engine
========================================== */

const MEMORY_KEY = "wa_ai_memory_v6";

/* ---------- Load ---------- */

function getMemory(){

    try{

        const data = localStorage.getItem(MEMORY_KEY);

        return data ? JSON.parse(data) : [];

    }

    catch(error){

        console.error(error);

        return [];

    }

}

/* ---------- Save ---------- */

function saveMemory(memory){

    localStorage.setItem(

        MEMORY_KEY,

        JSON.stringify(memory)

    );

}

/* ---------- Add ---------- */

function addMemory(user,assistant){

    if(!user || !assistant){

        return;

    }

    const memory = getMemory();

    const last = memory[memory.length-1];

    if(

        last &&

        last.user===user &&

        last.assistant===assistant

    ){

        return;

    }

    memory.push({

        id:Date.now(),

        time:new Date().toLocaleString(),

        user:user,

        assistant:assistant

    });

    while(

        memory.length >

        APP.MEMORY_LIMIT

    ){

        memory.shift();

    }

    saveMemory(memory);

}

/* ---------- Delete ---------- */

function deleteMemory(id){

    const memory =

    getMemory().filter(

        item=>item.id!==id

    );

    saveMemory(memory);

}

/* ---------- Clear ---------- */

function clearMemory(){

    localStorage.removeItem(

        MEMORY_KEY

    );

}

/* ---------- Prompt ---------- */

function memoryToPrompt(limit=10){

    return getMemory()

    .slice(-limit)

    .map(item=>

`User: ${item.user}
Assistant: ${item.assistant}`

    )

    .join("\n\n");

}

/* ---------- Export ---------- */

function exportMemory(){

    return JSON.stringify(

        getMemory(),

        null,

        2

    );

}

/* ---------- Import ---------- */

function importMemory(json){

    try{

        const data = JSON.parse(json);

        if(!Array.isArray(data)){

            return false;

        }

        saveMemory(data);

        return true;

    }

    catch(error){

        console.error(error);

        return false;

    }

}

/* ---------- Count ---------- */

function memoryCount(){

    return getMemory().length;

}

console.log("Memory Engine V6 Stable Loaded");
