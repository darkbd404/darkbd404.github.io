/* script.js */

const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const loading = document.getElementById("loading");
const result = document.getElementById("result");

/*
 Google Apps Script Web App URL
 Deploy করার পরে এখানে URL বসাবেন।
*/
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzXeNK0YID4th9HFBf0DHBmKL_lANtbp5r_9TpxU64hNkzwsXZ8Dgl27S3HzDDAfS7r/exec";

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    result.textContent = "";
    loading.style.display = "block";
    submitBtn.disabled = true;

    const data = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        subject: document.getElementById("subject").value.trim(),
        message: document.getElementById("message").value.trim()
    };

    try {

        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const json = await response.json();

        if (json.success) {
            result.style.color = "green";
            result.textContent =
                "Your message has been sent successfully.";

            form.reset();
        } else {
            result.style.color = "red";
            result.textContent =
                json.message || "Failed to send message.";
        }

    } catch (err) {

        result.style.color = "red";
        result.textContent =
            "Network error. Please try again.";

        console.error(err);

    } finally {

        loading.style.display = "none";
        submitBtn.disabled = false;

    }

});
