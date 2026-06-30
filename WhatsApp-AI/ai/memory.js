"use strict";

/* ==========================================
   Memory Engine V5 (Gemini)
========================================== */

const MEMORY_KEY = "gemini_memory_v5";

/* ---------- Load ---------- */

function getMemory(){

    try{

        const data = localStorage.getItem(MEMORY_KEY);

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

        id:crypto.randomUUID(),

        time:new Date().toLocaleString(),

        user:user,

        assistant:assistant

    });

    while(memory.length > APP.MEMORY_LIMIT){

        memory.shift();

    }

    saveMemory(memory);

    if(typeof updateCounters==="function"){

        updateCounters();

    }

}

/* ---------- Delete ---------- */

function deleteMemory(id){

    const memory = getMemory()

    .filter(item=>item.id!==id);

    saveMemory(memory);

}

/* ---------- Clear ---------- */

function clearMemory(){

    localStorage.removeItem(

        MEMORY_KEY

    );

    if(typeof updateCounters==="function"){

        updateCounters();

    }

}

/* ---------- Prompt ---------- */

function memoryToPrompt(limit=10){

    const memory =

    getMemory().slice(-limit);

    return memory.map(item=>

`User: ${item.user}
Assistant: ${item.assistant}`

    ).join("\n\n");

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

function memoryCountValue(){

    return getMemory().length;

}

console.log("Memory Engine V5 Loaded");
