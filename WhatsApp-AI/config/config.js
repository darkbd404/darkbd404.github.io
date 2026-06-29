/* ==========================================
   WhatsApp AI Assistant
   Configuration
========================================== */

"use strict";

const APP_CONFIG = {

    appName: "WhatsApp AI Assistant",

    version: "1.0.0",

    aiProvider: "OpenRouter",

    defaultModel: "deepseek/deepseek-chat-v3-0324:free",

    language: "en",

    autoReply: false,

    ignoreGroups: false,

    ignoreContacts: false,

    replyDelay: 2,

    darkMode: true,

    memoryLimit: 100,

    logLimit: 500

};


/* ==========================================
   Save Config
========================================== */

function saveConfig(){

    localStorage.setItem(

        "appConfig",

        JSON.stringify(APP_CONFIG)

    );

}


/* ==========================================
   Load Config
========================================== */

function loadConfig(){

    const data = localStorage.getItem("appConfig");

    if(data){

        try{

            const config = JSON.parse(data);

            Object.assign(APP_CONFIG, config);

        }

        catch(e){

            console.error(e);

        }

    }

}


/* ==========================================
   Reset Config
========================================== */

function resetConfig(){

    localStorage.removeItem("appConfig");

    saveConfig();

}


/* ==========================================
   Initialize
========================================== */

loadConfig();

saveConfig();
