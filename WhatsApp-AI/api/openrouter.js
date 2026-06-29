/* ==========================================
   WhatsApp AI Assistant
   OpenRouter Engine v2
========================================== */

"use strict";

const OPENROUTER_URL =
"https://openrouter.ai/api/v1/chat/completions";

async function askAI(userMessage){

    /* ---------- FAQ ---------- */

    const faqAnswer = searchFAQ(userMessage);

    if(faqAnswer){

        addMemory(userMessage,faqAnswer);

        return faqAnswer;

    }

    /* ---------- Memory ---------- */

    const memory = memoryToPrompt();

    const apiKey =
    localStorage.getItem("apiKey");

    const model =
    localStorage.getItem("model") ||
    APP_CONFIG.defaultModel;

    const systemPrompt =
    localStorage.getItem("systemPrompt") ||
    "";

    if(!apiKey){

        showToast("API Key Missing");

        return null;

    }

    const messages=[

        {

            role:"system",

            content:
            systemPrompt +
            "\n\nConversation Memory:\n" +
            memory +
            "\n"

        },

        {

            role:"user",

            content:userMessage

        }

    ];

    try{

        const response =
        await fetch(

            OPENROUTER_URL,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json",

                    "Authorization":
                    "Bearer "+apiKey,

                    "HTTP-Referer":
                    window.location.origin,

                    "X-Title":
                    APP_CONFIG.appName

                },

                body:JSON.stringify({

                    model:model,

                    messages:messages

                })

            }

        );

        const result =
        await response.json();

        if(result.error){

            console.error(result);

            showToast(result.error.message);

            return null;

        }

        if(!result.choices){

            showToast("No Response");

            return null;

        }

        const reply =
        result.choices[0]
        .message
        .content;

        addMemory(

            userMessage,

            reply

        );

        return reply;

    }

    catch(error){

        console.error(error);

        showToast("Network Error");

        return null;

    }

}

/* ==========================================
   Test
========================================== */

async function testAI(){

    const reply =
    await askAI("Hello");

    console.log(reply);

}
