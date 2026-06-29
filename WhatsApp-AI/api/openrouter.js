"use strict";

/* ==========================================
   OpenRouter API V4
========================================== */

async function askAI(userMessage){

    const apiKey = localStorage.getItem("apiKey");

    if(!apiKey){

        showToast("API Key Missing");

        return null;

    }

    const model =
        localStorage.getItem("model") ||
        APP.MODEL;

    const systemPrompt =
        localStorage.getItem("systemPrompt") ||
        "You are a professional WhatsApp AI Assistant.";

    const memory =
        typeof memoryToPrompt === "function"
        ? memoryToPrompt(10)
        : "";

    const faq =
        typeof faqToPrompt === "function"
        ? faqToPrompt()
        : "";

    const messages = [

        {
            role:"system",
            content:
                systemPrompt +
                "\n\nFAQ:\n" +
                faq +
                "\nConversation Memory:\n" +
                memory
        },

        {
            role:"user",
            content:userMessage
        }

    ];

    try{

        const response = await fetch(APP.API_URL,{

            method:"POST",

            headers:{

                "Content-Type":"application/json",

                "Authorization":"Bearer " + apiKey,

                "HTTP-Referer":location.origin,

                "X-Title":APP.NAME

            },

            body:JSON.stringify({

                model:model,

                messages:messages

            })

        });

        if(!response.ok){

            const errorText = await response.text();

            console.error("Status:",response.status);

            console.error("Response:",errorText);

            showToast("API Error " + response.status);

            return null;

        }

        const json = await response.json();

        if(json.error){

            console.error(json.error);

            showToast(json.error.message);

            return null;

        }

        if(!json.choices || !json.choices.length){

            showToast("No AI Response");

            return null;

        }

        const reply =
            json.choices[0].message.content.trim();

        if(typeof addMemory==="function"){

            addMemory(
                userMessage,
                reply
            );

        }

        return reply;

    }catch(error){

        console.error("Fetch Error:",error);

        showToast("Network Error");

        return null;

    }

}

/* ==========================================
   Connection Test
========================================== */

async function testConnection(){

    const reply = await askAI("Reply only with OK");

    return !!reply;

}

console.log("OpenRouter V4 Loaded");
