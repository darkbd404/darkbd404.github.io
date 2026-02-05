const BOT_TOKEN = "7720655661:AAGgRje4EIvtZK5vUMZwI0VCmxifwyUnvu0";
const CHAT_ID = "7720655661"; // নিজের chat id বসাও

async function runLookup() {
  const number = document.getElementById("number").value.trim();
  const status = document.getElementById("status");
  const output = document.getElementById("output");

  if (!number) {
    status.innerText = "Number required";
    return;
  }

  status.innerText = "Processing...";
  output.textContent = "";

  try {
    const apiUrl =
      "https://turecaller.pikaapis0.workers.dev/?number=" +
      encodeURIComponent(number);

    const res = await fetch(apiUrl);
    const data = await res.json();

    output.textContent = JSON.stringify(data, null, 2);
    status.innerText = "Success";

    // Send to Telegram
    await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: `Lookup Result:\n${JSON.stringify(data, null, 2)}`
        })
      }
    );

  } catch (e) {
    status.innerText = "Error";
    output.textContent = e.toString();
  }
        }
