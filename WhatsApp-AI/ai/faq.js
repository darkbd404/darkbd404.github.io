/* ==========================================
   WhatsApp AI Assistant
   FAQ Engine
========================================== */

"use strict";

const FAQ_KEY = "ai_faq";

function loadFAQ() {

    const data = localStorage.getItem(FAQ_KEY);

    if (!data) return [];

    try {

        return JSON.parse(data);

    } catch (e) {

        return [];

    }

}

function saveFAQ(faq) {

    localStorage.setItem(

        FAQ_KEY,

        JSON.stringify(faq)

    );

}

function addFAQ(question, answer) {

    const faq = loadFAQ();

    faq.push({

        id: Date.now(),

        question: question,

        answer: answer

    });

    saveFAQ(faq);

}

function removeFAQ(id) {

    let faq = loadFAQ();

    faq = faq.filter(item => item.id !== id);

    saveFAQ(faq);

}

function clearFAQ() {

    localStorage.removeItem(FAQ_KEY);

}

function searchFAQ(userMessage) {

    const faq = loadFAQ();

    const text = userMessage.toLowerCase();

    for (const item of faq) {

        if (text.includes(item.question.toLowerCase())) {

            return item.answer;

        }

    }

    return null;

}

function faqToPrompt() {

    const faq = loadFAQ();

    let prompt = "";

    faq.forEach(item => {

        prompt +=

            "Q: " +

            item.question +

            "\nA: " +

            item.answer +

            "\n\n";

    });

    return prompt;

}
