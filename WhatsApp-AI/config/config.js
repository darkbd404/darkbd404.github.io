"use strict";

/* ==========================================
   WhatsApp AI Assistant
   Version : V6 Stable
   Powered by Google Gemini
========================================== */

const APP = {

    NAME : "WhatsApp AI Assistant",

    VERSION : "6.0.0",

    PROVIDER : "Google Gemini",

    MODEL : "gemini-2.5-flash",

    API_URL :
    "https://generativelanguage.googleapis.com/v1beta/models/",

    LANGUAGE : "en",

    THEME : "light",

    MEMORY_LIMIT : 100,

    FAQ_LIMIT : 500,

    AUTO_REPLY : false,

    DEBUG : true

};

/* ==========================================
   Local Storage
========================================== */

get(key, defaultValue = null){

    try{

        const data = localStorage.getItem(key);

        if(data === null){

            return defaultValue;

        }

        try{

            return JSON.parse(data);

        }catch{

            return data;

        }

    }catch(error){

        console.error(error);

        return defaultValue;

    }

}

/* ==========================================
   Settings
========================================== */

const Settings={

    load(){

        APP.THEME=

        Storage.get(
            "theme",
            "light"
        );

        APP.AUTO_REPLY=

        Storage.get(
            "autoReply",
            false
        );

    },

    save(){

        Storage.save(
            "theme",
            APP.THEME
        );

        Storage.save(
            "autoReply",
            APP.AUTO_REPLY
        );

    }

};

Settings.load();

console.log(APP.NAME+" V6 Stable Config Loaded");
