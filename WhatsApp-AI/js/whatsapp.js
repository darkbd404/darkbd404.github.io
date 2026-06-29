"use strict";

/* ==========================================
   WhatsApp Bridge V3
========================================== */

const WhatsAppBridge = {

connected:false,

device:"",

lastSender:"",

lastMessage:"",

lastReply:"",

queue:[]

};

/* ---------- Connect ---------- */

function connectWhatsApp(device="Android"){

WhatsAppBridge.connected=true;

WhatsAppBridge.device=device;

if(typeof setWAStatus==="function"){

setWAStatus("🟢 Connected");

}

console.log("WhatsApp Connected");

}

/* ---------- Disconnect ---------- */

function disconnectWhatsApp(){

WhatsAppBridge.connected=false;

WhatsAppBridge.device="";

if(typeof setWAStatus==="function"){

setWAStatus("🔴 Disconnected");

}

}

/* ---------- Receive ---------- */

async function receiveWhatsAppMessage(sender,message){

if(!WhatsAppBridge.connected){

console.warn("WhatsApp Offline");

return;

}

WhatsAppBridge.lastSender=sender;

WhatsAppBridge.lastMessage=message;

const reply=await processChat(message);

WhatsAppBridge.lastReply=reply;

WhatsAppBridge.queue.push({

sender,

message,

reply,

time:Date.now()

});

return reply;

}

/* ---------- Queue ---------- */

function getQueue(){

return WhatsAppBridge.queue;

}

function clearQueue(){

WhatsAppBridge.queue=[];

}

/* ---------- Status ---------- */

function getWhatsAppStatus(){

return{

connected:WhatsAppBridge.connected,

device:WhatsAppBridge.device,

lastSender:WhatsAppBridge.lastSender,

lastMessage:WhatsAppBridge.lastMessage,

lastReply:WhatsAppBridge.lastReply,

queue:getQueue().length

};

}

/* ---------- Test ---------- */

async function testWhatsApp(){

connectWhatsApp("Demo Device");

const reply=await receiveWhatsAppMessage(

"Test User",

"Hello"

);

console.log(reply);

}

console.log("WhatsApp Bridge V3 Loaded");
