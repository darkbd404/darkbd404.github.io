"use strict";

/* ==========================================
   Gemini API V6
========================================== */

async function askAI(userMessage){

    const apiKey = localStorage.getItem("apiKey");

    if(!apiKey){

        showToast("Gemini API Key Missing");

        return null;

    }

    const model =
        localStorage.getItem("model") ||
        APP.MODEL;

    const temperature =
        parseFloat(
            localStorage.getItem("temperature") || "0.7"
        );

    const maxTokens =
        parseInt(
            localStorage.getItem("maxTokens") || "1024"
        );

    const systemPrompt =
        localStorage.getItem("systemPrompt") ||
        "You are a professional WhatsApp AI Assistant.";

    const memory =
        typeof memoryToPrompt==="function"
        ? memoryToPrompt(10)
        : "";

    const faq =
        typeof faqToPrompt==="function"
        ? faqToPrompt()
        : "";

    const prompt =

systemPrompt +

"\n\nFAQ:\n" +

faq +

"\n\nConversation Memory:\n" +

memory +

"\n\nUser:\n" +

userMessage +

"\n\nAssistant:";

    try{

        const response = await fetch(

            APP.API_URL +

            model +

            ":generateContent?key=" +

            apiKey,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                contents:[

                    {

                        parts:[

                            {

                                text:prompt

                            }

                        ]

                    }

                ],

                generationConfig:{

                    temperature:temperature,

                    maxOutputTokens:maxTokens

                }

            })

        });

        const json = await response.json();

        if(!response.ok){

            console.error(json);

            showToast(

                json.error?.message ||

                "Gemini API Error"

            );

            return null;

        }

        const reply =

        json?.candidates?.[0]
        ?.content?.parts?.[0]
        ?.text;

        if(!reply){

            showToast("No AI Response");

            return null;

        }

        return reply.trim();

    }

    catch(error){

        console.error(error);

        showToast("Network Error");

        return null;

    }

}

/* ==========================================
   Test Connection
========================================== */

async function testConnection(){

    try{

        const result = await askAI(

            "Reply only with OK"

        );

        return result !== null;

    }

    catch(error){

        console.error(error);

        return false;

    }

}

console.log("Gemini API V6 Loaded");
