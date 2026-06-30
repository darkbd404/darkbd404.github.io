"use strict";

/* ==========================================
   Gemini API V5
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

    const prompt =

systemPrompt +

"\n\nFAQ:\n" +

faq +

"\n\nConversation Memory:\n" +

memory +

"\n\nUser:\n" +

userMessage;

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

                ]

            })

        });

        const json = await response.json();

        if(!response.ok){

            console.error(json);

            showToast(

                json.error?.message ||

                "Gemini Error"

            );

            return null;

        }

        const reply =

        json.candidates?.[0]

        ?.content

        ?.parts?.[0]

        ?.text;

        if(!reply){

            showToast("No AI Response");

            return null;

        }

        if(typeof addMemory==="function"){

            addMemory(

                userMessage,

                reply

            );

        }

        return reply;

    }

    catch(error){

        console.error(error);

        showToast("Network Error");

        return null;

    }

}

/* ==========================================
   Connection Test
========================================== */

async function testConnection(){

    const reply = await askAI(

        "Reply only with OK"

    );

    return !!reply;

}

console.log("Gemini API Loaded");
