/* ==========================================
   WhatsApp AI Assistant
   OpenRouter API
========================================== */

"use strict";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function askAI(userMessage){

    const apiKey = localStorage.getItem("apiKey");

    const model = localStorage.getItem("model") || "deepseek/deepseek-chat-v3-0324:free";

    const systemPrompt = localStorage.getItem("systemPrompt") || "You are a helpful WhatsApp AI Assistant.";

    if(!apiKey){

        showToast("API Key Not Found");

        return null;

    }

    try{

        const response = await fetch(OPENROUTER_URL,{

            method:"POST",

            headers:{

                "Content-Type":"application/json",

                "Authorization":"Bearer " + apiKey,

                "HTTP-Referer":window.location.origin,

                "X-Title":"WhatsApp AI Assistant"

            },

            body:JSON.stringify({

                model:model,

                messages:[

                    {

                        role:"system",

                        content:systemPrompt

                    },

                    {

                        role:"user",

                        content:userMessage

                    }

                ]

            })

        });

        const result = await response.json();

        if(result.error){

            console.error(result);

            showToast(result.error.message);

            return null;

        }

        if(!result.choices){

            showToast("No AI Response");

            return null;

        }

        return result.choices[0].message.content;

    }

    catch(error){

        console.error(error);

        showToast("Network Error");

        return null;

    }

}

/* ==========================================
   Test AI
========================================== */

async function testAI(){

    const reply = await askAI("Hello");

    console.log(reply);

}
