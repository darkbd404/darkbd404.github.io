"use strict";

/* ==========================================
   WhatsApp AI Assistant V3
   Global Configuration
========================================== */

const APP = {

    NAME : "WhatsApp AI Assistant",

    VERSION : "3.0.0",

    PROVIDER : "OpenRouter",

    MODEL : "deepseek/deepseek-chat-v3-0324:free",

    API_URL :
    "https://openrouter.ai/api/v1/chat/completions",

    LANGUAGE : "en",

    THEME : "light",

    MEMORY_LIMIT : 100,

    FAQ_LIMIT : 500,

    AUTO_REPLY : false,

    DEBUG : true

};

/* ==========================================
   Storage
========================================== */

const Storage = {

save(key,value){

localStorage.setItem(

key,

JSON.stringify(value)

);

},

get(key,defaultValue=null){

try{

const data=

localStorage.getItem(key);

if(!data){

return defaultValue;

}

return JSON.parse(data);

}

catch(e){

return defaultValue;

}

},

remove(key){

localStorage.removeItem(key);

},

clear(){

localStorage.clear();

}

};

/* ==========================================
   App Settings
========================================== */

const Settings = {

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

console.log(

APP.NAME+

" Config Loaded"

);
