"use strict";

/* ==========================================
   Memory Engine V3
========================================== */

const MEMORY_KEY = "ai_memory_v3";

/* ---------- Load ---------- */

function getMemory(){

    try{

        return JSON.parse(

            localStorage.getItem(MEMORY_KEY)

        ) || [];

    }

    catch(e){

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

    const memory=getMemory();

    const last=memory[memory.length-1];

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

        memory.length>

        APP.MEMORY_LIMIT

    ){

        memory.shift();

    }

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

    const memory=getMemory()

    .slice(-limit);

    let text="";

    memory.forEach(item=>{

        text+=

        "User: "+

        item.user+

        "\nAssistant: "+

        item.assistant+

        "\n\n";

    });

    return text;

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

        const data=

        JSON.parse(json);

        if(Array.isArray(data)){

            saveMemory(data);

            return true;

        }

    }

    catch(e){

        console.error(e);

    }

    return false;

}

console.log("Memory Engine V3 Loaded");
