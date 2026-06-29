"use strict";

/* ==========================================
   WhatsApp Engine
========================================== */

const WhatsAppEngine = {

    connected:false,

    phoneNumber:"",

    lastMessage:"",

    lastReply:"",

    connect:function(number){

        this.phoneNumber=number;

        this.connected=true;

        setWAStatus("🟢 Connected");

        showToast("WhatsApp Connected");

    },

    disconnect:function(){

        this.connected=false;

        this.phoneNumber="";

        setWAStatus("🔴 Disconnected");

        showToast("WhatsApp Disconnected");

    },

    async receiveMessage(message){

        if(!this.connected){

            console.warn("WhatsApp Not Connected");

            return;

        }

        this.lastMessage=message;

        console.log("Message :",message);

        const reply=await sendChat(message);

        this.lastReply=reply;

        console.log("Reply :",reply);

        return reply;

    },

    status:function(){

        return{

            connected:this.connected,

            number:this.phoneNumber,

            lastMessage:this.lastMessage,

            lastReply:this.lastReply

        };

    }

};

/* ==========================================
   Test
========================================== */

async function testWhatsApp(){

    WhatsAppEngine.connect("01700000000");

    const reply=

    await WhatsAppEngine.receiveMessage(

        "Hello"

    );

    console.log(reply);

}

console.log("WhatsApp Engine Loaded");
